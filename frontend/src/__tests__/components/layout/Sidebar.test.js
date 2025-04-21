import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../../../components/layout/Sidebar';
import { useAuthentication } from '../../../auth/auth-hooks';

// Mock the auth hooks
jest.mock('../../../auth/auth-hooks', () => ({
  useAuthentication: jest.fn()
}));

describe('Sidebar Component', () => {
  const mockConversations = [
    {
      id: '1',
      messages: [{ content: 'First conversation' }],
      updated_at: '2023-05-01T12:00:00Z'
    },
    {
      id: '2',
      messages: [{ content: 'Second conversation' }],
      updated_at: '2023-05-02T12:00:00Z'
    }
  ];

  beforeEach(() => {
    // Reset mocks
    useAuthentication.mockReset();
    
    // Default mock implementation
    useAuthentication.mockReturnValue({
      isAuthenticated: true
    });
  });

  test('renders sidebar header with title', () => {
    render(
      <Sidebar
        isOpen={true}
        conversations={[]}
        activeConversation={null}
        onSelectConversation={() => {}}
        onCreateNewConversation={() => {}}
        onDeleteConversation={() => {}}
        onClose={() => {}}
      />
    );
    
    // Check that the header is rendered
    const header = screen.getByText('Conversations');
    expect(header).toBeInTheDocument();
  });

  test('shows new chat button for authenticated users', () => {
    // Setup authenticated user
    useAuthentication.mockReturnValue({
      isAuthenticated: true
    });
    
    render(
      <Sidebar
        isOpen={true}
        conversations={[]}
        activeConversation={null}
        onSelectConversation={() => {}}
        onCreateNewConversation={() => {}}
        onDeleteConversation={() => {}}
        onClose={() => {}}
      />
    );
    
    // Check for new chat button
    const newChatButton = screen.getByText('+ New Chat');
    expect(newChatButton).toBeInTheDocument();
  });

  test('does not show new chat button for unauthenticated users', () => {
    // Setup unauthenticated user
    useAuthentication.mockReturnValue({
      isAuthenticated: false
    });
    
    render(
      <Sidebar
        isOpen={true}
        conversations={[]}
        activeConversation={null}
        onSelectConversation={() => {}}
        onCreateNewConversation={() => {}}
        onDeleteConversation={() => {}}
        onClose={() => {}}
      />
    );
    
    // Check that new chat button is not rendered
    const newChatButton = screen.queryByText('+ New Chat');
    expect(newChatButton).not.toBeInTheDocument();
  });

  test('renders list of conversations', () => {
    render(
      <Sidebar
        isOpen={true}
        conversations={mockConversations}
        activeConversation={null}
        onSelectConversation={() => {}}
        onCreateNewConversation={() => {}}
        onDeleteConversation={() => {}}
        onClose={() => {}}
      />
    );
    
    // Check that conversation titles are rendered
    const firstConversation = screen.getByText(/First conversation/i);
    expect(firstConversation).toBeInTheDocument();
    
    const secondConversation = screen.getByText(/Second conversation/i);
    expect(secondConversation).toBeInTheDocument();
  });

  test('shows empty state when no conversations exist', () => {
    render(
      <Sidebar
        isOpen={true}
        conversations={[]}
        activeConversation={null}
        onSelectConversation={() => {}}
        onCreateNewConversation={() => {}}
        onDeleteConversation={() => {}}
        onClose={() => {}}
      />
    );
    
    // Check for empty state message
    const emptyMessage = screen.getByText('No conversations yet');
    expect(emptyMessage).toBeInTheDocument();
  });

  test('calls onSelectConversation when conversation is clicked', () => {
    const mockSelectFn = jest.fn();
    
    render(
      <Sidebar
        isOpen={true}
        conversations={mockConversations}
        activeConversation={null}
        onSelectConversation={mockSelectFn}
        onCreateNewConversation={() => {}}
        onDeleteConversation={() => {}}
        onClose={() => {}}
      />
    );
    
    // Click on a conversation
    const conversation = screen.getByText(/First conversation/i);
    fireEvent.click(conversation);
    
    // Check that select function was called with the right ID
    expect(mockSelectFn).toHaveBeenCalledWith('1');
  });

  test('calls onDeleteConversation when delete button is clicked', () => {
    const mockDeleteFn = jest.fn();
    
    render(
      <Sidebar
        isOpen={true}
        conversations={mockConversations}
        activeConversation={null}
        onSelectConversation={() => {}}
        onCreateNewConversation={() => {}}
        onDeleteConversation={mockDeleteFn}
        onClose={() => {}}
      />
    );
    
    // Get all delete buttons (×)
    const deleteButtons = screen.getAllByTitle('Delete conversation');
    
    // Click the first one
    fireEvent.click(deleteButtons[0]);
    
    // Check that delete function was called with the right ID
    expect(mockDeleteFn).toHaveBeenCalledWith('1');
  });

  test('applies active class to the currently active conversation', () => {
    render(
      <Sidebar
        isOpen={true}
        conversations={mockConversations}
        activeConversation={{ id: '1', messages: [] }}
        onSelectConversation={() => {}}
        onCreateNewConversation={() => {}}
        onDeleteConversation={() => {}}
        onClose={() => {}}
      />
    );
    
    // Check for active class (using a regex to find the item with active class)
    const activeElements = document.querySelectorAll('.conversation-item.active');
    expect(activeElements.length).toBe(1);
  });
}); 