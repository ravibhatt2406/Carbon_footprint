import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RegisterPage from '../../pages/RegisterPage';
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

describe('RegisterPage', () => {
  it('renders register form items', () => {
    useAuth.mockReturnValue({ register: vi.fn(), error: null });
    render(<RegisterPage />);

    expect(screen.getByLabelText('Full Name / Display Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('shows error if submitting empty fields', () => {
    useAuth.mockReturnValue({ register: vi.fn(), error: null });
    render(<RegisterPage />);

    const submitBtn = screen.getByRole('button', { name: 'Create Account' });
    fireEvent.click(submitBtn);

    expect(screen.getByRole('alert')).toHaveTextContent('Please fill in all fields.');
  });

  it('shows error if password is less than 6 characters', () => {
    useAuth.mockReturnValue({ register: vi.fn(), error: null });
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Full Name / Display Name'), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Password must be at least 6 characters long.');
  });

  it('shows error if passwords do not match', () => {
    useAuth.mockReturnValue({ register: vi.fn(), error: null });
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Full Name / Display Name'), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password456' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match.');
  });

  it('calls register and navigates to dashboard on successful submission', async () => {
    const mockRegister = vi.fn().mockResolvedValue();
    useAuth.mockReturnValue({ register: mockRegister, error: null });
    
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Full Name / Display Name'), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(mockRegister).toHaveBeenCalledWith('alex@example.com', 'password123', 'Alex');
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
