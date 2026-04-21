import React, { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Camera from '../components/Camera';
import LoadingSpinner from '../components/LoadingSpinner';

const AddStudent = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Fallback if classCode wasn't passed in state (though it usually is)
    const classCode = location.state?.classCode || '';

    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleFaceCapture = async (base64Image) => {
        if (!name.trim() || !rollNumber.trim()) {
            setError("Please enter Name and Roll Number before capturing face.");
            return;
        }

        setError('');
        setSuccess('');
        setIsRegistering(true);

        try {
            await api.post('/students/register', {
                name,
                rollNumber,
                classCode,
                // The AI service expects the pure base64 without the data:image/jpeg;base64, prefix
                image: base64Image.split(',')[1] 
            });

            setSuccess(`Successfully registered ${name}!`);
            // Reset fields for next student
            setName('');
            setRollNumber('');
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register student. Face might not be clear, or AI service is down.');
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className="page">
            <Link to={`/class/${id}`} className="back-link">← Back to Class</Link>
            
            <div className="page-header">
                <h1 className="page-title">Add Student</h1>
                <p className="page-subtitle">Enter details and capture face to register.</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {isRegistering ? (
                <LoadingSpinner text={`Analyzing face and registering ${name}...`} />
            ) : (
                <div className="card">
                    <div className="form-group">
                        <label className="form-label">Roll Number *</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            placeholder="e.g. 21CS3010"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Parth Kumar"
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginTop: '2rem' }}>
                        <label className="form-label" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            Position face in frame and capture
                        </label>
                        <Camera 
                            onCapture={handleFaceCapture} 
                            btnText="Capture & Register" 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddStudent;
