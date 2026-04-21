import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ClassDetail from './pages/ClassDetail';
import AddStudent from './pages/AddStudent';
import Scanner from './pages/Scanner';

const Layout = ({ children }) => {
  const location = useLocation();
  const isScannerPath = location.pathname.startsWith('/scanner');
  const isAuthPath = location.pathname === '/' || location.pathname === '/register';
  const shouldHideNavbar = isScannerPath || isAuthPath;

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      {children}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/class/:id" element={<ClassDetail />} />
              <Route path="/class/:id/add-student" element={<AddStudent />} />
              <Route path="/scanner/:classId/:sessionId" element={<Scanner />} />
            </Route>
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
