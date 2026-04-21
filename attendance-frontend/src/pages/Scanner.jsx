import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Scanner = () => {
    const { classId, sessionId } = useParams();
    const navigate = useNavigate();

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const streamRef = useRef(null);
    
    // State
    const [presentCount, setPresentCount] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [scanState, setScanState] = useState('idle'); // idle, scanning, success, already, fail
    const [matchName, setMatchName] = useState('');
    const [flashClass, setFlashClass] = useState('');
    const [isEnding, setIsEnding] = useState(false);

    // 1. Initialize Camera on load
    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            setStream(mediaStream);
            streamRef.current = mediaStream;
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play();
            }
        } catch (err) {
            console.error("Camera access error:", err);
            alert("Could not access camera for scanner.");
        }
    }, []);

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

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, [startCamera, stopCamera]);

    // 2. The Capture & Scan Loop
    const runScan = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || isScanning || isEnding) return;

        const video = videoRef.current;
        // Wait until video has dimensions
        if (video.videoWidth === 0) return;

        setIsScanning(true);

        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

        try {
            const res = await api.post(`/attendance/scan/${sessionId}`, { image: base64Image });
            const data = res.data;

            if (data.status === 'ALREADY_MARKED') {
                triggerFlash('scanner-flash-already', `Already Marked`, data.studentName);
            } else {
                setPresentCount(prev => prev + 1);
                triggerFlash('scanner-flash-success', `Present`, data.studentName);
            }
        } catch (err) {
            // 404 No Match or other error
            triggerFlash('scanner-flash-fail');
        } finally {
            // We want to scan fairly often. If we succeeded/failed, wait a bit before next scan.
            setTimeout(() => {
                setIsScanning(false);
            }, 1000); 
        }
    }, [sessionId, isScanning, isEnding]);

    // 3. Auto-trigger scan every 2 seconds if not currently scanning
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isScanning && stream) {
                runScan();
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [isScanning, stream, runScan]);

    const triggerFlash = (cssClass, title = '', subtitle = '') => {
        setFlashClass(''); // reset
        requestAnimationFrame(() => {
            setMatchName(title ? { title, subtitle } : null);
            setFlashClass(cssClass);
        });
    };

    const handleEndSession = async () => {
        try {
            setIsEnding(true);
            stopCamera();
            await api.post(`/attendance/session/end/${sessionId}`);
            navigate(`/class/${classId}`); // Return to class details
        } catch (err) {
            alert("Failed to end session: " + (err.response?.data?.message || err.message));
            setIsEnding(false);
        }
    };

    return (
        <div className="scanner-page">
            {/* The Flash Overlay */}
            {flashClass && <div className={`scanner-flash ${flashClass}`} onAnimationEnd={() => setFlashClass('')} />}
            
            {/* The Match Text Pop */}
            {matchName && flashClass && (
                <div className="scanner-match-name">
                    <h2>{matchName.title}</h2>
                    <p>{matchName.subtitle}</p>
                </div>
            )}

            <div className="scanner-video-wrapper">
                <video ref={videoRef} autoPlay playsInline muted />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                <div className="camera-overlay">
                    <div className="camera-frame"></div>
                </div>

                <div className="scanner-status">
                    <div className="scanner-status-text">
                        {isScanning ? 'Processing...' : 'Show your face'}
                    </div>
                </div>
            </div>

            <div className="scanner-controls">
                <div className="scanner-count">
                    Marked Present<br/>
                    <strong>{presentCount}</strong>
                </div>
                
                <button 
                    className="btn btn-danger" 
                    onClick={handleEndSession}
                    disabled={isEnding}
                    style={{ width: 'auto' }}
                >
                    End Session
                </button>
            </div>
        </div>
    );
};

export default Scanner;
