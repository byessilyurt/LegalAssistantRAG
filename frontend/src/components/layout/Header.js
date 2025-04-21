import React from 'react';
import { useAuthentication } from '../../auth/auth-hooks';
import UserProfile from '../UserProfile';
import LoginButton from '../LoginButton';
import '../../styles/layout.css';

const Header = ({ onSidebarToggle }) => {
  const { isAuthenticated, isLoading } = useAuthentication();

  return (
    <header className="app-header">
      <div className="header-left">
        <button 
          className="hamburger-menu" 
          onClick={onSidebarToggle}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="app-title">
          <h2>Legal Assistant 🇵🇱</h2>
          <p className="subtitle">Ask questions about Polish legal matters</p>
        </div>
      </div>
      
      <div className="header-right">
        <div className="auth-controls">
          {isLoading ? (
            <div className="auth-loading-small">Loading...</div>
          ) : isAuthenticated ? (
            <UserProfile />
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 