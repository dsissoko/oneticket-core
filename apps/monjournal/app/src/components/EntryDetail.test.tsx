/**
 * Tests for EntryDetail component
 *
 * Tests cover:
 * - Entry rendering with formatted dates and timestamps
 * - Edit and delete action buttons
 * - Delete confirmation flow
 * - Disabled state while deleting
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntryDetail } from './EntryDetail';
import type { JournalEntry } from '../domain/Entry';

describe('EntryDetail Component', () => {
  const mockEntry: JournalEntry = {
    id: 'entry-123',
    date: '2026-05-28',
    text: 'Today I learned about React hooks.',
    createdAt: '2026-05-28T10:30:00Z',
    updatedAt: '2026-05-28T10:30:00Z',
  };

  const mockEntryWithUpdate: JournalEntry = {
    ...mockEntry,
    updatedAt: '2026-05-28T14:45:00Z',
  };

  /**
   * Test: Render entry with correct content
   */
  it('should render entry with formatted date and text', () => {
    render(<EntryDetail entry={mockEntry} />);

    expect(screen.getByTestId('entry-date')).toHaveTextContent('Thursday, May 28, 2026');
    expect(screen.getByTestId('entry-text')).toHaveTextContent(
      'Today I learned about React hooks.'
    );
  });

  /**
   * Test: Display creation timestamp
   */
  it('should display creation timestamp', () => {
    render(<EntryDetail entry={mockEntry} />);

    const createdAtElement = screen.getByTestId('entry-created-at');
    expect(createdAtElement).toBeInTheDocument();
    expect(createdAtElement.textContent).toMatch(/Created:/);
  });

  /**
   * Test: Display update timestamp when different from creation
   */
  it('should display update timestamp when entry was edited', () => {
    render(<EntryDetail entry={mockEntryWithUpdate} />);

    const updatedAtElement = screen.getByTestId('entry-updated-at');
    expect(updatedAtElement).toBeInTheDocument();
    expect(updatedAtElement.textContent).toMatch(/Last updated:/);
  });

  /**
   * Test: Hide update timestamp when same as creation
   */
  it('should not display update timestamp when entry was never edited', () => {
    render(<EntryDetail entry={mockEntry} />);

    expect(screen.queryByTestId('entry-updated-at')).not.toBeInTheDocument();
  });

  /**
   * Test: Render edit button when onEdit is provided
   */
  it('should render edit button when onEdit handler is provided', () => {
    const mockEdit = vi.fn();

    render(
      <EntryDetail
        entry={mockEntry}
        onEdit={mockEdit}
      />
    );

    expect(screen.getByTestId('entry-edit-button')).toBeInTheDocument();
  });

  /**
   * Test: Call onEdit when edit button is clicked
   */
  it('should call onEdit when edit button is clicked', async () => {
    const mockEdit = vi.fn();
    const user = userEvent.setup();

    render(
      <EntryDetail
        entry={mockEntry}
        onEdit={mockEdit}
      />
    );

    const editButton = screen.getByTestId('entry-edit-button');
    await user.click(editButton);

    expect(mockEdit).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Render delete button when onDelete is provided
   */
  it('should render delete button when onDelete handler is provided', () => {
    const mockDelete = vi.fn();

    render(
      <EntryDetail
        entry={mockEntry}
        onDelete={mockDelete}
      />
    );

    expect(screen.getByTestId('entry-delete-button')).toBeInTheDocument();
  });

  /**
   * Test: Delete confirmation flow
   */
  it('should show confirmation prompt on first delete click', async () => {
    const mockDelete = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <EntryDetail
        entry={mockEntry}
        onDelete={mockDelete}
        isConfirming={false}
      />
    );

    const deleteButton = screen.getByTestId('entry-delete-button');
    await user.click(deleteButton);

    expect(mockDelete).toHaveBeenCalledTimes(1);

    // Re-render with confirming state
    rerender(
      <EntryDetail
        entry={mockEntry}
        onDelete={mockDelete}
        isConfirming={true}
      />
    );

    expect(screen.getByTestId('delete-confirmation-message')).toBeInTheDocument();
    expect(deleteButton).toHaveTextContent('Confirm Delete');
  });

  /**
   * Test: Delete button changes text during confirmation
   */
  it('should change delete button text to "Confirm Delete" when confirming', () => {
    const mockDelete = vi.fn();

    const { rerender } = render(
      <EntryDetail
        entry={mockEntry}
        onDelete={mockDelete}
        isConfirming={false}
      />
    );

    let deleteButton = screen.getByTestId('entry-delete-button');
    expect(deleteButton).toHaveTextContent('Delete');

    rerender(
      <EntryDetail
        entry={mockEntry}
        onDelete={mockDelete}
        isConfirming={true}
      />
    );

    deleteButton = screen.getByTestId('entry-delete-button');
    expect(deleteButton).toHaveTextContent('Confirm Delete');
  });

  /**
   * Test: Delete button shows loading state while deleting
   */
  it('should show loading state in delete button while deleting', () => {
    const mockDelete = vi.fn();

    const { rerender } = render(
      <EntryDetail
        entry={mockEntry}
        onDelete={mockDelete}
        isDeleting={false}
      />
    );

    let deleteButton = screen.getByTestId('entry-delete-button') as HTMLButtonElement;
    expect(deleteButton).not.toBeDisabled();

    rerender(
      <EntryDetail
        entry={mockEntry}
        onDelete={mockDelete}
        isDeleting={true}
      />
    );

    deleteButton = screen.getByTestId('entry-delete-button') as HTMLButtonElement;
    expect(deleteButton).toBeDisabled();
    expect(deleteButton).toHaveTextContent('Deleting...');
  });

  /**
   * Test: Edit button is disabled while deleting
   */
  it('should disable edit button while deleting', () => {
    const mockEdit = vi.fn();
    const mockDelete = vi.fn();

    const { rerender } = render(
      <EntryDetail
        entry={mockEntry}
        onEdit={mockEdit}
        onDelete={mockDelete}
        isDeleting={false}
      />
    );

    let editButton = screen.getByTestId('entry-edit-button') as HTMLButtonElement;
    expect(editButton).not.toBeDisabled();

    rerender(
      <EntryDetail
        entry={mockEntry}
        onEdit={mockEdit}
        onDelete={mockDelete}
        isDeleting={true}
      />
    );

    editButton = screen.getByTestId('entry-edit-button') as HTMLButtonElement;
    expect(editButton).toBeDisabled();
  });

  /**
   * Test: Preserve multiline text formatting
   */
  it('should preserve multiline text formatting', () => {
    const multilineEntry: JournalEntry = {
      ...mockEntry,
      text: 'Line 1\nLine 2\nLine 3',
    };

    render(<EntryDetail entry={multilineEntry} />);

    const textElement = screen.getByTestId('entry-text');
    expect(textElement).toHaveTextContent('Line 1');
    expect(textElement).toHaveTextContent('Line 2');
    expect(textElement).toHaveTextContent('Line 3');
    expect(textElement).toHaveStyle({ whiteSpace: 'pre-wrap' });
  });

  /**
   * Test: Render without edit and delete buttons
   */
  it('should render entry without action buttons when handlers not provided', () => {
    render(<EntryDetail entry={mockEntry} />);

    expect(screen.queryByTestId('entry-edit-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('entry-delete-button')).not.toBeInTheDocument();
  });

  /**
   * Test: Custom CSS class is applied
   */
  it('should apply custom CSS class', () => {
    const customClass = 'custom-entry-class';

    const { container } = render(
      <EntryDetail
        entry={mockEntry}
        className={customClass}
      />
    );

    const article = container.querySelector('article');
    expect(article).toHaveClass(customClass);
  });

  /**
   * Test: Entry ID is in test ID for uniqueness
   */
  it('should include entry ID in test ID', () => {
    render(<EntryDetail entry={mockEntry} />);

    expect(screen.getByTestId(`entry-detail-${mockEntry.id}`)).toBeInTheDocument();
  });

  /**
   * Test: Confirmation message hidden when not confirming
   */
  it('should not show confirmation message when not in confirmation state', () => {
    const mockDelete = vi.fn();

    render(
      <EntryDetail
        entry={mockEntry}
        onDelete={mockDelete}
        isConfirming={false}
      />
    );

    expect(screen.queryByTestId('delete-confirmation-message')).not.toBeInTheDocument();
  });

  /**
   * Test: Handles entries with special characters in text
   */
  it('should handle special characters in entry text', () => {
    const specialCharEntry: JournalEntry = {
      ...mockEntry,
      text: 'Special chars: <>&"\' and emojis 🎉 🚀 ✨',
    };

    render(<EntryDetail entry={specialCharEntry} />);

    expect(screen.getByTestId('entry-text')).toHaveTextContent(
      'Special chars: <>&"\' and emojis 🎉 🚀 ✨'
    );
  });
});
