# Auth0 Integration with Vercel Serverless Functions

This directory contains serverless functions for Auth0 authentication.

## Auth0 Configuration for Vercel Deployment

### 1. Update Auth0 Application Settings

Log in to your Auth0 Dashboard and navigate to Applications > Your Application. Update the following settings:

- **Allowed Callback URLs**: `https://your-app.vercel.app, https://your-app.vercel.app/callback`
- **Allowed Logout URLs**: `https://your-app.vercel.app`
- **Allowed Web Origins**: `https://your-app.vercel.app`

Replace `your-app.vercel.app` with your actual Vercel domain.

### 2. Set Up Environment Variables in Vercel

In your Vercel project settings, add these environment variables:

- `REACT_APP_AUTH0_DOMAIN` - Your Auth0 domain (e.g., `your-tenant.auth0.com`)
- `REACT_APP_AUTH0_CLIENT_ID` - Your Auth0 client ID
- `REACT_APP_AUTH0_AUDIENCE` - Your API identifier (if using)
- `AUTH0_DOMAIN` - Same as above but for serverless functions
- `AUTH0_CLIENT_ID` - Same as above but for serverless functions
- `AUTH0_AUDIENCE` - Same as above but for serverless functions

### 3. API Auth0 Configuration

If you're using an Auth0 API:

1. Go to APIs in your Auth0 dashboard
2. Create or select your API
3. Make sure its identifier matches the `AUTH0_AUDIENCE` value
4. Enable RBAC and Add Permissions in the Settings tab if needed

## Troubleshooting Auth0 Authentication

If authentication is failing:

1. **Check browser console** for errors
2. **Verify environment variables** are set correctly in Vercel
3. **Check Auth0 logs** in your Auth0 dashboard
4. **Verify callback URLs** match your Vercel domain exactly
5. **Test locally** using:
   ```
   vercel dev
   ```

## Vercel Deployment Considerations

- Serverless functions have a cold start time, which might affect the first authentication attempt
- Auth0 tokens are verified on the server side in the API endpoints
- The frontend still uses the Auth0 React SDK to handle the authentication flow 