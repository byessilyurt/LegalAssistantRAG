import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';

// Auth0 configuration
const domain = process.env.REACT_APP_AUTH0_DOMAIN || 'placeholder-domain';
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || 'placeholder-client-id';
const audience = process.env.REACT_APP_AUTH0_AUDIENCE;

const Auth0ProviderWithHistory = ({ children }) => {
  const redirectUri = window.location.origin;

  // Check if we have actual Auth0 credentials
  const hasValidAuth0Config = !!(
    domain && 
    clientId && 
    domain !== 'placeholder-domain' && 
    clientId !== 'placeholder-client-id'
  );

  // Log a warning if Auth0 is not properly configured
  if (!hasValidAuth0Config) {
    console.warn('Auth0 configuration missing or using placeholders. Authentication will be disabled.');
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

  // Always render the Auth0Provider to avoid React Hook conditional rendering issues
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
      skipRedirectCallback={!hasValidAuth0Config}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory; 