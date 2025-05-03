import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

// Check if Auth0 configuration is available
const hasAuth0Config = !!(
  process.env.REACT_APP_AUTH0_DOMAIN && 
  process.env.REACT_APP_AUTH0_CLIENT_ID
);

// Custom hook to check if user is authenticated
export const useAuthentication = () => {
  // Always call useAuth0 at the top level regardless of config availability
  const auth0 = useAuth0();
  
  // If Auth0 is not configured, provide mock implementation
  if (!hasAuth0Config) {
    return {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      getAccessTokenSilently: async () => null,
      login: () => console.warn('Auth0 not configured'),
      loginWithPopup: () => console.warn('Auth0 not configured'),
      logout: () => console.warn('Auth0 not configured'),
    };
  }
  
  const {
    isAuthenticated,
    isLoading,
    user,
    getAccessTokenSilently,
    loginWithRedirect,
    loginWithPopup,
    logout,
  } = auth0;

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
  // Always call useAuth0 at the top level
  const auth0 = useAuth0();
  
  // If Auth0 is not configured, provide mock implementation
  if (!hasAuth0Config) {
    return {
      getToken: async () => null,
      isAuthenticated: false
    };
  }
  
  const { getAccessTokenSilently, isAuthenticated } = auth0;
  
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