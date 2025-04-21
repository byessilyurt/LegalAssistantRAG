import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatArea from '../ChatArea';
import * as authHooks from '../../../auth/auth-hooks';

// Mock dependencies
jest.mock('../../../auth/auth-hooks', () => ({
  useAuthentication: jest.fn()
}));

jest.mock('../MessageList', () => {
  return function MockMessageList({ messages, loading, error }) {
    return (
      <div data-testid="mock-message-list">
        <span>Messages count: {messages.length}</span>
        <span>Loading: {loading ? 'true' : 'false'}</span>
        {error && <span>Error: {error}</span>}
      </div>
    );
  };
});

jest.mock('../MessageForm', () => {
  return function MockMessageForm({ input, loading }) {
    return (
      <div data-testid="mock-message-form">
        <span>Input: {input}</span>
        <span>Loading: {loading ? 'true' : 'false'}</span>
      </div>
    );
  };
});

jest.mock('../../LoginButton', () => {
  return function MockLoginButton() {
    return <div data-testid="mock-login-button">Login Button</div>;
  };
});

describe('ChatArea Component', () => {
  // Default props
  const defaultProps = {
    messages: [],
    loading: false,
    error: '',
    onSubmit: jest.fn(),
    input: '',
    setInput: jest.fn()
  };

  // Sample messages
  const sampleMessages = [
    {
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: '2023-01-01T10:00:00Z'
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Hi there',
      timestamp: '2023-01-01T10:01:00Z'
    }
  ];

  beforeEach(() => {
    // Default to authenticated
    authHooks.useAuthentication.mockReturnValue({
      isAuthenticated: true
    });
    
    // Mock scroll behavior
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders welcome message when no messages exist', () => {
    render(<ChatArea {...defaultProps} />);
    
    expect(screen.getByText('Welcome to Legal Assistant 🇵🇱')).toBeInTheDocument();
    expect(screen.getByText('How can I help you with Polish legal questions today?')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-message-list')).not.toBeInTheDocument();
  });

  it('shows login button in welcome message when not authenticated', () => {
    // Mock unauthenticated state
    authHooks.useAuthentication.mockReturnValue({
      isAuthenticated: false
    });
    
    render(<ChatArea {...defaultProps} />);
    
    expect(screen.getByText('Sign in to save your conversations')).toBeInTheDocument();
    expect(screen.getByTestId('mock-login-button')).toBeInTheDocument();
  });

  it('does not show login prompt when authenticated', () => {
    render(<ChatArea {...defaultProps} />);
    
    expect(screen.queryByText('Sign in to save your conversations')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-login-button')).not.toBeInTheDocument();
  });

  it('renders MessageList when messages exist', () => {
    render(<ChatArea {...defaultProps} messages={sampleMessages} />);
    
    expect(screen.queryByText('Welcome to Legal Assistant 🇵🇱')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-message-list')).toBeInTheDocument();
    expect(screen.getByText('Messages count: 2')).toBeInTheDocument();
  });

  it('passes loading state to MessageList and MessageForm', () => {
    render(<ChatArea {...defaultProps} loading={true} />);
    
    // Since we have no messages, MessageList won't be rendered yet
    const messageForm = screen.getByTestId('mock-message-form');
    expect(messageForm).toHaveTextContent('Loading: true');
    
    // With messages and loading
    const { rerender } = render(<ChatArea {...defaultProps} messages={sampleMessages} loading={true} />);
    
    expect(screen.getByTestId('mock-message-list')).toHaveTextContent('Loading: true');
    expect(screen.getByTestId('mock-message-form')).toHaveTextContent('Loading: true');
  });

  it('passes error to MessageList when there is an error', () => {
    render(<ChatArea 
      {...defaultProps} 
      messages={sampleMessages} 
      error="Something went wrong" 
    />);
    
    expect(screen.getByText('Error: Something went wrong')).toBeInTheDocument();
  });

  it('passes input value to MessageForm', () => {
    render(<ChatArea {...defaultProps} input="test input" />);
    
    expect(screen.getByTestId('mock-message-form')).toHaveTextContent('Input: test input');
  });

  it('creates a ref for automatic scrolling', () => {
    render(<ChatArea {...defaultProps} messages={sampleMessages} />);
    
    // Check if scrollIntoView was called when messages change
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
}); 