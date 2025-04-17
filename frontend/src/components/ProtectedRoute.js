import React from 'react';
import { useAuthentication } from '../auth/auth-hooks';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, login } = useAuthentication();

  // Show loading indicator while authentication state is being determined
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>Loading authentication state...</p>
      </div>
    );
  }

  // If not authenticated, show a message and login button
  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <h2>Authentication Required</h2>
        <p>You need to be logged in to access this feature.</p>
        <button 
          className="login-redirect-button"
          onClick={() => login()}
        >
          Log In
        </button>
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute; 