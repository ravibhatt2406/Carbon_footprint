import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Challenges from '../../pages/Challenges';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

// Mock context & api
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../utils/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Challenges Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading spinner initially', () => {
    useAuth.mockReturnValue({ user: { points: 50 }, refreshPoints: vi.fn() });
    api.get.mockReturnValue(new Promise(() => {})); // remains loading

    render(<Challenges />);
    expect(screen.getAllByText('Loading weekly eco challenges...')[0]).toBeInTheDocument();
  });

  it('renders challenges list correctly', async () => {
    useAuth.mockReturnValue({ user: { points: 75 }, refreshPoints: vi.fn() });
    
    const mockChallenges = [
      { id: 'ch1', title: 'Plant a Tree', description: 'Plant one tree in your backyard', points: 30, completed: false },
      { id: 'ch2', title: 'Use a reusable bottle', description: 'Avoid plastic bottles for a week', points: 15, completed: true }
    ];
    api.get.mockResolvedValue(mockChallenges);

    render(<Challenges />);

    await vi.waitFor(() => {
      expect(screen.getByText('Plant a Tree')).toBeInTheDocument();
    });

    expect(screen.getByText('75 PTS')).toBeInTheDocument();
    expect(screen.getByText('Use a reusable bottle')).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: 'Use a reusable bottle - already completed' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mark Plant a Tree as completed' })).toBeEnabled();
  });

  it('allows completing an eco challenge', async () => {
    const mockRefreshPoints = vi.fn().mockResolvedValue();
    useAuth.mockReturnValue({ user: { points: 75 }, refreshPoints: mockRefreshPoints });

    const mockChallenges = [
      { id: 'ch1', title: 'Plant a Tree', description: 'Plant one tree in your backyard', points: 30, completed: false }
    ];
    api.get.mockResolvedValue(mockChallenges);
    api.post.mockResolvedValue({});

    render(<Challenges />);

    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: 'Mark Plant a Tree as completed' })).toBeInTheDocument();
    });

    const completeBtn = screen.getByRole('button', { name: 'Mark Plant a Tree as completed' });
    fireEvent.click(completeBtn);

    await vi.waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/challenges/ch1/complete');
    });
    expect(mockRefreshPoints).toHaveBeenCalled();
  });
});
