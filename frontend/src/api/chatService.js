/**
 * API service for interacting with the Polish Law for Foreigners backend
 * This service uses the proxy API route to bypass CORS issues
 */

// The base URL of the API proxy
// hard coding the api url for testing
const API_URL = "https://polish-law-backend.onrender.com/api"
//const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

/**
 * Send a message to the chat API
 * @param {string} message - The user's message
 * @param {string} conversationId - Optional conversation ID for continuing a conversation
 * @returns {Promise} - The API response
 */
export async function sendMessage(message, conversationId = null) {
  try {
    console.log('Sending message to:', `${API_URL}/chat`);
    
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId
      })
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
 * @returns {Promise} - The API response with conversations
 */
export async function getConversations() {
  try {
    const response = await fetch(`${API_URL}/conversations`);

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
 * @returns {Promise} - The API response
 */
export async function deleteConversation(conversationId) {
  try {
    const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
      method: 'DELETE'
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