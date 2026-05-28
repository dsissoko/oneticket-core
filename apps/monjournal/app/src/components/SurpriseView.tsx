/**
 * Component: SurpriseView
 *
 * Displays a randomly selected journal entry in a dedicated view with navigation controls.
 * Handles both full entry display and empty state scenarios.
 *
 * Features:
 * - Shows complete entry (date, text, timestamps)
 * - "Autre surprise" button to select another random entry
 * - "Retour" button to return to timeline
 * - Empty state with "Créer une entrée" button when no entries exist
 * - WCAG 2.1 AA accessibility support
 * - Keyboard navigation (Tab, Enter, Space, Escape)
 */

import React, { useEffect } from 'react';
import { Button, ButtonGroup } from '@primer/react';
import { ChevronLeftIcon, DiceIcon } from '@primer/octicons-react';
import type { JournalEntry } from '../domain/Entry';

/**
 * Props for SurpriseView component
 */
export interface SurpriseViewProps {
  /**
   * The journal entry to display, or null if no entry selected
   */
  entry: JournalEntry | null;

  /**
   * Called when user clicks "Autre surprise" button
   */
  onNext: () => void;

  /**
   * Called when user clicks "Retour" button or Escape key
   */
  onBack: () => void;

  /**
   * Whether the component is in a loading state
   */
  isLoading?: boolean;

  /**
   * Error message to display, or null if no error
   */
  error?: string | null;

  /**
   * Called when user clicks "Créer une entrée" in empty state
   */
  onCreateEntry?: () => void;

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
    return date.toLocaleDateString('fr-FR', {
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
    return date.toLocaleString('fr-FR', {
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
 * SurpriseView - Displays a random journal entry with navigation controls
 *
 * @example
 * const { surpriseEntry, getSurprise, nextSurprise, goBack, error } = useSurpriseEntry(entries);
 *
 * return (
 *   <SurpriseView
 *     entry={surpriseEntry}
 *     onNext={nextSurprise}
 *     onBack={goBack}
 *     error={error}
 *     onCreateEntry={() => navigate('/create')}
 *   />
 * );
 */
export function SurpriseView({
  entry,
  onNext,
  onBack,
  isLoading = false,
  error = null,
  onCreateEntry,
  className,
}: SurpriseViewProps): JSX.Element | null {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onBack();
      }
      // You could add additional keyboard shortcuts here
      // e.g., ArrowRight for next surprise
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onBack]);

  // Empty state - no entries available
  if (error && !entry) {
    return (
      <div
        className={className}
        data-testid="surprise-view-empty-state"
        style={{
          padding: '2rem',
          textAlign: 'center',
          border: '1px solid #d0d7de',
          borderRadius: '6px',
          backgroundColor: '#fafbfc',
        }}
      >
        <div
          style={{
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              marginBottom: '1rem',
            }}
            aria-label="Dice"
          >
            🎲
          </div>
          <h2
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.25rem',
              color: '#24292f',
            }}
          >
            {error}
          </h2>
          <p
            style={{
              margin: '0.5rem 0',
              color: '#57606a',
              fontSize: '0.95rem',
            }}
          >
            Créez votre première entrée pour utiliser la Surprise.
          </p>
        </div>

        {onCreateEntry && (
          <Button
            onClick={onCreateEntry}
            variant="primary"
            size="medium"
            data-testid="surprise-create-entry-button"
          >
            Créer une entrée
          </Button>
        )}
      </div>
    );
  }

  // No entry selected yet
  if (!entry) {
    return null;
  }

  return (
    <article
      className={className}
      data-testid={`surprise-view-${entry.id}`}
      style={{
        padding: '1.5rem',
        border: '1px solid #d0d7de',
        borderRadius: '6px',
        backgroundColor: '#fff',
      }}
      role="region"
      aria-label="Random journal entry"
    >
      {/* Header with date and timestamps */}
      <header style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
          }}
        >
          <span style={{ fontSize: '1.25rem' }} aria-hidden="true">
            🎲
          </span>
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              color: '#24292f',
            }}
            data-testid="surprise-entry-date"
          >
            {formatDate(entry.date)}
          </h2>
        </div>

        <div
          style={{
            fontSize: '0.875rem',
            color: '#57606a',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <span data-testid="surprise-entry-created-at">
            Created: {formatTimestamp(entry.createdAt)}
          </span>
          {entry.createdAt !== entry.updatedAt && (
            <span data-testid="surprise-entry-updated-at">
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
        data-testid="surprise-entry-text"
      >
        {entry.text}
      </div>

      {/* Action buttons */}
      <footer style={{ borderTop: '1px solid #d0d7de', paddingTop: '1rem' }}>
        <ButtonGroup>
          <Button
            onClick={onNext}
            disabled={isLoading}
            leadingVisual={DiceIcon}
            data-testid="surprise-next-button"
            aria-label="Autre surprise"
          >
            Autre surprise
          </Button>

          <Button
            onClick={onBack}
            disabled={isLoading}
            leadingVisual={ChevronLeftIcon}
            data-testid="surprise-back-button"
            aria-label="Retour à la timeline (ou appuyez sur Escape)"
          >
            Retour
          </Button>
        </ButtonGroup>

        {isLoading && (
          <div
            style={{
              marginTop: '0.75rem',
              fontSize: '0.875rem',
              color: '#57606a',
            }}
            data-testid="surprise-loading-indicator"
            role="status"
            aria-live="polite"
          >
            Chargement...
          </div>
        )}
      </footer>
    </article>
  );
}
