import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { auth0Config } from '../auth0-config';

const AuthProvider = ({ children }) => {
  const onRedirectCallback = (appState) => {
    window.history.replaceState(
      {},
      document.title,
      appState?.returnTo || window.location.pathname
    );
  };

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      redirectUri={auth0Config.redirectUri}
      onRedirectCallback={onRedirectCallback}
      audience={auth0Config.audience}
      scope={auth0Config.scope}
    >
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider; 