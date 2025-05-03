import { useState, useEffect } from 'react';
import { useAuthentication, useAccessToken } from '../auth/auth-hooks';
import chatApi from '../api/chatApi';

export const useChat = () => {
  const { isAuthenticated } = useAuthentication();
  const { getToken } = useAccessToken();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  // Store auth token in localStorage for chatApi to use
  const updateAuthToken = async () => {
    if (isAuthenticated) {
      const token = await getToken();
      if (token) {
        localStorage.setItem('auth_token', token);
      }
    } else {
      localStorage.removeItem('auth_token');
    }
  };

  // Fetch conversations on initial load and auth change
  useEffect(() => {
    if (isAuthenticated) {
      updateAuthToken().then(() => fetchConversations());
    }
  }, [isAuthenticated]);

  const fetchConversations = async () => {
    try {
      await updateAuthToken();
      const data = await chatApi.getConversations();
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
      await updateAuthToken();
      const data = await chatApi.getConversation(conversationId);
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
      await updateAuthToken();
      await chatApi.deleteConversation(conversationId);
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

    try {
      // Update auth token
      await updateAuthToken();
      
      // Get conversation ID if we have an active conversation
      const conversationId = activeConversation ? activeConversation.id : null;
      
      // Send message using chatApi
      const data = await chatApi.sendMessage(userMessage.content, conversationId);
      
      if (!data || !data.message) {
        throw new Error('Invalid response from server');
      }
      
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
      setError(error.message || 'Sorry, there was an error connecting to the backend service. Please try again later.');
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