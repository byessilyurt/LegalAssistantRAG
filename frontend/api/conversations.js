// Simple in-memory store for conversations
// In production, you'd use a database
let conversations = [];

export default async function handler(req, res) {
  // Basic auth check 
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // In production, you should verify the token with Auth0
  // For now, we'll just check that a token exists and continue
  // const token = authHeader.split(' ')[1];
  // Call Auth0 to verify the token...

  // GET - list conversations
  if (req.method === 'GET') {
    return res.status(200).json(conversations);
  }
  
  // POST - create a new conversation
  else if (req.method === 'POST') {
    const newConversation = {
      id: Date.now().toString(),
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    conversations.push(newConversation);
    return res.status(201).json(newConversation);
  }
  
  // DELETE - delete a conversation
  else if (req.method === 'DELETE') {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }
    
    const initialLength = conversations.length;
    conversations = conversations.filter(conv => conv.id !== id);
    
    if (conversations.length === initialLength) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    return res.status(200).json({ message: 'Conversation deleted' });
  }
  
  // Method not allowed
  else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 