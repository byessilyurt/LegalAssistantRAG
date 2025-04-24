// This example uses OpenAI, but can be adapted for any AI provider
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversation_id } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Ensure we have an OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o', // or whatever model you prefer
        messages: [
          { role: 'system', content: 'You are a helpful legal assistant specializing in Polish law for foreigners.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Error from AI service',
        details: errorData
      });
    }

    const data = await response.json();
    
    // Format the response for the frontend
    const formattedResponse = {
      conversation_id: conversation_id || Date.now().toString(),
      message: {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date().toISOString()
      },
      sources: []
    };

    return res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('Error in AI chat API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 