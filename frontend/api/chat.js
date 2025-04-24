export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Here you would typically call an AI service
    // For now, we'll just return a simple response
    const response = {
      conversation_id: Date.now().toString(),
      message: {
        id: Date.now().toString(),
        role: 'assistant',
        content: `You said: "${message}". This is a placeholder response from the serverless function.`,
        timestamp: new Date().toISOString()
      },
      sources: []
    };

    // Add a simulated delay to mimic API processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error in chat API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 