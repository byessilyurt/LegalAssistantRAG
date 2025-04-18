import React, { useState, useEffect } from 'react';
import { useAuthentication } from '../auth/auth-hooks';
import '../styles/auth.css';

const LoginButton = () => {
  const { loginWithPopup, isLoading, isAuthenticated } = useAuthentication();
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  
  // Close login menu if user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setShowLoginMenu(false);
    }
  }, [isAuthenticated]);

  const handleLogin = (connection) => async (e) => {
    e.preventDefault();
    try {
      await loginWithPopup({
        authorizationParams: {
          connection: connection,
          prompt: 'login',
        }
      });
      
      // Force a page reload to ensure Auth0 state is properly synchronized
      if (window.location.pathname === '/') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleShowMenu = () => {
    setShowLoginMenu(!showLoginMenu);
  };

  // Don't render if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="login-container">
      <button 
        className="login-button" 
        onClick={handleShowMenu}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Login'}
      </button>
      
      {showLoginMenu && (
        <div className="login-menu">
          <div className="login-menu-header">
            <h3>Login to Polish Law Assistant</h3>
            <button className="close-button" onClick={handleShowMenu}>×</button>
          </div>
          <p className="login-description">
            Login to save your conversations and access your history across devices.
          </p>
          <div className="login-providers">
            <button className="login-provider-button" onClick={handleLogin('google-oauth2')}>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                alt="Google" 
                className="provider-icon"
              />
              Continue with Google
            </button>
            <button className="login-provider-button" onClick={handleLogin('github')}>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" 
                alt="GitHub" 
                className="provider-icon"
              />
              Continue with GitHub
            </button>
          </div>
          <div className="login-footer">
            <small>By continuing, you agree to our Terms of Service and Privacy Policy</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginButton; 