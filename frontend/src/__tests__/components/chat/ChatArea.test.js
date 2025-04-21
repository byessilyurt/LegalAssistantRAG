import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatArea from '../../../components/chat/ChatArea';
import { useAuthentication } from '../../../auth/auth-hooks';

// Mock components and hooks
jest.mock('../../../auth/auth-hooks', () => ({
  useAuthentication: jest.fn()
}));

jest.mock('../../../components/chat/MessageList', () => ({
  __esModule: true,
  default: () => <div data-testid="message-list" />
}));

jest.mock('../../../components/chat/MessageForm', () => ({
  __esModule: true,
  default: () => <div data-testid="message-form" />
}));

jest.mock('../../../components/LoginButton', () => ({
  __esModule: true,
  default: () => <div data-testid="login-button" />
}));

describe('ChatArea Component', () => {
  beforeEach(() => {
    // Reset mocks
    useAuthentication.mockReset();
  });

  test('renders welcome message when there are no messages', () => {
    // Setup auth mock
    useAuthentication.mockReturnValue({
      isAuthenticated: false
    });

    render(
      <ChatArea
        messages={[]}
        loading={false}
        error=""
        onSubmit={() => {}}
        input=""
        setInput={() => {}}
      />
    );

    // Check welcome message
    const welcomeHeading = screen.getByText('Welcome to Legal Assistant 🇵🇱');
    expect(welcomeHeading).toBeInTheDocument();
    
    const welcomeText = screen.getByText('How can I help you with Polish legal questions today?');
    expect(welcomeText).toBeInTheDocument();
  });

  test('renders login prompt for non-authenticated users on welcome screen', () => {
    // Setup auth mock for non-authenticated user
    useAuthentication.mockReturnValue({
      isAuthenticated: false
    });

    render(
      <ChatArea
        messages={[]}
        loading={false}
        error=""
        onSubmit={() => {}}
        input=""
        setInput={() => {}}
      />
    );

    // Check for login prompt
    const loginPrompt = screen.getByText('Sign in to save your conversations');
    expect(loginPrompt).toBeInTheDocument();
    
    // Check login button is rendered
    const loginButton = screen.getByTestId('login-button');
    expect(loginButton).toBeInTheDocument();
  });

  test('does not render login prompt for authenticated users', () => {
    // Setup auth mock for authenticated user
    useAuthentication.mockReturnValue({
      isAuthenticated: true
    });

    render(
      <ChatArea
        messages={[]}
        loading={false}
        error=""
        onSubmit={() => {}}
        input=""
        setInput={() => {}}
      />
    );

    // Login prompt should not be present
    const loginPrompt = screen.queryByText('Sign in to save your conversations');
    expect(loginPrompt).not.toBeInTheDocument();
  });

  test('renders MessageList when there are messages', () => {
    // Setup auth mock
    useAuthentication.mockReturnValue({
      isAuthenticated: false
    });

    // Sample message data
    const messages = [
      {
        id: '1',
        role: 'user',
        content: 'Test message',
        timestamp: new Date().toISOString()
      }
    ];

    render(
      <ChatArea
        messages={messages}
        loading={false}
        error=""
        onSubmit={() => {}}
        input=""
        setInput={() => {}}
      />
    );

    // Welcome message should not be present
    const welcomeHeading = screen.queryByText('Welcome to Legal Assistant 🇵🇱');
    expect(welcomeHeading).not.toBeInTheDocument();
    
    // MessageList should be rendered
    const messageList = screen.getByTestId('message-list');
    expect(messageList).toBeInTheDocument();
  });

  test('renders MessageForm component', () => {
    // Setup auth mock
    useAuthentication.mockReturnValue({
      isAuthenticated: false
    });

    render(
      <ChatArea
        messages={[]}
        loading={false}
        error=""
        onSubmit={() => {}}
        input=""
        setInput={() => {}}
      />
    );

    // Check message form is rendered
    const messageForm = screen.getByTestId('message-form');
    expect(messageForm).toBeInTheDocument();
  });
}); 