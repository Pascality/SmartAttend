import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="navbar">
            <Link to="/dashboard" className="navbar-brand">
                <img src="/logo.png" alt="Logo" className="logo-icon" />
                SmartAttend
            </Link>
            
            {user && (
                <>
                    {/* Desktop Actions - Hidden on mobile via CSS */}
                    <div className="navbar-actions desktop-actions">
                        <span className="navbar-user">Hi, {user.name}</span>
                        <button onClick={handleLogout} className="btn-ghost">
                            Logout
                        </button>
                    </div>

                    {/* Mobile Hamburger Button - Hidden on desktop via CSS */}
                    <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle menu">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {isMobileMenuOpen ? (
                                <>
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </>
                            ) : (
                                <>
                                    <line x1="3" y1="12" x2="21" y2="12"></line>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <line x1="3" y1="18" x2="21" y2="18"></line>
                                </>
                            )}
                        </svg>
                    </button>

                    {/* Mobile Dropdown Menu */}
                    {isMobileMenuOpen && (
                        <div className="mobile-dropdown">
                            <div className="mobile-dropdown-header">
                                <div className="mobile-dropdown-avatar">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                                <div className="mobile-dropdown-name">{user.name}</div>
                                <div className="mobile-dropdown-greeting">Hi, {user.name}</div>
                            </div>
                            <div className="mobile-dropdown-divider"></div>
                            <button onClick={handleLogout} className="mobile-dropdown-logout">
                                Logout
                            </button>
                        </div>
                    )}
                </>
            )}
        </nav>
    );
};

export default Navbar;
