import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReceiptAnalysis from '../../pages/ReceiptAnalysis';
import { api } from '../../utils/api';

// Mock api
vi.mock('../../utils/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('ReceiptAnalysis Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
  });

  it('renders upload area correctly initially', () => {
    render(<ReceiptAnalysis />);

    expect(screen.getByText('Upload Document')).toBeInTheDocument();
    expect(screen.getByText('Select or drag file')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Parse Document Impact' })).toBeDisabled();
  });

  it('handles file selection and shows preview/scan button', () => {
    const { container } = render(<ReceiptAnalysis />);

    const fileInput = container.querySelector('#ocr-file-input');
    expect(fileInput).toBeInTheDocument();

    const file = new File(['dummy content'], 'test-invoice.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByAltText('Preview of uploaded receipt or bill')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Parse Document Impact' })).not.toBeDisabled();
  });

  it('submits file to API and displays scan results', async () => {
    const mockResponse = {
      success: true,
      data: {
        estimatedCarbonImpact: 45.2,
        type: 'shopping',
        unitsConsumed: 5,
        purchaseAmount: 120.5,
        productCategories: ['Electronics', 'Household'],
        explanation: 'Great job keeping usage moderate!'
      }
    };
    api.post.mockResolvedValue(mockResponse);

    const { container } = render(<ReceiptAnalysis />);

    const fileInput = container.querySelector('#ocr-file-input');
    const file = new File(['dummy content'], 'test-invoice.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const submitBtn = screen.getByRole('button', { name: 'Parse Document Impact' });
    fireEvent.click(submitBtn);

    await vi.waitFor(() => {
      expect(screen.getByText('45.2 kg')).toBeInTheDocument();
    });

    expect(screen.getByText('5 items')).toBeInTheDocument();
    expect(screen.getByText('$120.50')).toBeInTheDocument();
    expect(screen.getByText('Electronics, Household')).toBeInTheDocument();
    expect(screen.getByText('Great job keeping usage moderate!')).toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith('/ocr/parse', expect.any(FormData));
  });
});
