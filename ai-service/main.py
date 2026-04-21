from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import face_recognition
import base64
import numpy as np
import io
from PIL import Image

app = FastAPI(title="Smart Attendance AI Service", version="1.0.0")


# ──────────────────────────────────────────────
# Request Models
# ──────────────────────────────────────────────

class EncodeRequest(BaseModel):
    image_base64: str


class MatchRequest(BaseModel):
    image_base64: str
    known_encodings: list  # List of {student_id, encoding}


# ──────────────────────────────────────────────
# Helper: Base64 → NumPy image array
# ──────────────────────────────────────────────

def decode_image(base64_str: str) -> np.ndarray:
    """Convert a base64-encoded image string into a NumPy RGB array."""
    try:
        # Strip the data URI prefix if present (e.g., "data:image/jpeg;base64,")
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]

        img_data = base64.b64decode(base64_str)
        image = Image.open(io.BytesIO(img_data)).convert("RGB")
        return np.array(image)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image data")


# ──────────────────────────────────────────────
# ROUTE: Health Check
# ──────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ai-service"}


# ──────────────────────────────────────────────
# ROUTE: Encode Face (Student Registration)
# ──────────────────────────────────────────────

@app.post("/encode")
async def encode_face(request: EncodeRequest):
    """
    Takes a base64 image of a student's face.
    Returns the 128-dimensional face encoding vector.
    Used during student registration.
    """
    image = decode_image(request.image_base64)
    encodings = face_recognition.face_encodings(image)

    if not encodings:
        raise HTTPException(status_code=400, detail="No face detected in image")

    if len(encodings) > 1:
        raise HTTPException(status_code=400, detail="Multiple faces detected. Please capture one face at a time.")

    # Return the 128-d vector as a list of floats
    return {"encoding": encodings[0].tolist()}


# ──────────────────────────────────────────────
# ROUTE: Match Face (Attendance Scanning)
# ──────────────────────────────────────────────

@app.post("/match")
async def match_face(request: MatchRequest):
    """
    Takes a live base64 image and a list of known encodings.
    Compares the live face against all known faces.
    Returns the student_id of the best match, or null.
    """
    try:
        live_img = decode_image(request.image_base64)
        live_encodings = face_recognition.face_encodings(live_img)

        if not live_encodings:
            return {"student_id": None, "confidence": None}

        live_face = live_encodings[0]

        # Extract IDs and encoding vectors from the candidates
        ids = [c["student_id"] for c in request.known_encodings]
        known_faces = [np.array(c["encoding"]) for c in request.known_encodings]

        if not known_faces:
            return {"student_id": None, "confidence": None}

        # Calculate face distances (lower = more similar)
        distances = face_recognition.face_distance(known_faces, live_face)

        # Find the best match
        best_index = np.argmin(distances)
        best_distance = distances[best_index]

        # Threshold: 0.6 is the default, lower = stricter
        if best_distance <= 0.6:
            confidence = round((1 - best_distance) * 100, 1)
            return {"student_id": ids[best_index], "confidence": confidence}

        return {"student_id": None, "confidence": None}

    except Exception as e:
        print(f"Match Error: {e}")
        return {"student_id": None, "confidence": None}


# ──────────────────────────────────────────────
# Entry Point
# ──────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
