import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';

// Auth0 configuration
const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
const audience = process.env.REACT_APP_AUTH0_AUDIENCE;

const Auth0ProviderWithHistory = ({ children }) => {
  const redirectUri = window.location.origin;

  // For local development or if environment variables are missing, continue without auth
  if (!domain || !clientId) {
    console.warn('Auth0 configuration missing. Authentication will be disabled.');
    // Instead of blocking the app, just render the children without auth
    return children;
  }

  const onRedirectCallback = (appState) => {
    console.log('Auth callback executed', appState);
    window.history.replaceState(
      {},
      document.title,
      appState?.returnTo || window.location.pathname
    );
  };

  const onError = (error) => {
    console.error('Auth error:', error);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
        scope: 'openid profile email',
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      onRedirectCallback={onRedirectCallback}
      onError={onError}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory; 