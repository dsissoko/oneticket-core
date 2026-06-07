import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from './ProgressBar';
import { renderWithProviders } from '../test/utils';

describe('ProgressBar', () => {
  it('renders current/total text', () => {
    renderWithProviders(<ProgressBar current={3} total={10} />);
    expect(screen.getByText('3/10')).toBeInTheDocument();
  });

  it('renders 0/total when current is 0', () => {
    renderWithProviders(<ProgressBar current={0} total={10} />);
    expect(screen.getByText('0/10')).toBeInTheDocument();
  });

  it('renders total/total when current equals total', () => {
    renderWithProviders(<ProgressBar current={10} total={10} />);
    expect(screen.getByText('10/10')).toBeInTheDocument();
  });

  it('clamps current to total when exceeds total', () => {
    renderWithProviders(<ProgressBar current={15} total={10} />);
    expect(screen.getByText('10/10')).toBeInTheDocument();
  });

  it('clamps current to 0 when negative', () => {
    renderWithProviders(<ProgressBar current={-5} total={10} />);
    expect(screen.getByText('0/10')).toBeInTheDocument();
  });

  it('renders progress bar element', () => {
    renderWithProviders(<ProgressBar current={5} total={10} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('progress bar has correct aria attributes', () => {
    renderWithProviders(<ProgressBar current={3} total={10} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '3');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '10');
  });

  it('handles zero total gracefully', () => {
    renderWithProviders(<ProgressBar current={0} total={0} />);
    expect(screen.getByText('0/0')).toBeInTheDocument();
  });
});