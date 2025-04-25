/**
 * API service for interacting with the Polish Law for Foreigners backend
 * This service uses the proxy API route to bypass CORS issues
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/proxy';

/**
 * Send a message to the chat API
 * @param {string} message - The user's message
 * @param {string} conversationId - Optional conversation ID for continuing a conversation
 * @param {string} token - Optional auth token
 * @returns {Promise} - The API response
 */
export async function sendMessage(message, conversationId = null, token = null) {
  try {
    console.log('Sending message to:', `${API_URL}/chat`);
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        conversation_id: conversationId
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.detail || 'Error sending message';
      } catch (e) {
        errorMessage = errorText || 'Error sending message';
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
}

/**
 * Get all conversations for the authenticated user
 * @param {string} token - Optional auth token
 * @returns {Promise} - The API response with conversations
 */
export async function getConversations(token = null) {
  try {
    const headers = {};
    
    // Add authorization header if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/conversations`, {
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Return empty array if no conversations found
        return [];
      }
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.detail || 'Error fetching conversations';
      } catch (e) {
        errorMessage = errorText || 'Error fetching conversations';
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getConversations:', error);
    // Return empty array on error to prevent UI issues
    return [];
  }
}

/**
 * Delete a conversation
 * @param {string} conversationId - The ID of the conversation to delete
 * @param {string} token - Optional auth token
 * @returns {Promise} - The API response
 */
export async function deleteConversation(conversationId, token = null) {
  try {
    const headers = {};
    
    // Add authorization header if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.detail || 'Error deleting conversation';
      } catch (e) {
        errorMessage = errorText || 'Error deleting conversation';
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    throw error;
  }
} 