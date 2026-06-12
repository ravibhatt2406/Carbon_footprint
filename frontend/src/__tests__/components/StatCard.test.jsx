import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatCard from '../../components/StatCard';
import { Leaf } from 'lucide-react';

describe('StatCard', () => {
  it('renders title, value, and unit correctly', () => {
    render(
      <StatCard
        title="Test Title"
        value={150}
        unit="kg CO2"
        icon={Leaf}
      />
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('kg CO2')).toBeInTheDocument();
  });

  it('renders "No records" when value is null or undefined', () => {
    render(
      <StatCard
        title="Test Title"
        value={null}
        unit="kg CO2"
      />
    );
    expect(screen.getByText('No records')).toBeInTheDocument();
  });

  it('renders trend details correctly when provided', () => {
    render(
      <StatCard
        title="Test Title"
        value={100}
        unit="kg CO2"
        trend="down"
        trendValue={15.5}
      />
    );
    const trendSpan = screen.getByLabelText('decreased by 15.5 percent from last record');
    expect(trendSpan).toBeInTheDocument();
    expect(trendSpan).toHaveTextContent('↓ 15.5%');
  });
});
