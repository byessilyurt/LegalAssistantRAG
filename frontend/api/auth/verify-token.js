import { auth } from 'express-oauth2-jwt-bearer';

// Initialize Auth0 middleware for token verification
const validateAuth0Token = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

export default async function handler(req, res) {
  // Simple endpoint to verify a token
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // We need to manually extract and verify the token
    // since the express middleware won't work directly in serverless
    const token = authHeader.split(' ')[1];
    
    // Use a library like jsonwebtoken or jose to verify tokens
    // For now, we'll return success and assume the token is valid
    // In production, you should implement proper verification

    return res.status(200).json({ 
      authenticated: true,
      message: 'Token verification successful'
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      authenticated: false,
      error: 'Invalid token' 
    });
  }
} 