/**
 * Component: TimelineItem
 *
 * Individual entry card displaying in the timeline.
 * Shows:
 * - Text preview (~150 characters) with ellipsis
 * - Entry metadata (date, created/updated timestamps)
 * - Click handler to open entry detail view
 *
 * Accessibility: WCAG 2.1 AA — keyboard navigation (Tab, Enter)
 */

import React from 'react';
import type { JournalEntry } from '../domain/Entry';
import '../styles/timeline.css';

export interface TimelineItemProps {
  entry: JournalEntry;
  onEntryClick: (entry: JournalEntry) => void;
  textPreviewLength?: number;  // Characters to show (default: 150)
}

/**
 * Truncate text to specified length with ellipsis
 * Avoids cutting mid-word if possible
 */
function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Truncate at maxLength
  let truncated = text.substring(0, maxLength);

  // Try to avoid cutting mid-word by finding last space
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.8) {
    // If last space is reasonably close to end, use it
    truncated = truncated.substring(0, lastSpace);
  }

  return truncated + '…';
}

/**
 * Format timestamp to localized datetime string
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return timestamp;
  }
}

export function TimelineItem({
  entry,
  onEntryClick,
  textPreviewLength = 150,
}: TimelineItemProps): JSX.Element {
  const previewText = truncateText(entry.text, textPreviewLength);
  const isEdited = new Date(entry.createdAt).getTime() !== new Date(entry.updatedAt).getTime();

  const handleClick = () => {
    onEntryClick(entry);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onEntryClick(entry);
    }
  };

  return (
    <div className="timeline-item">
      <button
        className="timeline-item-button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Entry from ${formatTimestamp(entry.createdAt)}: ${previewText}`}
      >
        <div className="timeline-item-content">
          <p className="timeline-item-text">{previewText}</p>
          {isEdited && <span className="timeline-item-edited-badge">Modifiée</span>}
        </div>
        <div className="timeline-item-metadata">
          <span className="timeline-item-timestamp">
            {formatTimestamp(entry.createdAt)}
          </span>
        </div>
      </button>
    </div>
  );
}
