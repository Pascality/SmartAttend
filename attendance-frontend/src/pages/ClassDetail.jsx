import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const ClassDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('students'); // 'students', 'report', 'history'
    const [classData, setClassData] = useState(null);
    const [students, setStudents] = useState([]);
    const [report, setReport] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAllData();
    }, [id]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch basic class details by finding it in 'my-classes'
            const classesRes = await api.get('/classes/my-classes');
            const currentClass = classesRes.data.find(c => c.id === parseInt(id));
            if (!currentClass) throw new Error("Class not found");
            setClassData(currentClass);

            // Fetch Students
            const studentsRes = await api.get(`/classes/${id}/students`);
            setStudents(studentsRes.data);

            // Fetch Report
            const reportRes = await api.get(`/classes/${id}/report`);
            setReport(reportRes.data);

            // Fetch History
            const historyRes = await api.get(`/attendance/session/${id}/history`);
            setHistory(historyRes.data);

            setError('');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load class details.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartSession = async () => {
        try {
            const res = await api.post(`/attendance/session/start/${id}`);
            // Redirect to the kiosk scanner mode with the new session ID
            navigate(`/scanner/${id}/${res.data.sessionId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start session.');
        }
    };

    const handleDeleteClass = async () => {
        if (!window.confirm(`Are you sure you want to delete "${classData.className}"? This will permanently remove all students, sessions, and attendance records.`)) {
            return;
        }
        try {
            await api.delete(`/classes/${id}`);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete class.');
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!classData) return <div className="page"><div className="alert alert-error">{error}</div></div>;

    return (
        <div className="page">
            <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <h1 className="page-title">{classData.className}</h1>
                <div className="card-meta mt-sm">
                    <span className="card-badge">Code: {classData.classCode}</span>
                    <span>•</span>
                    <span>{students.length} Students</span>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="action-bar">
                <button className="btn btn-white" onClick={handleStartSession}>
                    Take Attendance
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate(`/class/${id}/add-student`, { state: { classCode: classData.classCode } })}
                >
                    + Add Student
                </button>
            </div>

            <button
                className="btn-ghost"
                onClick={handleDeleteClass}
                style={{
                    color: 'var(--danger)',
                    fontSize: 'var(--font-sm)',
                    marginBottom: 'var(--space-lg)',
                    cursor: 'pointer',
                    background: 'transparent',
                    border: 'none',
                    fontFamily: 'var(--font-family)'
                }}
            >
                🗑 Delete Class
            </button>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('students')}
                >
                    Students
                </button>
                <button
                    className={`tab ${activeTab === 'report' ? 'active' : ''}`}
                    onClick={() => setActiveTab('report')}
                >
                    Report
                </button>
                <button
                    className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
            </div>

            {/* Students Tab */}
            {activeTab === 'students' && (
                <div className="tab-content">
                    {students.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">👥</div>
                            <div className="empty-state-text">No students registered yet.</div>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Roll Number</th>
                                        <th>Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s.id}>
                                            <td><strong>{s.rollNumber}</strong></td>
                                            <td>{s.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Report Tab */}
            {activeTab === 'report' && (
                <div className="tab-content">
                    {report.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-text">No attendance data yet.</div>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Attended</th>
                                        <th>%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.map((r, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <strong>{r.rollNumber}</strong><br />
                                                <span className="text-muted text-sm">{r.studentName}</span>
                                            </td>
                                            <td>{r.attendedSessions} / {r.totalSessions}</td>
                                            <td>
                                                <span className={`pct-badge ${r.percentage >= 75 ? 'pct-high' :
                                                        r.percentage >= 50 ? 'pct-mid' : 'pct-low'
                                                    }`}>
                                                    {r.percentage}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="tab-content">
                    {history.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-text">No past sessions.</div>
                        </div>
                    ) : (
                        <div className="class-list">
                            {history.map(session => (
                                <div key={session.sessionId} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <h3 className="card-title">{session.date.split(' ')[0]}</h3>
                                            <div className="card-meta">{session.date.split(' ')[1]}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <strong style={{ fontSize: '1.2rem', color: 'var(--success)' }}>
                                                {session.studentCount}
                                            </strong>
                                            <div className="text-sm text-muted">Present</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClassDetail;
