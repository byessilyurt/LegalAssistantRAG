import { renderHook, act } from '@testing-library/react';
import useChat from '../../hooks/useChat';
import { useAuthentication, useAccessToken } from '../../auth/auth-hooks';

// Mock the fetch function
global.fetch = jest.fn();

// Mock auth hooks
jest.mock('../../auth/auth-hooks', () => ({
  useAuthentication: jest.fn(),
  useAccessToken: jest.fn()
}));

describe('useChat Hook', () => {
  beforeEach(() => {
    // Reset mocks
    jest.resetAllMocks();
    
    // Setup default mock implementations
    useAuthentication.mockReturnValue({
      isAuthenticated: false
    });
    
    useAccessToken.mockReturnValue({
      getToken: jest.fn().mockResolvedValue('mock-token')
    });
    
    // Setup fetch mock to return a successful response
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [] })
    });
  });

  test('initializes with empty state', () => {
    const { result } = renderHook(() => useChat());
    
    expect(result.current.input).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.conversations).toEqual([]);
    expect(result.current.activeConversation).toBeNull();
    expect(result.current.messages).toEqual([]);
  });

  test('fetches conversations when user is authenticated', async () => {
    // Setup authenticated user
    useAuthentication.mockReturnValue({
      isAuthenticated: true
    });
    
    // Mock successful fetch response
    const mockConversations = [{ id: '1', messages: [], updated_at: new Date().toISOString() }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockConversations)
    });
    
    let result;
    await act(async () => {
      result = renderHook(() => useChat()).result;
    });
    
    // Check that fetch was called with the right URL
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/conversations'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token'
        })
      })
    );
    
    // Check state was updated
    expect(result.current.conversations).toEqual(mockConversations);
  });

  test('handles message submission', async () => {
    // Mock successful response for message submission
    const mockResponse = {
      conversation_id: '123',
      message: {
        id: '1',
        role: 'assistant',
        content: 'This is a response',
        timestamp: new Date().toISOString()
      },
      sources: []
    };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });
    
    const { result } = renderHook(() => useChat());
    
    // Set input
    act(() => {
      result.current.setInput('Test message');
    });
    
    // Submit form
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() });
    });
    
    // Check loading state and input reset
    expect(result.current.loading).toBe(false);
    expect(result.current.input).toBe('');
    
    // Check that messages were updated (user message + assistant response)
    expect(result.current.messages.length).toBe(2);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[0].content).toBe('Test message');
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].content).toBe('This is a response');
  });

  test('sets error message when API call fails', async () => {
    // Mock failed response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'API error' })
    });
    
    const { result } = renderHook(() => useChat());
    
    // Set input
    act(() => {
      result.current.setInput('Test message');
    });
    
    // Submit form
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() });
    });
    
    // Check error state
    expect(result.current.error).toBe('API error');
    expect(result.current.loading).toBe(false);
  });

  test('creates new conversation correctly', () => {
    const { result } = renderHook(() => useChat());
    
    // Initialize with some data
    act(() => {
      result.current.messages = [{ id: '1', content: 'test' }];
      result.current.activeConversation = { id: '123', messages: [] };
      result.current.error = 'Some error';
    });
    
    // Call createNewConversation
    act(() => {
      result.current.createNewConversation();
    });
    
    // Check state reset
    expect(result.current.activeConversation).toBeNull();
    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBe('');
  });
}); 