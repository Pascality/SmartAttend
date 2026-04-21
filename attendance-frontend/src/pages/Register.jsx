import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { register, user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard');
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await register(name, email, password);
        
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
            setIsLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (user) return null;

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header" style={{ marginBottom: '1.5rem' }}>
                    <img src="/logo.png" alt="SmartAttend Logo" className="auth-logo" />
                    <h1 className="auth-title">Teacher Signup</h1>
                    <p className="auth-subtitle">Create your account to start managing attendance.</p>
                </div>

                <div className="auth-form">
                    {error && <div className="alert alert-error">{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Prof. John Doe"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input 
                                type="email" 
                                className="form-input" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="teacher@university.edu"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input 
                                type="password" 
                                className="form-input" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        
                        <button type="submit" className="btn btn-white" disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                </div>

                <div className="auth-footer">
                    Already have an account? <Link to="/">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
