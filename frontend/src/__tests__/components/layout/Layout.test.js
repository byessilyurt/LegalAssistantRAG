import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../../../components/layout/Layout';

// Mock the auth-hooks
jest.mock('../../../auth/auth-hooks', () => ({
  useAuthentication: jest.fn(),
}));

// Mock the child components
jest.mock('../../../components/layout/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../../../components/layout/Sidebar', () => () => <div data-testid="mock-sidebar">Sidebar</div>);

// Import the mocked useAuthentication
import { useAuthentication } from '../../../auth/auth-hooks';

describe('Layout Component', () => {
  test('renders header and main content', () => {
    // Mock the useAuthentication hook to return not authenticated
    useAuthentication.mockReturnValue({ isAuthenticated: false });
    
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders sidebar', () => {
    // Mock the useAuthentication hook
    useAuthentication.mockReturnValue({ isAuthenticated: false });
    
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
  });
}); 