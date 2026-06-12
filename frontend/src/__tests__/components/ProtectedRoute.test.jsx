import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

// Mock the components and hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => <div data-testid="navigate" data-to={to}>Redirected</div>),
}));

vi.mock('../../components/LoadingSpinner', () => ({
  default: vi.fn(({ message }) => <div data-testid="spinner">{message}</div>),
}));

describe('ProtectedRoute', () => {
  it('renders loading spinner when loading is true', () => {
    useAuth.mockReturnValue({ user: null, loading: true });
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.getByText('Checking credentials...')).toBeInTheDocument();
  });

  it('redirects to /login when user is not logged in', () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });

  it('renders children when user is authenticated', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' }, loading: false });
    render(
      <ProtectedRoute>
        <div data-testid="content">Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });
});
