/**
 * API service for interacting with the Polish Law for Foreigners backend
 */

// The base URL of the backend API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://polish-law-backend.onrender.com/api';

/**
 * Send a message to the chat API
 * @param {string} message - The user's message
 * @param {string} conversationId - Optional conversation ID for continuing a conversation
 * @returns {Promise} - The API response
 */
export async function sendMessage(message, conversationId = null) {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error sending message');
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
    const response = await fetch(`${API_URL}/conversations`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error fetching conversations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getConversations:', error);
    throw error;
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
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error deleting conversation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    throw error;
  }
} 