/**
 * TimelineView component — displays thoughts grouped by creation date with day separators
 * Shows thoughts in a vertical timeline layout, grouped and sorted by date in reverse chronological order
 */

import React from 'react';
import { Thought } from '../models/types';
import { groupThoughtsByDate } from '../utils/groupByDate';
import { TimelineGroup } from './TimelineGroup';

export interface TimelineViewProps {
  /** Array of thoughts to display and group by date */
  thoughts: Thought[];
  /** Optional callback when a thought is highlighted/surprised */
  onSurpriseClick?: (thought: Thought) => void;
}

/**
 * Helper function to parse a date key (YYYY-MM-DD) back to a timestamp
 * for passing to TimelineGroup's date prop
 * Returns midnight of that date in local time
 *
 * @param dateKey - Date string in YYYY-MM-DD format
 * @returns timestamp in milliseconds (midnight of that day)
 */
function dateKeyToTimestamp(dateKey: string): number {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
}

/**
 * TimelineView component
 * Groups thoughts by creation date and displays them in a vertical timeline layout
 * with day separators. Groups are displayed in reverse chronological order (newest first).
 *
 * @example
 * <TimelineView
 *   thoughts={allThoughts}
 *   onSurpriseClick={(thought) => handleSurprise(thought)}
 * />
 *
 * @example
 * // Empty state
 * <TimelineView thoughts={[]} />
 */
export const TimelineView: React.FC<TimelineViewProps> = ({
  thoughts,
  onSurpriseClick,
}) => {
  // Group thoughts by date using utility function
  // Map is already sorted in reverse chronological order (newest first)
  const groupedThoughts = groupThoughtsByDate(thoughts);

  // Handle empty state
  if (groupedThoughts.size === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 px-4"
        role="status"
        aria-live="polite"
      >
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-lg text-gray-600 text-center">
          No thoughts yet. Start by adding a new thought!
        </p>
      </div>
    );
  }

  // Render timeline groups in reverse chronological order
  // The Map is already sorted by groupThoughtsByDate, so we iterate directly
  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-8"
      role="main"
      aria-label="Timeline view of thoughts"
    >
      {/* Container for all timeline groups */}
      <div className="max-w-2xl mx-auto">
        {/* Iterate through grouped thoughts in order (newest first) */}
        {Array.from(groupedThoughts.entries()).map(([dateKey, groupedThoughtsForDay]) => (
          <TimelineGroup
            key={dateKey}
            date={dateKeyToTimestamp(dateKey)}
            thoughts={groupedThoughtsForDay}
            onSurpriseClick={onSurpriseClick}
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineView;
