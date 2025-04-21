import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Layout from '../Layout';
import * as authHooks from '../../../auth/auth-hooks';

// Mock the Auth0 context
jest.mock('../../../auth/auth-hooks', () => ({
  useAuthentication: jest.fn(),
  useAccessToken: jest.fn()
}));

// Mock child components
jest.mock('../Header', () => {
  return function MockHeader({ onSidebarToggle }) {
    return (
      <header data-testid="mock-header">
        <button data-testid="sidebar-toggle" onClick={onSidebarToggle}>
          Toggle
        </button>
      </header>
    );
  };
});

jest.mock('../Sidebar', () => {
  return function MockSidebar({ isOpen, onClose, onSelectConversation, onCreateNewConversation, onDeleteConversation }) {
    return (
      <div data-testid="mock-sidebar" className={isOpen ? 'open' : ''}>
        <button data-testid="close-sidebar" onClick={onClose}>Close</button>
        <button data-testid="new-conversation" onClick={onCreateNewConversation}>New</button>
        <button data-testid="select-conversation" onClick={() => onSelectConversation('test-id')}>Select</button>
        <button data-testid="delete-conversation" onClick={() => onDeleteConversation('test-id')}>Delete</button>
      </div>
    );
  };
});

describe('Layout Component', () => {
  beforeEach(() => {
    // Mock the authentication hook
    authHooks.useAuthentication.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Test User' }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <Layout 
        conversations={[]}
        activeConversation={null}
        onSelectConversation={jest.fn()}
        onCreateNewConversation={jest.fn()}
        onDeleteConversation={jest.fn()}
      >
        <div data-testid="child-content">Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('toggles sidebar when the toggle button is clicked', () => {
    render(
      <Layout 
        conversations={[]}
        activeConversation={null}
        onSelectConversation={jest.fn()}
        onCreateNewConversation={jest.fn()}
        onDeleteConversation={jest.fn()}
      >
        <div>Content</div>
      </Layout>
    );
    
    const toggleButton = screen.getByTestId('sidebar-toggle');
    
    // Sidebar should be closed initially
    expect(screen.getByTestId('mock-sidebar')).not.toHaveClass('open');
    
    // Click to open sidebar
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('mock-sidebar')).toHaveClass('open');
    
    // Click again to close sidebar
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('mock-sidebar')).not.toHaveClass('open');
  });

  it('closes sidebar when close button is clicked', () => {
    render(
      <Layout 
        conversations={[]}
        activeConversation={null}
        onSelectConversation={jest.fn()}
        onCreateNewConversation={jest.fn()}
        onDeleteConversation={jest.fn()}
      >
        <div>Content</div>
      </Layout>
    );
    
    // First open the sidebar
    fireEvent.click(screen.getByTestId('sidebar-toggle'));
    expect(screen.getByTestId('mock-sidebar')).toHaveClass('open');
    
    // Click close button
    fireEvent.click(screen.getByTestId('close-sidebar'));
    expect(screen.getByTestId('mock-sidebar')).not.toHaveClass('open');
  });

  it('calls functions for conversation management correctly', () => {
    const mockSelectConversation = jest.fn();
    const mockCreateNewConversation = jest.fn();
    const mockDeleteConversation = jest.fn();
    
    render(
      <Layout 
        conversations={[]}
        activeConversation={null}
        onSelectConversation={mockSelectConversation}
        onCreateNewConversation={mockCreateNewConversation}
        onDeleteConversation={mockDeleteConversation}
      >
        <div>Content</div>
      </Layout>
    );
    
    // Test new conversation
    fireEvent.click(screen.getByTestId('new-conversation'));
    expect(mockCreateNewConversation).toHaveBeenCalledTimes(1);
    
    // Test select conversation
    fireEvent.click(screen.getByTestId('select-conversation'));
    expect(mockSelectConversation).toHaveBeenCalledWith('test-id');
    
    // Test delete conversation
    fireEvent.click(screen.getByTestId('delete-conversation'));
    expect(mockDeleteConversation).toHaveBeenCalledWith('test-id');
  });

  it('adds sidebar-open class to body when sidebar is open', () => {
    render(
      <Layout 
        conversations={[]}
        activeConversation={null}
        onSelectConversation={jest.fn()}
        onCreateNewConversation={jest.fn()}
        onDeleteConversation={jest.fn()}
      >
        <div>Content</div>
      </Layout>
    );
    
    // Body should not have sidebar-open class initially
    expect(document.body.classList.contains('sidebar-open')).toBe(false);
    
    // Open sidebar
    fireEvent.click(screen.getByTestId('sidebar-toggle'));
    expect(document.body.classList.contains('sidebar-open')).toBe(true);
    
    // Close sidebar
    fireEvent.click(screen.getByTestId('close-sidebar'));
    expect(document.body.classList.contains('sidebar-open')).toBe(false);
  });
}); 