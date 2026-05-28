/**
 * Tests for EntryForm component
 *
 * Tests cover:
 * - Form rendering in create and edit modes
 * - Input validation (date format, text non-empty)
 * - Form submission with valid data
 * - Error handling and display
 * - Cancel action
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntryForm } from './EntryForm';
import type { JournalEntry } from '../domain/Entry';

describe('EntryForm Component', () => {
  /**
   * Test: Render in create mode
   */
  it('should render form in create mode with today\'s date by default', () => {
    const mockSubmit = vi.fn();
    const today = new Date().toISOString().split('T')[0];

    render(<EntryForm onSubmit={mockSubmit} />);

    const dateInput = screen.getByTestId('entry-date-input') as HTMLInputElement;
    expect(dateInput.value).toBe(today);

    const textInput = screen.getByTestId('entry-text-input') as HTMLTextAreaElement;
    expect(textInput.value).toBe('');

    expect(screen.getByRole('heading', { name: 'New Entry' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Entry' })).toBeInTheDocument();
  });

  /**
   * Test: Render in edit mode with pre-filled data
   */
  it('should render form in edit mode with pre-filled entry data', () => {
    const mockSubmit = vi.fn();
    const entry: JournalEntry = {
      id: 'test-id',
      date: '2026-05-28',
      text: 'Test entry',
      createdAt: '2026-05-28T10:00:00Z',
      updatedAt: '2026-05-28T11:00:00Z',
    };

    render(<EntryForm entry={entry} onSubmit={mockSubmit} />);

    const dateInput = screen.getByTestId('entry-date-input') as HTMLInputElement;
    expect(dateInput.value).toBe('2026-05-28');

    const textInput = screen.getByTestId('entry-text-input') as HTMLTextAreaElement;
    expect(textInput.value).toBe('Test entry');

    expect(screen.getByRole('heading', { name: 'Edit Entry' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  /**
   * Test: Component allows any valid YYYY-MM-DD date (future validation handled by hooks/domain)
   */
  it('should accept any valid YYYY-MM-DD formatted date', async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<EntryForm onSubmit={mockSubmit} />);

    const dateInput = screen.getByTestId('entry-date-input');
    const textInput = screen.getByTestId('entry-text-input');
    const submitButton = screen.getByTestId('entry-submit-button');

    // Use a valid past date
    await user.clear(dateInput);
    await user.type(dateInput, '2020-01-01');
    await user.type(textInput, 'Valid text');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          date: '2020-01-01',
          text: 'Valid text',
        })
      );
    });
  });

  /**
   * Test: Validate text is not empty
   */
  it('should show validation error when text is empty', async () => {
    const mockSubmit = vi.fn();
    const user = userEvent.setup();

    render(<EntryForm onSubmit={mockSubmit} />);

    const textInput = screen.getByTestId('entry-text-input');
    const submitButton = screen.getByTestId('entry-submit-button');

    // Leave text empty and try to submit
    await user.clear(textInput);
    await user.click(submitButton);

    expect(screen.getByTestId('validation-error')).toBeInTheDocument();
    expect(screen.getByTestId('validation-error')).toHaveTextContent('Entry text cannot be empty');
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  /**
   * Test: Validate text with only whitespace is rejected
   */
  it('should reject text that is only whitespace', async () => {
    const mockSubmit = vi.fn();
    const user = userEvent.setup();

    render(<EntryForm onSubmit={mockSubmit} />);

    const textInput = screen.getByTestId('entry-text-input');
    const submitButton = screen.getByTestId('entry-submit-button');

    await user.clear(textInput);
    await user.type(textInput, '   \n  \t  ');
    await user.click(submitButton);

    expect(screen.getByTestId('validation-error')).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  /**
   * Test: Successful form submission with valid data
   */
  it('should submit form with valid data', async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<EntryForm onSubmit={mockSubmit} />);

    const dateInput = screen.getByTestId('entry-date-input');
    const textInput = screen.getByTestId('entry-text-input');
    const submitButton = screen.getByTestId('entry-submit-button');

    await user.clear(dateInput);
    await user.type(dateInput, '2026-05-27');
    await user.clear(textInput);
    await user.type(textInput, 'My journal entry');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        date: '2026-05-27',
        text: 'My journal entry',
      });
    });
  });

  /**
   * Test: Text is trimmed before submission
   */
  it('should trim text before submission', async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<EntryForm onSubmit={mockSubmit} />);

    const textInput = screen.getByTestId('entry-text-input');
    const submitButton = screen.getByTestId('entry-submit-button');

    await user.clear(textInput);
    await user.type(textInput, '  Text with spaces  \n');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Text with spaces',
        })
      );
    });
  });

  /**
   * Test: Display submission error
   */
  it('should display submission error message', () => {
    const mockSubmit = vi.fn();

    render(
      <EntryForm
        onSubmit={mockSubmit}
        error="Failed to save entry: storage quota exceeded"
      />
    );

    expect(screen.getByTestId('submission-error')).toBeInTheDocument();
    expect(screen.getByTestId('submission-error')).toHaveTextContent(
      'Failed to save entry: storage quota exceeded'
    );
  });

  /**
   * Test: Show loading state while submitting
   */
  it('should show loading state while submitting', () => {
    const mockSubmit = vi.fn();

    const { rerender } = render(
      <EntryForm onSubmit={mockSubmit} isSubmitting={false} />
    );

    let submitButton = screen.getByTestId('entry-submit-button');
    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveTextContent('Create Entry');

    rerender(
      <EntryForm onSubmit={mockSubmit} isSubmitting={true} />
    );

    submitButton = screen.getByTestId('entry-submit-button');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Saving...');
  });

  /**
   * Test: Cancel button callback
   */
  it('should call onCancel when cancel button is clicked', async () => {
    const mockSubmit = vi.fn();
    const mockCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <EntryForm
        onSubmit={mockSubmit}
        onCancel={mockCancel}
      />
    );

    const cancelButton = screen.getByTestId('entry-cancel-button');
    await user.click(cancelButton);

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  /**
   * Test: Form is disabled while submitting
   */
  it('should disable form inputs while submitting', () => {
    const mockSubmit = vi.fn();

    const { rerender } = render(
      <EntryForm onSubmit={mockSubmit} isSubmitting={false} />
    );

    let dateInput = screen.getByTestId('entry-date-input') as HTMLInputElement;
    let textInput = screen.getByTestId('entry-text-input') as HTMLTextAreaElement;

    expect(dateInput.disabled).toBe(false);
    expect(textInput.disabled).toBe(false);

    rerender(
      <EntryForm onSubmit={mockSubmit} isSubmitting={true} />
    );

    dateInput = screen.getByTestId('entry-date-input') as HTMLInputElement;
    textInput = screen.getByTestId('entry-text-input') as HTMLTextAreaElement;

    expect(dateInput.disabled).toBe(true);
    expect(textInput.disabled).toBe(true);
  });

  /**
   * Test: Validation error is cleared on successful submission
   */
  it('should clear validation error on successful submission', async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    const { rerender } = render(
      <EntryForm onSubmit={mockSubmit} />
    );

    const textInput = screen.getByTestId('entry-text-input');
    const submitButton = screen.getByTestId('entry-submit-button');

    // First, trigger validation error
    await user.click(submitButton);
    expect(screen.getByTestId('validation-error')).toBeInTheDocument();

    // Then fix and submit
    await user.type(textInput, 'Valid text');
    await user.click(submitButton);

    await waitFor(() => {
      // Validation error should be gone
      expect(screen.queryByTestId('validation-error')).not.toBeInTheDocument();
    });
  });

  /**
   * Test: Edit mode disables cancel button when submitting
   */
  it('should disable cancel button while submitting', () => {
    const mockSubmit = vi.fn();
    const mockCancel = vi.fn();
    const entry: JournalEntry = {
      id: 'test-id',
      date: '2026-05-28',
      text: 'Test',
      createdAt: '2026-05-28T10:00:00Z',
      updatedAt: '2026-05-28T10:00:00Z',
    };

    const { rerender } = render(
      <EntryForm
        entry={entry}
        onSubmit={mockSubmit}
        onCancel={mockCancel}
        isSubmitting={false}
      />
    );

    let cancelButton = screen.getByTestId('entry-cancel-button') as HTMLButtonElement;
    expect(cancelButton.disabled).toBe(false);

    rerender(
      <EntryForm
        entry={entry}
        onSubmit={mockSubmit}
        onCancel={mockCancel}
        isSubmitting={true}
      />
    );

    cancelButton = screen.getByTestId('entry-cancel-button') as HTMLButtonElement;
    expect(cancelButton.disabled).toBe(true);
  });
});
