import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Goals from '../../pages/Goals';
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
    put: vi.fn(),
  },
}));

describe('Goals Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading spinner initially', () => {
    useAuth.mockReturnValue({ refreshPoints: vi.fn() });
    api.get.mockReturnValue(new Promise(() => {})); // remains loading

    render(<Goals />);
    expect(screen.getAllByText('Loading your carbon reduction goals...')[0]).toBeInTheDocument();
  });

  it('renders goals list correctly', async () => {
    useAuth.mockReturnValue({ refreshPoints: vi.fn() });
    
    const mockGoals = [
      { id: '1', targetValue: 100, currentProgress: 40, completed: false, startDate: '2026-06-12T00:00:00Z', endDate: '2026-07-12T00:00:00Z' },
      { id: '2', targetValue: 50, currentProgress: 50, completed: true, startDate: '2026-05-12T00:00:00Z', endDate: '2026-06-12T00:00:00Z' }
    ];
    api.get.mockResolvedValue(mockGoals);

    render(<Goals />);

    await vi.waitFor(() => {
      expect(screen.getByText('Active Goals')).toBeInTheDocument();
    });

    expect(screen.getByText('Completed Goals')).toBeInTheDocument();
    expect(screen.getByText('Reduce 100 kg CO₂')).toBeInTheDocument();
    expect(screen.getByText('40% complete')).toBeInTheDocument();
  });

  it('allows creating a new goal', async () => {
    useAuth.mockReturnValue({ refreshPoints: vi.fn() });
    api.get.mockResolvedValue([]);
    api.post.mockResolvedValue({ id: '3', targetValue: 150, currentProgress: 0, completed: false });

    render(<Goals />);

    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: 'Launch Target Goal' })).toBeInTheDocument();
    });

    const targetInput = screen.getByLabelText('Reduction Target (kg CO₂)');
    fireEvent.change(targetInput, { target: { value: '150' } });
    
    const submitBtn = screen.getByRole('button', { name: 'Launch Target Goal' });
    fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/goals', expect.objectContaining({
        targetValue: 150
      }));
    });
  });

  it('allows updating an active goal progress', async () => {
    const mockRefreshPoints = vi.fn().mockResolvedValue();
    useAuth.mockReturnValue({ refreshPoints: mockRefreshPoints });
    
    const mockGoals = [
      { id: '1', targetValue: 100, currentProgress: 40, completed: false, startDate: '2026-06-12T00:00:00Z', endDate: '2026-07-12T00:00:00Z' }
    ];
    api.get.mockResolvedValue(mockGoals);
    api.put.mockResolvedValue({ id: '1', targetValue: 100, currentProgress: 60, completed: false });

    render(<Goals />);

    await vi.waitFor(() => {
      expect(screen.getByLabelText(/Log reduction in kg for goal: Reduce 100 kg CO₂/)).toBeInTheDocument();
    });

    const progressInput = screen.getByLabelText(/Log reduction in kg for goal: Reduce 100 kg CO₂/);
    fireEvent.change(progressInput, { target: { value: '60' } });

    const updateBtn = screen.getByRole('button', { name: 'Update Progress' });
    fireEvent.click(updateBtn);

    await vi.waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/goals/1', { currentProgress: 60 });
      expect(mockRefreshPoints).toHaveBeenCalled();
    });
  });
});
