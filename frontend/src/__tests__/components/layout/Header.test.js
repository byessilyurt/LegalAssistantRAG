import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../../../components/layout/Header';

// Mock the auth-hooks
jest.mock('../../../auth/auth-hooks', () => ({
  useAuthentication: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { name: 'Test User' },
    logout: jest.fn(),
  }),
}));

// Mock the UserProfile component
jest.mock('../../../components/UserProfile', () => {
  return function MockUserProfile() {
    return <div data-testid="user-profile">Test User Profile</div>;
  };
});

describe('Header Component', () => {
  test('renders the app title', () => {
    render(<Header />);
    
    expect(screen.getByText('Legal Assistant 🇵🇱')).toBeInTheDocument();
  });

  test('renders subtitle', () => {
    render(<Header />);
    
    expect(screen.getByText(/Ask questions about Polish legal matters/i)).toBeInTheDocument();
  });

  test('renders user profile when authenticated', () => {
    render(<Header />);
    
    expect(screen.getByTestId('user-profile')).toBeInTheDocument();
  });
}); 