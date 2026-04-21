import React, { useRef, useState, useCallback, useEffect } from 'react';

const Camera = ({ onCapture, btnText = "Capture Photo" }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const streamRef = useRef(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const mediaStream = videoRef.current.srcObject;
            mediaStream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }, []);

    const startCamera = async () => {
        try {
            // Simplify constraints to maximize compatibility
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true
            });
            
            setStream(mediaStream);
            streamRef.current = mediaStream;
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play().catch(e => console.error("Error playing video:", e));
            }
            setError(null);
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Could not access camera. Please ensure permissions are granted.");
        }
    };

    // Setup and cleanup
    useEffect(() => {
        startCamera();
        
        return () => {
            stopCamera();
        };
    }, [stopCamera]); // Empty dependency array prevents the infinite loop!

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        setIsCapturing(true);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Ensure canvas dimensions match video intrinsic dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        
        // Since we scaleX(-1) in CSS to make it act like a mirror,
        // we should arguably mirror the capture too, but face_recognition
        // doesn't mind flipped faces. Standardizing without flip in data:
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 jpeg
        const base64Image = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(base64Image);
        
        setTimeout(() => setIsCapturing(false), 300);
    };

    if (error) {
        return (
            <div className="camera-container" style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="alert alert-error">{error}</div>
                <button type="button" className="btn btn-secondary" onClick={startCamera}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="camera-widget">
            <div className="camera-container" style={{ marginBottom: '1rem' }}>
                <video 
                    ref={videoRef} 
                    className="camera-video" 
                    autoPlay 
                    playsInline 
                    muted 
                />
                
                <div className="camera-overlay">
                    <div className="camera-frame"></div>
                </div>
                
                <canvas ref={canvasRef} className="camera-canvas" />
            </div>
            
            <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleCapture}
                disabled={isCapturing || !stream}
            >
                {isCapturing ? '📸 Capturing...' : `📸 ${btnText}`}
            </button>
        </div>
    );
};

export default Camera;
