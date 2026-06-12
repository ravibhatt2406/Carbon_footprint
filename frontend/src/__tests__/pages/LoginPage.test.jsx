import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from '../../pages/LoginPage';
import { useAuth } from '../../context/AuthContext';

// Mock components & router hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  Link: vi.fn(({ to, children }) => <a href={to}>{children}</a>),
  useNavigate: () => mockNavigate,
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('LoginPage', () => {
  it('renders login form items', () => {
    useAuth.mockReturnValue({ login: vi.fn(), error: null });
    render(<LoginPage />);

    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('shows error if submitting empty fields', async () => {
    useAuth.mockReturnValue({ login: vi.fn(), error: null });
    render(<LoginPage />);

    const submitBtn = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitBtn);

    expect(screen.getByRole('alert')).toHaveTextContent('Please fill in all fields.');
  });

  it('calls login and navigates to dashboard on successful submission', async () => {
    const mockLogin = vi.fn().mockResolvedValue();
    useAuth.mockReturnValue({ login: mockLogin, error: null });
    
    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitBtn = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123');
    // We expect navigate to be called in microtask tick
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays API error message from AuthContext', () => {
    useAuth.mockReturnValue({ login: vi.fn(), error: 'Invalid email or password' });
    render(<LoginPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
  });
});
