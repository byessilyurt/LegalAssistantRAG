import React from 'react';
import { render, screen } from '@testing-library/react';
import MessageList from '../../../components/messages/MessageList';

// Mock the MessageItem component
jest.mock('../../../components/messages/MessageItem', () => {
  return function MockMessageItem({ message }) {
    return <div data-testid={`message-${message.id}`}>{message.content}</div>;
  };
});

describe('MessageList Component', () => {
  const mockMessages = [
    { id: 1, content: 'Message 1', sender: 'user1', timestamp: new Date() },
    { id: 2, content: 'Message 2', sender: 'user2', timestamp: new Date() }
  ];

  test('renders messages when provided', () => {
    render(<MessageList messages={mockMessages} />);
    
    expect(screen.getByTestId('message-1')).toBeInTheDocument();
    expect(screen.getByTestId('message-2')).toBeInTheDocument();
    expect(screen.getByText('Message 1')).toBeInTheDocument();
    expect(screen.getByText('Message 2')).toBeInTheDocument();
  });

  test('renders no messages message when empty', () => {
    render(<MessageList messages={[]} />);
    
    expect(screen.getByText(/no messages/i)).toBeInTheDocument();
  });

  test('renders loading state when loading', () => {
    render(<MessageList messages={[]} loading={true} />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
}); 