import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';
import * as authHooks from '../../../auth/auth-hooks';

// Mock the authentication hooks
jest.mock('../../../auth/auth-hooks', () => ({
  useAuthentication: jest.fn()
}));

// Mock the UserProfile and LoginButton components
jest.mock('../../UserProfile', () => {
  return function MockUserProfile() {
    return <div data-testid="mock-user-profile">User Profile</div>;
  };
});

jest.mock('../../LoginButton', () => {
  return function MockLoginButton() {
    return <div data-testid="mock-login-button">Login Button</div>;
  };
});

describe('Header Component', () => {
  // Mock sidebar toggle function
  const mockSidebarToggle = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with app title', () => {
    // Mock unauthenticated state
    authHooks.useAuthentication.mockReturnValue({
      isAuthenticated: false,
      isLoading: false
    });

    render(<Header onSidebarToggle={mockSidebarToggle} />);
    
    // Check for app title and subtitle
    expect(screen.getByText('Legal Assistant 🇵🇱')).toBeInTheDocument();
    expect(screen.getByText('Ask questions about Polish legal matters')).toBeInTheDocument();
    
    // Check for hamburger menu button
    expect(screen.getByRole('button', { name: /toggle menu/i })).toBeInTheDocument();
  });

  it('calls sidebar toggle function when hamburger menu is clicked', () => {
    authHooks.useAuthentication.mockReturnValue({
      isAuthenticated: false,
      isLoading: false
    });

    render(<Header onSidebarToggle={mockSidebarToggle} />);
    
    const hamburgerButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(hamburgerButton);
    
    expect(mockSidebarToggle).toHaveBeenCalledTimes(1);
  });

  it('shows login button when user is not authenticated', () => {
    authHooks.useAuthentication.mockReturnValue({
      isAuthenticated: false,
      isLoading: false
    });

    render(<Header onSidebarToggle={mockSidebarToggle} />);
    
    expect(screen.getByTestId('mock-login-button')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-user-profile')).not.toBeInTheDocument();
  });

  it('shows user profile when user is authenticated', () => {
    authHooks.useAuthentication.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: 'Test User' }
    });

    render(<Header onSidebarToggle={mockSidebarToggle} />);
    
    expect(screen.getByTestId('mock-user-profile')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-login-button')).not.toBeInTheDocument();
  });

  it('shows loading state when authentication is loading', () => {
    authHooks.useAuthentication.mockReturnValue({
      isAuthenticated: false,
      isLoading: true
    });

    render(<Header onSidebarToggle={mockSidebarToggle} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-login-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-user-profile')).not.toBeInTheDocument();
  });
}); 