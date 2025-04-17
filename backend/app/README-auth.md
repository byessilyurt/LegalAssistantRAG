# Auth0 Integration Documentation

This document describes how the Auth0 authentication is implemented in the Polish Law for Foreigners application.

## Overview

The authentication system uses Auth0 to handle user authentication. The backend validates JWT tokens issued by Auth0 to authenticate requests. The frontend uses Auth0's React SDK to manage authentication state.

## Configuration

### Environment Variables

The following environment variables are required for the Auth0 integration:

- `AUTH0_DOMAIN`: Your Auth0 domain (e.g., dev-osft26vhk0sw07aq.eu.auth0.com)
- `AUTH0_AUDIENCE`: The API identifier registered in Auth0 (e.g., https://dev-osft26vhk0sw07aq.eu.auth0.com/api/v2/)

These should be set in the `.env` file in the backend directory.

## Authentication Flow

1. User logs in via the frontend using Auth0's authentication process
2. Auth0 issues a JWT token to the user
3. Frontend includes this token in the Authorization header for API requests
4. Backend validates the token using Auth0's JWKS endpoint
5. If valid, the request proceeds; if invalid, an appropriate error is returned

## API Endpoints

All API endpoints that require authentication use the `get_current_user` dependency to validate the token and extract the user details.

- `GET /api/me`: Returns the current user's profile
- `GET /api/conversations`: Returns the current user's conversations
- `GET /api/conversations/{conversation_id}`: Returns a specific conversation for the current user
- `DELETE /api/conversations/{conversation_id}`: Deletes a conversation for the current user

The chat endpoint (`POST /api/chat`) uses optional authentication via the `get_optional_user` dependency. This allows both authenticated and anonymous users to interact with the chat API.

## Security Considerations

- All JWT tokens are validated using Auth0's JWKS endpoint
- Token expiration is checked to ensure users re-authenticate when necessary
- User permissions could be extracted from the token's scope to implement more granular access control
- CORS is configured to only allow requests from trusted origins

## Error Handling

Custom error handlers are registered for various authentication errors:

- Expired tokens
- Invalid claims
- Invalid signatures
- Generally invalid tokens
- Unauthorized access

Each error returns a specific error code and message to help debug authentication issues.

## Testing Authentication

To test the authentication flow:

1. Log in via the frontend
2. Use developer tools to inspect the network requests and verify that the Authorization header is present
3. Use the `/api/me` endpoint to verify that the token is valid and returns the correct user information 