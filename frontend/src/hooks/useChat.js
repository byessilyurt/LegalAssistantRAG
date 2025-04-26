import { useState, useEffect } from 'react';
import { useAuthentication, useAccessToken } from '../auth/auth-hooks';

// Use relative paths for Vercel serverless functions
const API_URL = '';

export const useChat = () => {
  const { isAuthenticated } = useAuthentication();
  const { getToken } = useAccessToken();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  // Fetch conversations on initial load and auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  const fetchConversations = async () => {
    try {
      // Get auth token if user is authenticated
      const headers = {};
      if (isAuthenticated) {
        const token = await getToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const res = await fetch(`${API_URL}/api/conversations`, {
        headers
      });
      
      if (!res.ok) {
        // If the response is 404, it means the user has no conversations yet
        if (res.status === 404) {
          setConversations([]);
          setError('');
          return;
        }
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await res.json();
      setConversations(data);
      setError('');
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Only show error for non-new users
      if (conversations.length > 0) {
        setError('Failed to load conversations');
      } else {
        // For new users with no conversations, don't show error
        setError('');
      }
    }
  };

  const selectConversation = async (conversationId) => {
    try {
      // Get auth token if user is authenticated
      const headers = {};
      if (isAuthenticated) {
        const token = await getToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const res = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
        headers
      });
      if (!res.ok) {
        throw new Error('Failed to fetch conversation');
      }
      const data = await res.json();
      setActiveConversation(data);
      setMessages(data.messages);
      setError('');
    } catch (error) {
      console.error('Error selecting conversation:', error);
      setError('Failed to load conversation');
    }
  };

  const createNewConversation = () => {
    setActiveConversation(null);
    setMessages([]);
    setError('');
  };

  const deleteConversation = async (conversationId) => {
    try {
      // Get auth token if user is authenticated
      const headers = {};
      if (isAuthenticated) {
        const token = await getToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const res = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) {
        throw new Error('Failed to delete conversation');
      }
      await fetchConversations();
      if (activeConversation && activeConversation.id === conversationId) {
        createNewConversation();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError('');
    
    // Add user message to UI immediately
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      sources: []
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Prepare request payload
    const payload = {
      message: userMessage.content,
    };

    // If we have an active conversation, include its ID
    if (activeConversation) {
      payload.conversation_id = activeConversation.id;
    }

    try {
      // Get auth token if user is authenticated
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (isAuthenticated) {
        const token = await getToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to get answer');
      }
      
      const data = await res.json();
      
      // Add sources to the message object
      const assistantMessage = {
        ...data.message,
        sources: data.sources || []
      };
      
      // If this is a new conversation, set it as active
      if (!activeConversation) {
        setActiveConversation({ 
          id: data.conversation_id, 
          messages: [userMessage, assistantMessage] 
        });
        await fetchConversations();  // Refresh the conversation list
      } else {
        // Update the existing conversation
        setActiveConversation(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage]
        }));
      }
      
      // Add assistant message to UI
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Sorry, there was an error processing your message.');
    } finally {
      setLoading(false);
    }
  };

  return {
    input,
    setInput,
    loading,
    error,
    conversations,
    activeConversation,
    messages,
    selectConversation,
    createNewConversation,
    deleteConversation,
    handleSubmit
  };
};

export default useChat; 