import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  if (isLoading) {
    return (
      <div className="loading-auth">
        <div className="loading-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>Authenticating...</p>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute; 