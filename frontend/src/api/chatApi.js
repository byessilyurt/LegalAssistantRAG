// API client for chat functionality
// This connects to our Cloud Run backend

// Set this to your deployed Cloud Run backend URL
// You can override this in .env.local with REACT_APP_API_BASE_URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
                    (window.location.hostname === 'localhost' ? 
                     'http://localhost:8000' : 
                     'https://pl-foreigners-legal-api-687968958844.us-central1.run.app');

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Helper function to add auth token to requests if available
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// API client for chat functionality
const chatApi = {
  // Send a message to get a response
  sendMessage: async (message, conversationId = null) => {
    try {
      // First try to use the Cloud Run backend
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        console.warn(`Cloud Run backend request failed with status: ${response.status}`);
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message to Cloud Run backend:', error);
      throw error;
    }
  },


  // Get all conversations for the user
  getConversations: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations`, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting conversations:', error);
      return []; // Return empty array on error
    }
  },

  // Get a specific conversation
  getConversation: async (conversationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error getting conversation ${conversationId}:`, error);
      throw error;
    }
  },

  // Delete a conversation
  deleteConversation: async (conversationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          ...DEFAULT_HEADERS,
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error deleting conversation ${conversationId}:`, error);
      throw error;
    }
  },
};

export default chatApi; 
