import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CarbonCalculator from '../../pages/CarbonCalculator';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

// Mock router hooks & context
vi.mock('react-router-dom', () => ({
  Link: vi.fn(({ to, children }) => <a href={to}>{children}</a>),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../utils/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('CarbonCalculator', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders step 1 (Transportation) initially', () => {
    useAuth.mockReturnValue({ refreshPoints: vi.fn() });
    render(<CarbonCalculator />);

    expect(screen.getByText('Weekly Commuting Distances')).toBeInTheDocument();
    expect(screen.getByLabelText('Car (km)')).toBeInTheDocument();
    expect(screen.getByLabelText('Bicycle (km)')).toBeInTheDocument();
  });

  it('navigates through the steps correctly', () => {
    useAuth.mockReturnValue({ refreshPoints: vi.fn() });
    render(<CarbonCalculator />);

    // Step 1 -> Step 2
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Home Electricity Usage')).toBeInTheDocument();
    expect(screen.getByLabelText('Monthly Energy (kWh)')).toBeInTheDocument();

    // Step 2 -> Step 3
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Dietary Choices')).toBeInTheDocument();
    expect(screen.getByText('Select the option that matches your weekly food habits best.')).toBeInTheDocument();

    // Step 3 -> Step 4
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Shopping Consumer Habits')).toBeInTheDocument();
    expect(screen.getByText('Select your purchasing level for clothing, goods, and electronics.')).toBeInTheDocument();

    // Step 4 -> Step 3 (Back)
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Select the option that matches your weekly food habits best.')).toBeInTheDocument();
  });

  it('submits the form successfully and renders calculation results', async () => {
    const mockRefreshPoints = vi.fn().mockResolvedValue();
    useAuth.mockReturnValue({ refreshPoints: mockRefreshPoints });

    const mockResponse = {
      total: 215.3,
      breakdown: { transportation: 120.3, electricity: 45, food: 30, shopping: 20 },
      advice: 'Try walking more for close distances.'
    };
    api.post.mockResolvedValue(mockResponse);

    render(<CarbonCalculator />);

    // Go to step 2
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    // Go to step 3
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    // Go to step 4
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    // Click submit
    const submitBtn = screen.getByRole('button', { name: 'Submit Details' });
    fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(screen.getByText('Result Computed')).toBeInTheDocument();
    });

    expect(screen.getByText('215.3')).toBeInTheDocument();
    expect(screen.getByText('Try walking more for close distances.')).toBeInTheDocument();
    expect(mockRefreshPoints).toHaveBeenCalled();
  });
});
