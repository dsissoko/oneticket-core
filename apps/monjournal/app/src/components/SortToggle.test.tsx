/**
 * Tests for SortToggle Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SortToggle } from './SortToggle';

describe('SortToggle Component', () => {
  it('displays correct label for descending sort order', () => {
    const mockOnChange = vi.fn();

    render(
      <SortToggle 
        sortOrder="desc"
        onSortChange={mockOnChange}
      />
    );

    expect(screen.getByText('Récent → Ancien')).toBeInTheDocument();
  });

  it('displays correct label for ascending sort order', () => {
    const mockOnChange = vi.fn();

    render(
      <SortToggle 
        sortOrder="asc"
        onSortChange={mockOnChange}
      />
    );

    expect(screen.getByText('Ancien → Récent')).toBeInTheDocument();
  });

  it('calls onSortChange with opposite order when clicked', () => {
    const mockOnChange = vi.fn();

    const { rerender } = render(
      <SortToggle 
        sortOrder="desc"
        onSortChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnChange).toHaveBeenCalledWith('asc');

    // Rerender with new sort order
    rerender(
      <SortToggle 
        sortOrder="asc"
        onSortChange={mockOnChange}
      />
    );

    fireEvent.click(button);
    expect(mockOnChange).toHaveBeenCalledWith('desc');
  });

  it('calls onSortChange with Enter key', () => {
    const mockOnChange = vi.fn();

    render(
      <SortToggle 
        sortOrder="desc"
        onSortChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

    expect(mockOnChange).toHaveBeenCalledWith('asc');
  });

  it('calls onSortChange with Space key', () => {
    const mockOnChange = vi.fn();

    render(
      <SortToggle 
        sortOrder="desc"
        onSortChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });

    expect(mockOnChange).toHaveBeenCalledWith('asc');
  });

  it('displays sort icon', () => {
    const mockOnChange = vi.fn();

    render(
      <SortToggle 
        sortOrder="desc"
        onSortChange={mockOnChange}
      />
    );

    // Icon should be visible (either ⬇️ or ⬆️)
    expect(screen.getByText('⬇️')).toBeInTheDocument();
  });

  it('updates icon when sort order changes', () => {
    const mockOnChange = vi.fn();

    const { rerender } = render(
      <SortToggle 
        sortOrder="desc"
        onSortChange={mockOnChange}
      />
    );

    expect(screen.getByText('⬇️')).toBeInTheDocument();

    rerender(
      <SortToggle 
        sortOrder="asc"
        onSortChange={mockOnChange}
      />
    );

    expect(screen.getByText('⬆️')).toBeInTheDocument();
  });

  it('has appropriate aria-label for accessibility', () => {
    const mockOnChange = vi.fn();

    render(
      <SortToggle 
        sortOrder="desc"
        onSortChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button.getAttribute('aria-label')).toContain('Trier par');
  });

  it('has aria-pressed attribute', () => {
    const mockOnChange = vi.fn();

    const { rerender } = render(
      <SortToggle 
        sortOrder="desc"
        onSortChange={mockOnChange}
      />
    );

    let button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');

    rerender(
      <SortToggle 
        sortOrder="asc"
        onSortChange={mockOnChange}
      />
    );

    button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('handles Space key press correctly', () => {
    const mockOnChange = vi.fn();

    render(
      <SortToggle 
        sortOrder="desc"
        onSortChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    button.focus();
    
    // Simulate Space key press
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });

    // Note: Space key on button should trigger click
    expect(mockOnChange).toHaveBeenCalled();
  });
});
