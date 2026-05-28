/**
 * Component: SortToggle
 *
 * Toggle component for switching sort order between ascending (oldest first)
 * and descending (newest first) layouts.
 *
 * Accessibility: WCAG 2.1 AA — keyboard navigation (Tab, Enter)
 */

import React from 'react';
import type { SortOrder } from '../hooks/useTimelineSort';
import '../styles/timeline.css';

export interface SortToggleProps {
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
}

export function SortToggle({ sortOrder, onSortChange }: SortToggleProps): JSX.Element {
  const handleToggle = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    onSortChange(newOrder);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  const label = sortOrder === 'desc' 
    ? 'Récent → Ancien' 
    : 'Ancien → Récent';

  return (
    <div className="sort-toggle">
      <button
        className="sort-toggle-button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-label={`Trier par ${label}`}
        aria-pressed={sortOrder === 'desc'}
      >
        <span className="sort-toggle-label">{label}</span>
        <span className="sort-toggle-icon" aria-hidden="true">
          {sortOrder === 'desc' ? '⬇️' : '⬆️'}
        </span>
      </button>
    </div>
  );
}
