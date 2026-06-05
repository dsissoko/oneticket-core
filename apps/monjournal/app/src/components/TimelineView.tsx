/**
 * TimelineView Component
 * Displays thoughts grouped by creation date with day separators
 */

import React, { useMemo } from 'react';
import { Thought } from '../models/types';
import { groupThoughtsByDate, dateKeyToTimestamp } from '../utils/groupByDate';
import { TimelineGroup } from './TimelineGroup';

interface TimelineViewProps {
  /** Array of thoughts to group and display */
  thoughts: Thought[];
  /** Optional callback when a thought is highlighted */
  onSurpriseClick?: (thought: Thought) => void;
}

/**
 * TimelineView: Display thoughts grouped by creation date
 * - Groups thoughts by date using groupThoughtsByDate()
 * - Renders TimelineGroup for each day in reverse chronological order (newest first)
 * - Shows empty state when no thoughts exist
 * - Each group has a day separator with absolute date
 */
export const TimelineView: React.FC<TimelineViewProps> = ({
  thoughts,
  onSurpriseClick,
}) => {
  // Group thoughts by date
  const groupedThoughts = useMemo(
    () => groupThoughtsByDate(thoughts),
    [thoughts]
  );

  // Empty state
  if (groupedThoughts.size === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        data-testid="timeline-view-empty"
      >
        <p className="text-muted-foreground text-lg mb-2">No thoughts yet</p>
        <p className="text-muted-foreground text-sm">
          Create your first thought to get started
        </p>
      </div>
    );
  }

  // Render timeline
  return (
    <div className="timeline-view" data-testid="timeline-view">
      {Array.from(groupedThoughts.entries()).map(([dateKey, groupThoughts]) => {
        const timestamp = dateKeyToTimestamp(dateKey);
        return (
          <TimelineGroup
            key={dateKey}
            date={timestamp}
            thoughts={groupThoughts}
            onSurpriseClick={onSurpriseClick}
          />
        );
      })}
    </div>
  );
};

export default TimelineView;
