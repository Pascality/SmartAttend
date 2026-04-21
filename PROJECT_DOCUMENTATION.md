# Smart Attendance System - Technical Deep Dive

This document provides an exhaustive breakdown of the Smart Attendance System, detailing the roles of every major folder, file, and sub-system.

---

## 1. System Architecture Overview

The project is a decoupled microservices-inspired system containing three primary stacks:

1.  **Frontend (React/Vite)**: The user interface where teachers manage classes and run scanning sessions.
2.  **Backend (Spring Boot)**: The "brain" that manages the database, handles authentication, and orchestrates the AI workflow.
3.  **AI Service (FastAPI/Python)**: A specialized machine learning service that processes images and returns facial recognition results.

---

## 2. Frontend Deep Dive (`attendance-frontend`)

Located in the `/attendance-frontend` directory.

### Core Folders & Responsibilities:
*   **`src/api/`**: 
    *   Contains centralized logic for outgoing HTTP requests using Axios.
    *   Handles default base URLs and adds JWT tokens to headers for authenticated requests.
*   **`src/context/`**:
    *   **`AuthContext.jsx`**: Manages the global state of the logged-in user (Teacher). It stores the session token and provides `login`/`logout` functions to the entire app.
*   **`src/components/`**: 
    *   Includes reusable UI elements like `Navbar.jsx`, `GlassCard.jsx`, and custom Button components.
    *   **Webcam Components**: Logic for accessing the device camera, capturing frames, and converting them to Base64.
*   **`src/pages/`**:
    *   `Login.jsx` / `Signup.jsx`: Teacher authentication forms.
    *   `Dashboard.jsx`: Shows a summary of the teacher's classes.
    *   `RegisterStudent.jsx`: Handles biometric registration. It sends a high-quality capture to the AI service via the backend to create a "facial profile."
    *   `ClassDetail.jsx`: The most complex page. It manages live scanning sessions, lists students, and visualizes attendance records.
*   **`src/App.css`**: Contains the custom "Glassmorphism" design system, using modern CSS properties like `backdrop-filter`, gradients, and custom animations to provide a premium feel.

---

## 3. Backend Deep Dive (`attendance-backend`)

Located in the `/attendance-backend` directory. Built with Spring Boot 3.x and Java 21.

### Package Breakdown (`com.smartattend.attendance`):
*   **`model/` (Entities)**:
    *   `Teacher.java`: Represents a registered user who can manage classes.
    *   `Student.java`: Stores name, department, and the **128-d facial encoding** (as a JSON or serialized list).
    *   `Clazz.java`: Represents a class/subject created by a teacher.
    *   `AttendanceSession.java`: Represents a specific instance of a class being "in session" for scanning.
    *   `AttendanceRecord.java`: Links a `Student` and a `Session` with a status (Present/Absent).
*   **`controller/` (API Endpoints)**:
    *   `AuthController.java`: Handles `/api/auth/login` and `/api/auth/register`.
    *   `StudentController.java`: Manages student registration and profile viewing.
    *   `ClazzController.java`: Handles class creation and session management.
    *   `AttendanceController.java`: The core scanning endpoint that receives images from the frontend.
*   **`service/` (Business Logic)**:
    *   `AIService.java`: The bridge to Python. It sends images to port 8001 and parses the facial recognition results.
    *   `AttendanceService.java`: Logic for starting/stopping sessions and marking attendance.
    *   `StudentService.java`: Handles student CRUD and ensures encodings are correctly stored.
*   **`repository/` (Database Access)**:
    *   Spring Data JPA interfaces (`StudentRepository`, `ClazzRepository`, etc.) that handle CRUD operations for MySQL.
*   **`config/`**:
    *   `SecurityConfig.java`: Configures Spring Security with JWT filters to protect routes.
    *   `CorsConfig.java`: Permits the React frontend to communicate with the Java server.
*   **`dto/`**:
    *   Standardized objects for request/response payloads to keep the API decoupled from the database model.

---

## 4. AI Service Deep Dive (`ai-service`)

Located in the `/ai-service` directory. Built with Python and FastAPI.

### System Workflow:
1.  **Image Decoding**: Receives a Base64 string from Java, strips the header (`data:image/jpeg;base64`), and converts it into a NumPy array using PIL and NumPy.
2.  **Face Localization**: Uses the **dlib HOG model** to find exactly where a face is located in the image.
3.  **Facial Embedding (The Math)**:
    *   The localized face is passed through a pre-trained **ResNet-34** Deep Learning model.
    *   The model outputs a unique **128-dimensional vector** of floats.
4.  **Matching (Euclidean Distance)**:
    *   The system compares the live vector against a list of known vectors provided by the backend.
    *   It calculates the "straight-line distance" between points in 128D space.
    *   **Thresholding**: If the distance is `< 0.6`, it's a match. The closer to 0, the higher the confidence.
5.  **Response**: Returns the `student_id` or `None` back to the Java backend.

---

## 5. Security & Data Flow Summary

*   **Security**: Authentication is handled via **Stateless JWTs**. A teacher logs in, gets a token, and the Frontend includes this token in the `Authorization: Bearer <token>` header for every subsequent action.
*   **Database**: **MySQL** stores relational data (Teacher-Class-Student) and the biometric encodings as blob or string data.
*   **Inter-Service Communication**:
    *   Frontend ↔ Backend: REST over HTTP (Port 8080).
    *   Backend ↔ AI Service: REST over HTTP (Port 8001).

This modular design ensures that the AI logic (Python) can be updated or replaced without breaking the user database or the web interface.
