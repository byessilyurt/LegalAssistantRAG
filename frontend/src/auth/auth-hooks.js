import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

// Custom hook to check if user is authenticated
export const useAuthentication = () => {
  const {
    isAuthenticated,
    isLoading,
    user,
    getAccessTokenSilently,
    loginWithRedirect,
    loginWithPopup,
    logout,
  } = useAuth0();

  return {
    isAuthenticated,
    isLoading,
    user,
    getAccessTokenSilently,
    login: loginWithRedirect,
    loginWithPopup,
    logout: () => logout({ returnTo: window.location.origin }),
  };
};

// Hook to get access token
export const useAccessToken = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  
  const getToken = async () => {
    if (!isAuthenticated) return null;
    
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };
  
  return { getToken, isAuthenticated };
};

// Hook to add auth token to API requests
export const useAuthenticatedFetch = () => {
  const { getToken, isAuthenticated } = useAccessToken();
  
  const authFetch = async (url, options = {}) => {
    if (isAuthenticated) {
      const token = await getToken();
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
    
    return fetch(url, options);
  };
  
  return authFetch;
}; 