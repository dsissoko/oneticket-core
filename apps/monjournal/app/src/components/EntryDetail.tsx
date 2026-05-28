/**
 * Component: EntryDetail
 *
 * Presentational component for displaying journal entry details.
 * Purely UI-focused: shows entry content and action buttons.
 * Delegates all business logic (edit, delete) to props passed from parent.
 *
 * Displays formatted date, entry text, and timestamps.
 * Provides buttons for edit and delete actions.
 */

import React from 'react';
import { Button, ButtonGroup } from '@primer/react';
import { PencilIcon, TrashIcon } from '@primer/octicons-react';
import type { JournalEntry } from '../domain/Entry';

/**
 * Props for EntryDetail component
 */
export interface EntryDetailProps {
  /**
   * The entry to display
   */
  entry: JournalEntry;

  /**
   * Called when user clicks the Edit button
   */
  onEdit?: () => void;

  /**
   * Called when user clicks the Delete button
   */
  onDelete?: () => void;

  /**
   * Whether entry is being deleted
   */
  isDeleting?: boolean;

  /**
   * Whether delete is awaiting confirmation
   */
  isConfirming?: boolean;

  /**
   * Optional CSS class for styling
   */
  className?: string;
}

/**
 * Formats a date string (YYYY-MM-DD) to a readable format
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString + 'T00:00:00Z');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Formats an ISO 8601 timestamp for display
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC',
    });
  } catch {
    return timestamp;
  }
}

/**
 * EntryDetail - Presentational component for viewing entry details
 *
 * @example
 * <EntryDetail
 *   entry={entry}
 *   onEdit={() => setEditingId(entry.id)}
 *   onDelete={() => confirmDelete(entry.id)}
 *   isConfirming={confirmingIds.has(entry.id)}
 *   isDeleting={isDeletingId === entry.id}
 * />
 */
export function EntryDetail({
  entry,
  onEdit,
  onDelete,
  isDeleting = false,
  isConfirming = false,
  className,
}: EntryDetailProps): JSX.Element {
  const handleDelete = () => {
    if (isConfirming) {
      // User already confirmed, actually delete
      onDelete?.();
    } else {
      // First click: show confirmation
      onDelete?.();
    }
  };

  return (
    <article
      className={className}
      data-testid={`entry-detail-${entry.id}`}
      style={{
        padding: '1.5rem',
        border: '1px solid #d0d7de',
        borderRadius: '6px',
        backgroundColor: '#fff',
      }}
    >
      {/* Header with date and timestamps */}
      <header style={{ marginBottom: '1.5rem' }}>
        <h2
          style={{
            margin: '0 0 0.5rem 0',
            fontSize: '1.5rem',
            color: '#24292f',
          }}
          data-testid="entry-date"
        >
          {formatDate(entry.date)}
        </h2>

        <div
          style={{
            fontSize: '0.875rem',
            color: '#57606a',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <span data-testid="entry-created-at">
            Created: {formatTimestamp(entry.createdAt)}
          </span>
          {entry.createdAt !== entry.updatedAt && (
            <span data-testid="entry-updated-at">
              Last updated: {formatTimestamp(entry.updatedAt)}
            </span>
          )}
        </div>
      </header>

      {/* Entry text content */}
      <div
        style={{
          fontSize: '1rem',
          lineHeight: '1.6',
          color: '#24292f',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          marginBottom: '1.5rem',
        }}
        data-testid="entry-text"
      >
        {entry.text}
      </div>

      {/* Action buttons */}
      <footer style={{ borderTop: '1px solid #d0d7de', paddingTop: '1rem' }}>
        <ButtonGroup>
          {onEdit && (
            <Button
              onClick={onEdit}
              disabled={isDeleting}
              leadingVisual={PencilIcon}
              data-testid="entry-edit-button"
            >
              Edit
            </Button>
          )}

          {onDelete && (
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant={isConfirming ? 'danger' : 'default'}
              leadingVisual={TrashIcon}
              data-testid="entry-delete-button"
            >
              {isDeleting ? 'Deleting...' : isConfirming ? 'Confirm Delete' : 'Delete'}
            </Button>
          )}
        </ButtonGroup>

        {isConfirming && !isDeleting && (
          <div
            style={{
              marginTop: '0.75rem',
              fontSize: '0.875rem',
              color: '#d1242f',
            }}
            data-testid="delete-confirmation-message"
          >
            Click "Confirm Delete" again to permanently delete this entry.
          </div>
        )}
      </footer>
    </article>
  );
}
