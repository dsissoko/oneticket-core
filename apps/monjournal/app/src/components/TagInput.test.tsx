import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TagInput } from './TagInput';

describe('TagInput', () => {
  const mockOnChange = vi.fn();
  const mockOnAddTag = vi.fn();
  const suggestions = ['personal', 'work', 'health'];

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnAddTag.mockClear();
  });

  it('renders input field', () => {
    render(
      <TagInput
        value=""
        onChange={mockOnChange}
        suggestions={suggestions}
        onAddTag={mockOnAddTag}
      />
    );
    const input = screen.getByPlaceholderText('Type tag name...');
    expect(input).toBeInTheDocument();
  });

  it('shows filtered suggestions when input has text', async () => {
    const { rerender } = render(
      <TagInput
        value=""
        onChange={mockOnChange}
        suggestions={suggestions}
        onAddTag={mockOnAddTag}
      />
    );
    const input = screen.getByPlaceholderText('Type tag name...') as HTMLInputElement;
    
    // Simulate focus
    await userEvent.click(input);
    
    // Rerender with filtered value
    rerender(
      <TagInput
        value="per"
        onChange={mockOnChange}
        suggestions={suggestions}
        onAddTag={mockOnAddTag}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('personal')).toBeInTheDocument();
    });
  });

  it('filters suggestions case-insensitively', async () => {
    const { rerender } = render(
      <TagInput
        value=""
        onChange={mockOnChange}
        suggestions={suggestions}
        onAddTag={mockOnAddTag}
      />
    );
    const input = screen.getByPlaceholderText('Type tag name...') as HTMLInputElement;
    
    await userEvent.click(input);
    
    rerender(
      <TagInput
        value="WOR"
        onChange={mockOnChange}
        suggestions={suggestions}
        onAddTag={mockOnAddTag}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('work')).toBeInTheDocument();
    });
  });

  it('adds tag on suggestion click', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <TagInput
        value="per"
        onChange={mockOnChange}
        suggestions={suggestions}
        onAddTag={mockOnAddTag}
      />
    );

    const input = screen.getByPlaceholderText('Type tag name...');
    await user.click(input);

    await waitFor(() => {
      const suggestion = screen.getByText('personal');
      expect(suggestion).toBeInTheDocument();
    });

    const suggestion = screen.getByText('personal');
    await user.click(suggestion);
    
    expect(mockOnAddTag).toHaveBeenCalledWith('personal');
  });

  it('disables input when disabled prop is true', () => {
    render(
      <TagInput
        value=""
        onChange={mockOnChange}
        suggestions={suggestions}
        onAddTag={mockOnAddTag}
        disabled={true}
      />
    );
    const input = screen.getByPlaceholderText('Type tag name...') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
