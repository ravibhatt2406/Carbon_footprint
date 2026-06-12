import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressBar from '../../components/ProgressBar';

describe('ProgressBar', () => {
  it('calculates percentage correctly and sets aria attributes', () => {
    render(<ProgressBar value={50} max={100} />);
    
    expect(screen.getByText('50% complete')).toBeInTheDocument();
    expect(screen.getByText('50 / 100 kg CO₂')).toBeInTheDocument();
    
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-label', '50% complete: 50 of 100 kg CO₂ reduced');
  });

  it('clamps percentage to 100% when progress exceeds max', () => {
    render(<ProgressBar value={120} max={100} />);
    expect(screen.getByText('100% complete')).toBeInTheDocument();
  });

  it('handles max being 0 gracefully', () => {
    render(<ProgressBar value={50} max={0} />);
    expect(screen.getByText('0% complete')).toBeInTheDocument();
  });
});
