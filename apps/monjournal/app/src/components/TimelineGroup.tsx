/**
 * TimelineGroup Component
 * Container for one day's thoughts with a date separator
 */

import React from 'react';
import { Thought } from '../models/types';
import { formatDate } from '../utils/dateFormat';
import { ThoughtCard } from './ThoughtCard';

interface TimelineGroupProps {
  /** Timestamp of the day (in milliseconds) */
  date: number;
  /** Thoughts for this day */
  thoughts: Thought[];
  /** Optional callback when a thought is highlighted */
  onSurpriseClick?: (thought: Thought) => void;
}

/**
 * TimelineGroup: Container for one day's thoughts
 * - Renders a day separator with absolute date (e.g., "June 4, 2026")
 * - Lists ThoughtCard components for that day
 * - Thoughts within the group are in reverse chronological order
 * - Separator has a horizontal line for visual distinction
 */
export const TimelineGroup: React.FC<TimelineGroupProps> = ({
  date,
  thoughts,
  onSurpriseClick,
}) => {
  const formattedDate = formatDate(date, 'absolute');

  return (
    <div className="mb-8" data-testid={`timeline-group-${formattedDate}`}>
      {/* Day Separator */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border"></div>
        <span className="text-sm font-medium text-muted-foreground px-2 whitespace-nowrap">
          {formattedDate}
        </span>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      {/* Thoughts for this day */}
      <div className="space-y-3" data-testid={`timeline-thoughts-${formattedDate}`}>
        {thoughts.map((thought) => (
          <ThoughtCard
            key={thought.id}
            thought={thought}
            onHighlight={
              onSurpriseClick ? () => onSurpriseClick(thought) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineGroup;
