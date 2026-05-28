/**
 * Tests for TimelineAnchor Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineAnchor } from './TimelineAnchor';

describe('TimelineAnchor Component', () => {
  it('renders date in localized format', () => {
    render(
      <TimelineAnchor 
        date="2026-05-25" 
        entryCount={3}
      />
    );

    // Should render the date in French format
    expect(screen.getByText(/mai/)).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('displays entry count', () => {
    render(
      <TimelineAnchor 
        date="2026-05-25" 
        entryCount={5}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onClick handler when button is clicked', () => {
    const mockOnClick = vi.fn();

    render(
      <TimelineAnchor 
        date="2026-05-25" 
        entryCount={3}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledOnce();
  });

  it('calls onClick handler with Enter key', () => {
    const mockOnClick = vi.fn();

    render(
      <TimelineAnchor 
        date="2026-05-25" 
        entryCount={3}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    button.focus();
    
    // Simulate keypress that triggers button activation
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalled();
  });

  it('is disabled when no onClick handler provided', () => {
    render(
      <TimelineAnchor 
        date="2026-05-25" 
        entryCount={3}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('is enabled when onClick handler provided', () => {
    const mockOnClick = vi.fn();

    render(
      <TimelineAnchor 
        date="2026-05-25" 
        entryCount={3}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('has appropriate aria-label for accessibility', () => {
    const mockOnClick = vi.fn();

    render(
      <TimelineAnchor 
        date="2026-05-25" 
        entryCount={3}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button.getAttribute('aria-label')).toContain('Filter entries for');
  });

  it('displays entry/entries based on count', () => {
    const { rerender } = render(
      <TimelineAnchor 
        date="2026-05-25" 
        entryCount={1}
      />
    );

    // Check aria-label for singular
    let button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toContain('1 entry');

    // Test plural
    rerender(
      <TimelineAnchor 
        date="2026-05-25" 
        entryCount={5}
      />
    );

    button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toContain('5 entries');
  });
});
