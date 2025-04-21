import { renderHook, act } from '@testing-library/react-hooks';
import useChat from '../useChat';
import * as authHooks from '../../auth/auth-hooks';

// Mock the authentication hooks
jest.mock('../../auth/auth-hooks', () => ({
  useAuthentication: jest.fn(),
  useAccessToken: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

describe('useChat Hook', () => {
  beforeEach(() => {
    // Mock authenticated user
    authHooks.useAuthentication.mockReturnValue({
      isAuthenticated: true
    });
    
    // Mock token getter function
    authHooks.useAccessToken.mockReturnValue({
      getToken: jest.fn().mockResolvedValue('mock-token')
    });
    
    // Reset fetch mock
    global.fetch.mockReset();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useChat());
    
    expect(result.current.input).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.conversations).toEqual([]);
    expect(result.current.activeConversation).toBeNull();
    expect(result.current.messages).toEqual([]);
  });

  it('fetches conversations when authenticated', async () => {
    // Mock successful fetch response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue([
        { id: 'conv1', messages: [] },
        { id: 'conv2', messages: [] }
      ])
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useChat());
    
    // Wait for useEffect to complete
    await waitForNextUpdate();
    
    // Check if fetch was called with correct arguments
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/conversations',
      { headers: { Authorization: 'Bearer mock-token' } }
    );
    
    // Check if conversations were updated
    expect(result.current.conversations).toHaveLength(2);
    expect(result.current.conversations[0].id).toBe('conv1');
    expect(result.current.conversations[1].id).toBe('conv2');
  });

  it('handles 404 for new users with no conversations', async () => {
    // Mock 404 response for no conversations
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useChat());
    
    // Wait for useEffect to complete
    await waitForNextUpdate();
    
    // Should set empty conversations and no error
    expect(result.current.conversations).toEqual([]);
    expect(result.current.error).toBe('');
  });

  it('handles fetch error for conversations', async () => {
    // Mock error response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useChat());
    
    // Wait for useEffect to complete
    await waitForNextUpdate();
    
    // Should set error for non-404 errors
    expect(result.current.error).toBe('Failed to fetch conversations');
  });

  it('selects a conversation correctly', async () => {
    // Mock the conversation fetch response
    const mockConversation = {
      id: 'conv1',
      messages: [
        { id: 'msg1', content: 'Hello', role: 'user' },
        { id: 'msg2', content: 'Hi there', role: 'assistant' }
      ]
    };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockConversation)
    });
    
    const { result } = renderHook(() => useChat());
    
    // Call selectConversation
    await act(async () => {
      await result.current.selectConversation('conv1');
    });
    
    // Check if fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/conversations/conv1',
      { headers: { Authorization: 'Bearer mock-token' } }
    );
    
    // Check if state was updated correctly
    expect(result.current.activeConversation).toEqual(mockConversation);
    expect(result.current.messages).toEqual(mockConversation.messages);
    expect(result.current.error).toBe('');
  });

  it('creates a new conversation correctly', () => {
    const { result } = renderHook(() => useChat());
    
    // Set some initial state
    act(() => {
      result.current.activeConversation = { id: 'conv1' };
      result.current.messages = [{ id: 'msg1' }];
      result.current.error = 'Some error';
    });
    
    // Call createNewConversation
    act(() => {
      result.current.createNewConversation();
    });
    
    // Check if state was reset
    expect(result.current.activeConversation).toBeNull();
    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBe('');
  });

  it('deletes a conversation correctly', async () => {
    // Mock successful delete response
    global.fetch.mockResolvedValueOnce({
      ok: true
    });
    
    // Mock successful conversations fetch response after deletion
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue([{ id: 'conv2' }])
    });
    
    const { result } = renderHook(() => useChat());
    
    // Set active conversation
    act(() => {
      result.current.activeConversation = { id: 'conv1' };
    });
    
    // Call deleteConversation
    await act(async () => {
      await result.current.deleteConversation('conv1');
    });
    
    // Check delete request
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/conversations/conv1',
      { 
        method: 'DELETE',
        headers: { Authorization: 'Bearer mock-token' } 
      }
    );
    
    // Check if state was updated correctly - active conversation should be reset
    expect(result.current.activeConversation).toBeNull();
  });

  it('submits a message and handles the response correctly', async () => {
    // Mock successful chat response
    const mockResponse = {
      conversation_id: 'new-conv',
      message: {
        id: 'resp1',
        role: 'assistant',
        content: 'I can help with that',
        timestamp: '2023-01-01T12:01:00Z'
      },
      sources: ['https://example.com/source']
    };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse)
    });
    
    // Mock conversations refresh after new conversation
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue([{ id: 'new-conv' }])
    });
    
    const { result } = renderHook(() => useChat());
    
    // Set input value
    act(() => {
      result.current.setInput('Hello, I need legal advice');
    });
    
    // Create a mock event for form submission
    const mockEvent = {
      preventDefault: jest.fn()
    };
    
    // Submit the form
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });
    
    // Check if the event's preventDefault was called
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    
    // Check if loading states were managed correctly
    expect(result.current.loading).toBe(false);
    
    // Check if input was cleared
    expect(result.current.input).toBe('');
    
    // Check if the messages were updated
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[0].content).toBe('Hello, I need legal advice');
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].content).toBe('I can help with that');
    
    // Check if activeConversation was set correctly
    expect(result.current.activeConversation.id).toBe('new-conv');
  });

  it('handles error when submitting a message', async () => {
    // Mock error response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ detail: 'Server error' })
    });
    
    const { result } = renderHook(() => useChat());
    
    // Set input value
    act(() => {
      result.current.setInput('Hello');
    });
    
    // Submit the form
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() });
    });
    
    // Check error state
    expect(result.current.error).toBe('Server error');
    expect(result.current.loading).toBe(false);
    
    // Should still have user message
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe('user');
  });
}); 