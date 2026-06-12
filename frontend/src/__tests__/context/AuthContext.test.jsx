import React, { useEffect } from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(() => vi.fn()),
  updateProfile: vi.fn(),
}));

// Mock api
vi.mock('../../utils/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Test helper component
function TestComponent() {
  const { user, login, register, logout, loading, isSimulation } = useAuth();
  
  if (loading) return <div data-testid="loading">Loading...</div>;
  if (!user) return <button onClick={() => login('u@x.com', 'p')} data-testid="login-btn">Login</button>;
  return (
    <div>
      <span data-testid="email">{user.email}</span>
      <span data-testid="points">{user.points}</span>
      <span data-testid="simulation">{isSimulation ? 'sim' : 'real'}</span>
      <button onClick={logout} data-testid="logout-btn">Logout</button>
    </div>
  );
}

describe('AuthContext (Simulation mode)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Ensure we run in simulation mode for this test
    localStorage.clear();
  });

  it('initializes with null user and not loading if no token is stored', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-btn')).toBeInTheDocument();
  });

  it('authenticates automatically on mount if token is stored', async () => {
    localStorage.setItem('ecolens_token', 'mock_token');
    api.get.mockResolvedValue({ uid: '123', email: 'user@example.com', displayName: 'User', points: 40 });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await vi.waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('email')).toHaveTextContent('user@example.com');
    expect(screen.getByTestId('points')).toHaveTextContent('40');
    expect(screen.getByTestId('simulation')).toHaveTextContent('sim');
    expect(api.get).toHaveBeenCalledWith('/auth/profile');
  });

  it('logs in user successfully in simulation mode', async () => {
    api.post.mockResolvedValue({
      token: 'new_token',
      user: { uid: '123', email: 'u@x.com', displayName: 'U', points: 10 }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByTestId('login-btn');
    await act(async () => {
      fireEvent.click(loginBtn);
    });

    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'u@x.com', password: 'p' });
    expect(localStorage.getItem('ecolens_token')).toBe('new_token');
    expect(screen.getByTestId('email')).toHaveTextContent('u@x.com');
  });

  it('logs out user successfully', async () => {
    localStorage.setItem('ecolens_token', 'mock_token');
    api.get.mockResolvedValue({ uid: '123', email: 'user@example.com', displayName: 'User', points: 40 });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await vi.waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    const logoutBtn = screen.getByTestId('logout-btn');
    await act(async () => {
      fireEvent.click(logoutBtn);
    });

    expect(localStorage.getItem('ecolens_token')).toBeNull();
    expect(screen.getByTestId('login-btn')).toBeInTheDocument();
  });
});
