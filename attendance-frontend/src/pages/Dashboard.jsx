import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Create Class State
    const [isCreating, setIsCreating] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [createError, setCreateError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await api.get('/classes/my-classes');
            setClasses(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load your classes.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        if (!newClassName.trim()) return;

        setCreateError('');
        try {
            await api.post('/classes/create', { className: newClassName });
            setNewClassName('');
            setIsCreating(false);
            fetchClasses(); // Refresh list
        } catch (err) {
            setCreateError(err.response?.data?.message || 'Failed to create class.');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="page">
            <div className="page-header dashboard-header">
                <div>
                    <h1 className="page-title">My Classes</h1>
                    <p className="page-subtitle">Manage your students and attendance</p>
                </div>
                {!isCreating && (
                    <button className="btn btn-white btn-sm" style={{ width: 'auto' }} onClick={() => setIsCreating(true)}>
                        + New Class
                    </button>
                )}
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {isCreating && (
                <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--accent)' }}>
                    <h3 className="card-title">Create New Class</h3>
                    {createError && <div className="alert alert-error">{createError}</div>}
                    <form onSubmit={handleCreateClass}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <input 
                                type="text"
                                className="form-input"
                                placeholder="e.g. CS50 - 4th Sem"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="submit" className="btn btn-white btn-sm">Create</button>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsCreating(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {classes.length === 0 && !isCreating && !loading ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <div className="empty-state-text">You haven't created any classes yet.</div>
                    <button className="btn btn-white" onClick={() => setIsCreating(true)}>
                        Create Your First Class
                    </button>
                </div>
            ) : (
                <div className="class-list">
                    {classes.map(cls => (
                        <div key={cls.id} className="card card-clickable" onClick={() => navigate(`/class/${cls.id}`)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 className="card-title">{cls.className}</h3>
                                    <div className="card-meta">
                                        <span className="card-badge">Code: {cls.classCode}</span>
                                        <span>•</span>
                                        <span>{cls.studentCount} Students</span>
                                    </div>
                                </div>
                                <div style={{ color: 'var(--text-primary)', opacity: 0.5, fontSize: '1.2rem' }}>→</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
