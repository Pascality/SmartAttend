import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <LoadingSpinner text="Checking authentication..." />;
    }

    return user ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
