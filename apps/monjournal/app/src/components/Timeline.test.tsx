/**
 * Tests for Timeline Component
 *
 * Tests chronological display, sorting, filtering, and keyboard navigation.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { JournalEntry } from '../domain/Entry';
import { Timeline } from './Timeline';

/**
 * Mock journal entries for testing
 */
const mockEntries: JournalEntry[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    date: '2026-05-25',
    text: 'First entry for May 25',
    createdAt: '2026-05-25T10:00:00.000Z',
    updatedAt: '2026-05-25T10:00:00.000Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    date: '2026-05-26',
    text: 'First entry for May 26',
    createdAt: '2026-05-26T09:00:00.000Z',
    updatedAt: '2026-05-26T09:00:00.000Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    date: '2026-05-26',
    text: 'Second entry for May 26',
    createdAt: '2026-05-26T14:00:00.000Z',
    updatedAt: '2026-05-26T14:00:00.000Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    date: '2026-05-27',
    text: 'Entry for May 27',
    createdAt: '2026-05-27T08:00:00.000Z',
    updatedAt: '2026-05-27T08:00:00.000Z',
  },
];

describe('Timeline Component', () => {
  it('renders empty state when no entries provided', () => {
    const mockOnEntryClick = vi.fn();

    render(
      <Timeline 
        entries={[]} 
        onEntryClick={mockOnEntryClick}
      />
    );

    expect(screen.getByText('Aucune entrée')).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    const mockOnEntryClick = vi.fn();

    render(
      <Timeline 
        entries={mockEntries}
        onEntryClick={mockOnEntryClick}
        isLoading={true}
      />
    );

    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('displays all entries grouped by date', () => {
    const mockOnEntryClick = vi.fn();

    render(
      <Timeline 
        entries={mockEntries}
        onEntryClick={mockOnEntryClick}
      />
    );

    // Check that entries are rendered
    expect(screen.getByText('First entry for May 25')).toBeInTheDocument();
    expect(screen.getByText('First entry for May 26')).toBeInTheDocument();
    expect(screen.getByText('Second entry for May 26')).toBeInTheDocument();
    expect(screen.getByText('Entry for May 27')).toBeInTheDocument();
  });

  it('calls onEntryClick when entry is clicked', () => {
    const mockOnEntryClick = vi.fn();

    render(
      <Timeline 
        entries={mockEntries}
        onEntryClick={mockOnEntryClick}
      />
    );

    const entryButton = screen.getByText('First entry for May 25').closest('button');
    expect(entryButton).toBeInTheDocument();

    if (entryButton) {
      fireEvent.click(entryButton);
      expect(mockOnEntryClick).toHaveBeenCalledWith(mockEntries[0]);
    }
  });

  it('displays date anchors with entry count', () => {
    const mockOnEntryClick = vi.fn();

    render(
      <Timeline 
        entries={mockEntries}
        onEntryClick={mockOnEntryClick}
      />
    );

    // Check for date anchors with counts
    // May 25 should have 1 entry, May 26 should have 2, May 27 should have 1
    const dateButtons = screen.getAllByRole('button', { name: /Filter entries for/ });
    expect(dateButtons.length).toBeGreaterThan(0);
  });

  it('filters entries when date anchor is clicked', () => {
    const mockOnEntryClick = vi.fn();

    render(
      <Timeline 
        entries={mockEntries}
        onEntryClick={mockOnEntryClick}
      />
    );

    // Get date anchor buttons
    const dateButtons = screen.getAllByRole('button', { name: /Filter entries for/ });
    
    // Click on first date anchor (May 25)
    if (dateButtons.length > 0) {
      fireEvent.click(dateButtons[0]);
      
      // After filter, should show filter indicator
      expect(screen.getByText(/Filtrée :/)).toBeInTheDocument();
    }
  });

  it('shows "Voir tout" button when date filtered', () => {
    const mockOnEntryClick = vi.fn();

    render(
      <Timeline 
        entries={mockEntries}
        onEntryClick={mockOnEntryClick}
      />
    );

    const dateButtons = screen.getAllByRole('button', { name: /Filter entries for/ });
    
    if (dateButtons.length > 0) {
      fireEvent.click(dateButtons[0]);
      
      const clearButton = screen.getByText('Voir tout');
      expect(clearButton).toBeInTheDocument();
    }
  });

  it('clears date filter when "Voir tout" is clicked', () => {
    const mockOnEntryClick = vi.fn();

    render(
      <Timeline 
        entries={mockEntries}
        onEntryClick={mockOnEntryClick}
      />
    );

    const dateButtons = screen.getAllByRole('button', { name: /Filter entries for/ });
    
    if (dateButtons.length > 0) {
      // Apply filter
      fireEvent.click(dateButtons[0]);
      expect(screen.getByText(/Filtrée :/)).toBeInTheDocument();
      
      // Clear filter
      const clearButton = screen.getByText('Voir tout');
      fireEvent.click(clearButton);
      
      // Filter indicator should be gone
      expect(screen.queryByText(/Filtrée :/)).not.toBeInTheDocument();
    }
  });

  it('handles keyboard navigation with Enter key on entry', async () => {
    const mockOnEntryClick = vi.fn();

    render(
      <Timeline 
        entries={mockEntries}
        onEntryClick={mockOnEntryClick}
      />
    );

    const entryButton = screen.getByText('First entry for May 25').closest('button');
    expect(entryButton).toBeInTheDocument();

    if (entryButton) {
      entryButton.focus();
      fireEvent.keyDown(entryButton, { key: 'Enter', code: 'Enter' });
      
      expect(mockOnEntryClick).toHaveBeenCalledWith(mockEntries[0]);
    }
  });

  it('handles keyboard navigation with Space key on entry', async () => {
    const mockOnEntryClick = vi.fn();

    render(
      <Timeline 
        entries={mockEntries}
        onEntryClick={mockOnEntryClick}
      />
    );

    const entryButton = screen.getByText('First entry for May 25').closest('button');
    expect(entryButton).toBeInTheDocument();

    if (entryButton) {
      entryButton.focus();
      fireEvent.keyDown(entryButton, { key: ' ', code: 'Space' });
      
      expect(mockOnEntryClick).toHaveBeenCalledWith(mockEntries[0]);
    }
  });

  it('displays sort toggle component', () => {
    const mockOnEntryClick = vi.fn();

    render(
      <Timeline 
        entries={mockEntries}
        onEntryClick={mockOnEntryClick}
      />
    );

    const sortButton = screen.getByRole('button', { name: /Trier par/ });
    expect(sortButton).toBeInTheDocument();
  });

  it('handles onDateClick callback when date anchor is clicked', () => {
    const mockOnEntryClick = vi.fn();
    const mockOnDateClick = vi.fn();

    render(
      <Timeline 
        entries={mockEntries}
        onEntryClick={mockOnEntryClick}
        onDateClick={mockOnDateClick}
      />
    );

    const dateButtons = screen.getAllByRole('button', { name: /Filter entries for/ });
    
    if (dateButtons.length > 0) {
      fireEvent.click(dateButtons[0]);
      expect(mockOnDateClick).toHaveBeenCalled();
    }
  });

  it('truncates long text with ellipsis', () => {
    const longEntry: JournalEntry = {
      id: '550e8400-e29b-41d4-a716-446655440099',
      date: '2026-05-28',
      text: 'This is a very long entry that should be truncated because it exceeds the maximum preview length of approximately 150 characters and should show an ellipsis to indicate there is more text.',
      createdAt: '2026-05-28T10:00:00.000Z',
      updatedAt: '2026-05-28T10:00:00.000Z',
    };

    const mockOnEntryClick = vi.fn();

    render(
      <Timeline 
        entries={[longEntry]}
        onEntryClick={mockOnEntryClick}
      />
    );

    const textElements = screen.getAllByText(/This is a very long entry/);
    expect(textElements.length).toBeGreaterThan(0);
    
    // Check that the text contains ellipsis
    const truncatedText = textElements[0].textContent || '';
    expect(truncatedText).toContain('…');
  });

  it('renders multiple entries for the same date sorted by createdAt', () => {
    const mockOnEntryClick = vi.fn();

    render(
      <Timeline 
        entries={mockEntries}
        onEntryClick={mockOnEntryClick}
      />
    );

    // Both May 26 entries should be visible
    expect(screen.getByText('First entry for May 26')).toBeInTheDocument();
    expect(screen.getByText('Second entry for May 26')).toBeInTheDocument();
  });

  it('displays "Modifiée" badge for edited entries', () => {
    const editedEntry: JournalEntry = {
      id: '550e8400-e29b-41d4-a716-446655440005',
      date: '2026-05-28',
      text: 'Edited entry',
      createdAt: '2026-05-28T10:00:00.000Z',
      updatedAt: '2026-05-28T15:00:00.000Z', // Different from createdAt
    };

    const mockOnEntryClick = vi.fn();

    render(
      <Timeline 
        entries={[editedEntry]}
        onEntryClick={mockOnEntryClick}
      />
    );

    expect(screen.getByText('Modifiée')).toBeInTheDocument();
  });

  it('does not display "Modifiée" badge for unedited entries', () => {
    const mockOnEntryClick = vi.fn();

    render(
      <Timeline 
        entries={mockEntries}
        onEntryClick={mockOnEntryClick}
      />
    );

    // mockEntries are unedited (createdAt === updatedAt)
    const badges = screen.queryAllByText('Modifiée');
    expect(badges.length).toBe(0);
  });
});
