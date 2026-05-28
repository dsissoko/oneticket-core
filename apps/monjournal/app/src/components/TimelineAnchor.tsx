/**
 * Component: TimelineAnchor
 *
 * Visual date divider/anchor component that groups entries by date.
 * Displays the date in localized format (e.g., "25 mai 2026") and entry count.
 * Clickable to filter entries to that specific date.
 *
 * Accessibility: WCAG 2.1 AA — keyboard navigation (Tab, Enter)
 */

import React from 'react';
import '../styles/timeline.css';

export interface TimelineAnchorProps {
  date: string;           // YYYY-MM-DD format
  entryCount: number;     // Number of entries for this date
  onClick?: () => void;   // Filter by this date
}

/**
 * Format date from YYYY-MM-DD to localized string (e.g., "25 mai 2026" in French)
 */
function formatDateLocalized(dateString: string): string {
  try {
    const date = new Date(dateString + 'T00:00:00Z');
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function TimelineAnchor({ date, entryCount, onClick }: TimelineAnchorProps): JSX.Element {
  const isClickable = onClick !== undefined;

  return (
    <div className="timeline-anchor">
      <button
        className={`timeline-anchor-button ${isClickable ? 'clickable' : ''}`}
        onClick={onClick}
        disabled={!isClickable}
        aria-label={`Filter entries for ${formatDateLocalized(date)} (${entryCount} ${entryCount === 1 ? 'entry' : 'entries'})`}
        tabIndex={isClickable ? 0 : -1}
      >
        <span className="timeline-anchor-date">{formatDateLocalized(date)}</span>
        <span className="timeline-anchor-count">{entryCount}</span>
      </button>
    </div>
  );
}
