import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';

// Auth0 configuration
const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
const audience = process.env.REACT_APP_AUTH0_AUDIENCE;

const Auth0ProviderWithHistory = ({ children }) => {
  const redirectUri = window.location.origin;

  if (!domain || !clientId) {
    return <div className="loading-auth">
      <p>Auth0 configuration missing. Please set REACT_APP_AUTH0_DOMAIN and REACT_APP_AUTH0_CLIENT_ID environment variables.</p>
    </div>;
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