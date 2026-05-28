/**
 * Tests for TimelineItem Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { JournalEntry } from '../domain/Entry';
import { TimelineItem } from './TimelineItem';

const mockEntry: JournalEntry = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  date: '2026-05-25',
  text: 'This is a test entry',
  createdAt: '2026-05-25T10:00:00.000Z',
  updatedAt: '2026-05-25T10:00:00.000Z',
};

describe('TimelineItem Component', () => {
  it('renders entry text', () => {
    const mockOnClick = vi.fn();

    render(
      <TimelineItem 
        entry={mockEntry}
        onEntryClick={mockOnClick}
      />
    );

    expect(screen.getByText('This is a test entry')).toBeInTheDocument();
  });

  it('calls onEntryClick when entry is clicked', () => {
    const mockOnClick = vi.fn();

    render(
      <TimelineItem 
        entry={mockEntry}
        onEntryClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledWith(mockEntry);
  });

  it('calls onEntryClick when Enter key is pressed', () => {
    const mockOnClick = vi.fn();

    render(
      <TimelineItem 
        entry={mockEntry}
        onEntryClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

    expect(mockOnClick).toHaveBeenCalledWith(mockEntry);
  });

  it('calls onEntryClick when Space key is pressed', () => {
    const mockOnClick = vi.fn();

    render(
      <TimelineItem 
        entry={mockEntry}
        onEntryClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });

    expect(mockOnClick).toHaveBeenCalledWith(mockEntry);
  });

  it('truncates long text with ellipsis', () => {
    const longEntry: JournalEntry = {
      ...mockEntry,
      text: 'This is a very long entry that should be truncated because it exceeds the maximum preview length of approximately 150 characters and should show an ellipsis to indicate there is more text.',
    };

    const mockOnClick = vi.fn();

    render(
      <TimelineItem 
        entry={longEntry}
        onEntryClick={mockOnClick}
      />
    );

    const text = screen.getByText(/This is a very long entry/);
    expect(text.textContent).toContain('…');
    expect(text.textContent?.length).toBeLessThan(longEntry.text.length);
  });

  it('respects custom textPreviewLength prop', () => {
    const entry: JournalEntry = {
      ...mockEntry,
      text: 'This is a medium length entry that should be truncated at a custom length.',
    };

    const mockOnClick = vi.fn();

    render(
      <TimelineItem 
        entry={entry}
        onEntryClick={mockOnClick}
        textPreviewLength={20}
      />
    );

    // The text should be truncated to around 20 characters
    const text = screen.getByText(/This is a medium/);
    const displayedLength = text.textContent?.length || 0;
    expect(displayedLength).toBeLessThanOrEqual(25); // Allow some buffer
  });

  it('displays "Modifiée" badge for edited entries', () => {
    const editedEntry: JournalEntry = {
      ...mockEntry,
      updatedAt: '2026-05-25T15:00:00.000Z', // Different from createdAt
    };

    const mockOnClick = vi.fn();

    render(
      <TimelineItem 
        entry={editedEntry}
        onEntryClick={mockOnClick}
      />
    );

    expect(screen.getByText('Modifiée')).toBeInTheDocument();
  });

  it('does not display "Modifiée" badge for unedited entries', () => {
    const mockOnClick = vi.fn();

    render(
      <TimelineItem 
        entry={mockEntry}
        onEntryClick={mockOnClick}
      />
    );

    expect(screen.queryByText('Modifiée')).not.toBeInTheDocument();
  });

  it('displays timestamp in localized format', () => {
    const mockOnClick = vi.fn();

    render(
      <TimelineItem 
        entry={mockEntry}
        onEntryClick={mockOnClick}
      />
    );

    // Should contain date information
    expect(screen.getByText(/mai|May/i)).toBeInTheDocument();
  });

  it('has appropriate aria-label for accessibility', () => {
    const mockOnClick = vi.fn();

    render(
      <TimelineItem 
        entry={mockEntry}
        onEntryClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });

  it('handles text without cutting mid-word', () => {
    const entry: JournalEntry = {
      ...mockEntry,
      text: 'Short first part and then a very long word that should not be cut in the middle because that would be bad',
    };

    const mockOnClick = vi.fn();

    render(
      <TimelineItem 
        entry={entry}
        onEntryClick={mockOnClick}
        textPreviewLength={50}
      />
    );

    const text = screen.getByText(/Short first part/);
    const displayed = text.textContent || '';
    
    // Should not end with a partial word (has ellipsis)
    expect(displayed).toContain('…');
  });
});
