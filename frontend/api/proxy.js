/**
 * Proxy API route to bypass CORS issues
 * This route will forward requests to the backend API
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://polishlawwithai.onrender.com';

export default async function handler(req, res) {
  // Extract the path from the query
  const { path } = req.query;
  
  if (!path) {
    return res.status(400).json({ error: 'Path is required' });
  }

  try {
    // Forward headers to include Auth
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Forward Authorization header if present
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }
    
    // Forward the request to the backend
    const backendRes = await fetch(`${BACKEND_URL}/${path}`, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // Get the response data
    const contentType = backendRes.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await backendRes.json();
    } else {
      data = await backendRes.text();
    }

    // Set the status code and send the response
    res.status(backendRes.status);
    
    // Set the content type header
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    if (typeof data === 'object') {
      res.json(data);
    } else {
      res.send(data);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Error connecting to backend service' });
  }
} 