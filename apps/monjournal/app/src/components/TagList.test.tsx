import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TagList } from './TagList';

describe('TagList', () => {
  const mockOnRemoveTag = vi.fn();

  beforeEach(() => {
    mockOnRemoveTag.mockClear();
  });

  it('displays empty state when no tags', () => {
    render(
      <TagList tags={[]} onRemoveTag={mockOnRemoveTag} />
    );
    expect(screen.getByText('No tags selected')).toBeInTheDocument();
  });

  it('renders all tags as chips', () => {
    const tags = ['personal', 'work', 'health'];
    render(
      <TagList tags={tags} onRemoveTag={mockOnRemoveTag} />
    );
    
    tags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('displays remove button (×) for each tag', () => {
    const tags = ['personal', 'work'];
    render(
      <TagList tags={tags} onRemoveTag={mockOnRemoveTag} />
    );
    
    const removeButtons = screen.getAllByText('×');
    expect(removeButtons).toHaveLength(tags.length);
  });

  it('calls onRemoveTag when remove button is clicked', async () => {
    const user = userEvent.setup();
    const tags = ['personal', 'work'];
    render(
      <TagList tags={tags} onRemoveTag={mockOnRemoveTag} />
    );
    
    const removeButtons = screen.getAllByText('×');
    await user.click(removeButtons[0]);
    
    expect(mockOnRemoveTag).toHaveBeenCalledWith('personal');
  });

  it('removes correct tag when multiple tags present', async () => {
    const user = userEvent.setup();
    const tags = ['personal', 'work', 'health'];
    render(
      <TagList tags={tags} onRemoveTag={mockOnRemoveTag} />
    );
    
    const removeButtons = screen.getAllByText('×');
    await user.click(removeButtons[1]); // Click second remove button
    
    expect(mockOnRemoveTag).toHaveBeenCalledWith('work');
  });

  it('handles tag names with special characters', () => {
    const tags = ['work-related', 'my_stuff', 'c++'];
    render(
      <TagList tags={tags} onRemoveTag={mockOnRemoveTag} />
    );
    
    tags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('handles very long tag names gracefully', () => {
    const tags = ['this-is-a-very-long-tag-name-that-might-overflow'];
    render(
      <TagList tags={tags} onRemoveTag={mockOnRemoveTag} />
    );
    
    expect(screen.getByText(tags[0])).toBeInTheDocument();
  });
});
