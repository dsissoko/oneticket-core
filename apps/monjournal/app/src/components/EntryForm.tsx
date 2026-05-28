/**
 * Component: EntryForm
 *
 * Presentational component for creating or editing journal entries.
 * Purely UI-focused: renders form inputs and delegates all business logic to props.
 * Supports both create (empty form) and edit (pre-filled form) modes.
 *
 * Props are passed from parent hooks to keep this component clean and testable.
 */

import React, { useState, useEffect } from 'react';
import { FormControl, Button, Textarea } from '@primer/react';
import type { JournalEntry } from '../domain/Entry';

/**
 * Props for EntryForm component
 */
export interface EntryFormProps {
  /**
   * Existing entry for edit mode, undefined for create mode
   */
  entry?: JournalEntry | null;

  /**
   * Called when user submits the form with valid data
   * @param data Object with date and text fields
   */
  onSubmit: (data: { date: string; text: string }) => Promise<void> | void;

  /**
   * Called when user clicks cancel/close button
   */
  onCancel?: () => void;

  /**
   * Whether form is currently submitting
   */
  isSubmitting?: boolean;

  /**
   * Error message to display if submission fails
   */
  error?: string | null;

  /**
   * Optional CSS class for styling
   */
  className?: string;
}

/**
 * EntryForm - Presentational component for entry creation/editing
 *
 * @example
 * // Create mode
 * <EntryForm
 *   onSubmit={async (data) => await createEntry(data)}
 *   isSubmitting={isCreating}
 *   error={error?.message}
 * />
 *
 * @example
 * // Edit mode
 * <EntryForm
 *   entry={existingEntry}
 *   onSubmit={async (data) => await editEntry(entry.id, data)}
 *   isSubmitting={isEditing}
 *   error={error?.message}
 *   onCancel={handleCancel}
 * />
 */
export function EntryForm({
  entry,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error = null,
  className,
}: EntryFormProps): JSX.Element {
  // Local state for form inputs
  const [date, setDate] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize form with entry data in edit mode, or default date in create mode
  useEffect(() => {
    if (entry) {
      // Edit mode: pre-fill with existing entry data
      setDate(entry.date);
      setText(entry.text);
    } else {
      // Create mode: default to today's date
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      setDate(dateString);
      setText('');
    }
    setValidationError(null);
  }, [entry]);

  /**
   * Validates form input before submission
   */
  const validateForm = (): boolean => {
    // Validate date is not empty and matches YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!date || !dateRegex.test(date)) {
      setValidationError('Date must be in YYYY-MM-DD format');
      return false;
    }

    // Validate text is not empty
    if (!text || text.trim().length === 0) {
      setValidationError('Entry text cannot be empty');
      return false;
    }

    setValidationError(null);
    return true;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({ date, text: text.trim() });
      // Reset form on successful submission for create mode
      if (!entry) {
        setText('');
      }
    } catch {
      // Error is handled by parent through error prop
    }
  };

  /**
   * Handles cancel button click
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const isEditing = !!entry;
  const formTitle = isEditing ? 'Edit Entry' : 'New Entry';
  const submitButtonText = isEditing ? 'Save Changes' : 'Create Entry';

  return (
    <form onSubmit={handleSubmit} className={className} data-testid="entry-form">
      <fieldset disabled={isSubmitting} style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ display: 'none' }}>{formTitle}</legend>

        {/* Title/Heading */}
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          {formTitle}
        </h2>

        {/* Date Field */}
        <FormControl>
          <FormControl.Label htmlFor="entry-date">Date (YYYY-MM-DD)</FormControl.Label>
          <input
            id="entry-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isSubmitting}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d0d7de',
              borderRadius: '6px',
              fontSize: '1rem',
              fontFamily: 'inherit',
            }}
            data-testid="entry-date-input"
          />
          <FormControl.Caption>
            The date of this journal entry (today or earlier)
          </FormControl.Caption>
        </FormControl>

        {/* Text Field */}
        <FormControl sx={{ mt: 3 }}>
          <FormControl.Label htmlFor="entry-text">Entry Text</FormControl.Label>
          <Textarea
            id="entry-text"
            value={text}
            onChange={(e) => setText(e.currentTarget.value)}
            disabled={isSubmitting}
            placeholder="What's on your mind?"
            required
            rows={8}
            data-testid="entry-text-input"
          />
          <FormControl.Caption>
            Your thoughts, feelings, or events for the day
          </FormControl.Caption>
        </FormControl>

        {/* Validation Error Message */}
        {validationError && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#ffebe6',
              borderLeft: '4px solid #d1242f',
              color: '#d1242f',
              borderRadius: '4px',
            }}
            role="alert"
            data-testid="validation-error"
          >
            {validationError}
          </div>
        )}

        {/* Submission Error Message */}
        {error && !validationError && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#ffebe6',
              borderLeft: '4px solid #d1242f',
              color: '#d1242f',
              borderRadius: '4px',
            }}
            role="alert"
            data-testid="submission-error"
          >
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-start',
          }}
        >
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            data-testid="entry-submit-button"
          >
            {isSubmitting ? 'Saving...' : submitButtonText}
          </Button>

          {onCancel && (
            <Button
              onClick={handleCancel}
              disabled={isSubmitting}
              data-testid="entry-cancel-button"
            >
              Cancel
            </Button>
          )}
        </div>
      </fieldset>
    </form>
  );
}
