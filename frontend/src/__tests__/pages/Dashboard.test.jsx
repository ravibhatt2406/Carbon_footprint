import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../../pages/Dashboard';
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
    get: vi.fn(),
  },
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading state on mount', () => {
    useAuth.mockReturnValue({ user: { displayName: 'John' } });
    api.get.mockReturnValue(new Promise(() => {})); // Never resolves to keep loading state

    render(<Dashboard />);
    expect(screen.getAllByText('Generating dashboard statistics...')[0]).toBeInTheDocument();
  });

  it('renders "Calculate Your First Carbon Footprint" when there are no logs', async () => {
    useAuth.mockReturnValue({ user: { displayName: 'John', points: 100 } });
    api.get.mockImplementation((url) => {
      if (url === '/footprint-logs/summary') return Promise.resolve({ current: null, previous: null, difference: 0, percentageChange: 0 });
      if (url === '/footprint-logs/history') return Promise.resolve([]);
      if (url === '/goals') return Promise.resolve([]);
      return Promise.reject(new Error('Unknown url'));
    });

    render(<Dashboard />);

    await vi.waitFor(() => {
      expect(screen.getByText('Calculate Your First Carbon Footprint')).toBeInTheDocument();
    });
  });

  it('renders dashboard with stats, charts, and recommendations when data is loaded', async () => {
    useAuth.mockReturnValue({ user: { displayName: 'John', points: 150 } });
    
    const mockSummary = {
      current: {
        total: 245.5,
        breakdown: { transportation: 100, electricity: 50, food: 75, shopping: 20.5 },
        advice: 'Good job reducing car usage.'
      },
      previous: { total: 280.0 },
      difference: -34.5,
      percentageChange: -12.32
    };

    const mockHistory = [
      { id: '1', date: '2026-06-01T00:00:00.000Z', total: 245.5 },
      { id: '2', date: '2026-05-01T00:00:00.000Z', total: 280.0 }
    ];

    const mockGoals = [
      { id: 'g1', targetValue: 50, currentProgress: 20, completed: false, endDate: '2026-07-01T00:00:00.000Z' }
    ];

    api.get.mockImplementation((url) => {
      if (url === '/footprint-logs/summary') return Promise.resolve(mockSummary);
      if (url === '/footprint-logs/history') return Promise.resolve(mockHistory);
      if (url === '/goals') return Promise.resolve(mockGoals);
      return Promise.reject(new Error('Unknown url'));
    });

    render(<Dashboard />);

    await vi.waitFor(() => {
      expect(screen.getByText('Hello, John!')).toBeInTheDocument();
    });

    expect(screen.getByText('245.5')).toBeInTheDocument();
    expect(screen.getByText('280')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    
    // Check charts
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();

    // Check goals
    expect(screen.getByText('Reduce 50 kg CO₂')).toBeInTheDocument();
    expect(screen.getByText('40% complete')).toBeInTheDocument();

    // Check AI recommendations
    expect(screen.getByText('Good job reducing car usage.')).toBeInTheDocument();
  });

  it('renders error message when API request fails', async () => {
    useAuth.mockReturnValue({ user: { displayName: 'John' } });
    api.get.mockRejectedValue(new Error('Network Error'));

    render(<Dashboard />);

    await vi.waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Could not retrieve dashboard statistics. Ensure backend is running.');
    });
  });
});
