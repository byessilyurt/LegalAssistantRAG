// Auth0 configuration
export const auth0Config = {
  domain: "YOUR_AUTH0_DOMAIN", // e.g., "dev-abc123.us.auth0.com"
  clientId: "YOUR_AUTH0_CLIENT_ID",
  redirectUri: window.location.origin,
  audience: "https://api.polishlawforeigner.com", // Optional: API identifier if you have a backend API
  scope: "openid profile email"
}; 