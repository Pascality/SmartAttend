import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const teacherId = localStorage.getItem('teacherId');
        const teacherName = localStorage.getItem('teacherName');

        if (token && teacherId) {
            setUser({ id: teacherId, name: teacherName, token });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, teacherId, teacherName } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('teacherId', teacherId);
            localStorage.setItem('teacherName', teacherName);
            
            setUser({ id: teacherId, name: teacherName, token });
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed. Please check your credentials.' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('teacherId');
        localStorage.removeItem('teacherName');
        setUser(null);
    };

    const register = async (name, email, password) => {
        try {
            await api.post('/auth/register', { name, email, password });
            return await login(email, password); // Auto login after register
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Registration failed.' 
            };
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};
