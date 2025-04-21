import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../Sidebar';
import * as authHooks from '../../../auth/auth-hooks';

// Mock the authentication hooks
jest.mock('../../../auth/auth-hooks', () => ({
  useAuthentication: jest.fn()
}));

describe('Sidebar Component', () => {
  // Mock props
  const mockProps = {
    isOpen: false,
    conversations: [],
    activeConversation: null,
    onSelectConversation: jest.fn(),
    onCreateNewConversation: jest.fn(),
    onDeleteConversation: jest.fn(),
    onClose: jest.fn()
  };

  // Sample conversation data
  const sampleConversations = [
    {
      id: 'conv1',
      messages: [{ content: 'First conversation message' }],
      updated_at: '2023-01-01T12:00:00Z'
    },
    {
      id: 'conv2',
      messages: [{ content: 'Second conversation message' }],
      updated_at: '2023-01-02T12:00:00Z'
    }
  ];

  beforeEach(() => {
    // Default to authenticated
    authHooks.useAuthentication.mockReturnValue({
      isAuthenticated: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct classes when open or closed', () => {
    // Test closed state
    const { rerender } = render(<Sidebar {...mockProps} />);
    expect(screen.getByRole('complementary')).not.toHaveClass('open');
    
    // Test open state
    rerender(<Sidebar {...mockProps} isOpen={true} />);
    expect(screen.getByRole('complementary')).toHaveClass('open');
  });

  it('displays conversations when authenticated and conversations exist', () => {
    render(
      <Sidebar 
        {...mockProps} 
        conversations={sampleConversations}
      />
    );
    
    // Should display conversation titles
    expect(screen.getByText(/First conversation message/i)).toBeInTheDocument();
    expect(screen.getByText(/Second conversation message/i)).toBeInTheDocument();
    
    // Should have delete buttons
    expect(screen.getAllByTitle('Delete conversation')).toHaveLength(2);
  });

  it('highlights active conversation', () => {
    const activeConversation = { id: 'conv1' };
    
    render(
      <Sidebar 
        {...mockProps} 
        activeConversation={activeConversation}
        conversations={sampleConversations}
      />
    );
    
    // Find all conversation items
    const conversationItems = screen.getAllByRole('div', { name: /conversation-item/i });
    
    // First should be active, second should not
    expect(conversationItems[0]).toHaveClass('active');
    expect(conversationItems[1]).not.toHaveClass('active');
  });

  it('calls onSelectConversation when conversation is clicked', () => {
    render(
      <Sidebar 
        {...mockProps} 
        conversations={sampleConversations}
      />
    );
    
    // Click on the first conversation
    fireEvent.click(screen.getByText(/First conversation message/i));
    
    // Check if onSelectConversation was called with correct ID
    expect(mockProps.onSelectConversation).toHaveBeenCalledWith('conv1');
    
    // If on mobile (simulated by window.innerWidth), should also close sidebar
    Object.defineProperty(window, 'innerWidth', { value: 600, writable: true });
    fireEvent.click(screen.getByText(/First conversation message/i));
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('calls onDeleteConversation when delete button is clicked', () => {
    render(
      <Sidebar 
        {...mockProps} 
        conversations={sampleConversations}
      />
    );
    
    // Get all delete buttons and click the first one
    const deleteButtons = screen.getAllByTitle('Delete conversation');
    fireEvent.click(deleteButtons[0]);
    
    // Check if event propagation was stopped and delete function was called
    expect(mockProps.onDeleteConversation).toHaveBeenCalledWith('conv1');
    expect(mockProps.onSelectConversation).not.toHaveBeenCalled();
  });

  it('shows "No conversations" message when authenticated but no conversations exist', () => {
    render(<Sidebar {...mockProps} />);
    
    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    expect(screen.getByText('Start a new chat to begin')).toBeInTheDocument();
  });

  it('shows sign in message when not authenticated', () => {
    // Mock unauthenticated state
    authHooks.useAuthentication.mockReturnValue({
      isAuthenticated: false
    });
    
    render(<Sidebar {...mockProps} />);
    
    expect(screen.getByText(/Sign in to save your conversations/i)).toBeInTheDocument();
    
    // New chat button should not be visible
    expect(screen.queryByText(/\+ New Chat/i)).not.toBeInTheDocument();
  });

  it('calls onCreateNewConversation when new chat button is clicked', () => {
    render(<Sidebar {...mockProps} />);
    
    fireEvent.click(screen.getByText(/\+ New Chat/i));
    
    expect(mockProps.onCreateNewConversation).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    render(<Sidebar {...mockProps} isOpen={true} />);
    
    // Find and click the close button
    fireEvent.click(screen.getByRole('button', { name: /×/i }));
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });
}); 