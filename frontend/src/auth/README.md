# Auth0 Setup Instructions

This application uses Auth0 for authentication with social login providers. Follow these steps to set up Auth0 for your project:

## 1. Create an Auth0 Account

If you don't already have an Auth0 account, sign up for a free account at [Auth0](https://auth0.com/).

## 2. Create a New Application

1. In the Auth0 dashboard, navigate to Applications > Applications
2. Click "Create Application"
3. Name your application (e.g., "Polish Law for Foreigners")
4. Select "Single Page Application" as the application type
5. Click "Create"

## 3. Configure Application Settings

In your application settings:

1. Set **Allowed Callback URLs** to:
   - `http://localhost:3000` (for local development)
   - Add your production URL if you have one

2. Set **Allowed Logout URLs** to:
   - `http://localhost:3000` (for local development)
   - Add your production URL if you have one

3. Set **Allowed Web Origins** to:
   - `http://localhost:3000` (for local development)
   - Add your production URL if you have one

4. Save your changes

## 4. Set Up Social Connections

1. Navigate to Authentication > Social in the Auth0 dashboard
2. Enable the social connections you want to use (Google, GitHub, etc.)
3. Configure each provider with the necessary credentials

## 5. Configure Environment Variables

1. Find your application's Domain and Client ID in the Auth0 dashboard
2. Update the `.env` file in the frontend directory with these values:

```
REACT_APP_AUTH0_DOMAIN=your-auth0-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id
```

## 6. API Configuration (Optional)

If you need to access your backend API with Auth0 tokens:

1. In the Auth0 dashboard, navigate to Applications > APIs
2. Create a new API
3. Add the API identifier to your environment variables:

```
REACT_APP_AUTH0_AUDIENCE=https://your-api-identifier/
```

## 7. Test Your Implementation

Start your application and test the authentication flow:

```
npm start
```

The login button should now display the Auth0 Universal Login page or a popup with your configured social providers.