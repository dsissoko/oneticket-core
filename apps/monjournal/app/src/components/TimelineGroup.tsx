/**
 * TimelineGroup component — displays a day's thoughts with a date separator
 * Part of the TimelineView component, shows a day header and list of thought cards for that day
 */

import React from 'react';
import { Thought } from '../models/types';
import { formatDate } from '../utils/dateFormat';
import { ThoughtCard } from './ThoughtCard';

export interface TimelineGroupProps {
  /** Timestamp of the day (in milliseconds) - used to normalize and display the date */
  date: number;
  /** Array of thoughts for this day, should be pre-sorted by createdAt descending */
  thoughts: Thought[];
  /** Optional callback when a thought is highlighted/surprised */
  onSurpriseClick?: (thought: Thought) => void;
}

/**
 * TimelineGroup component
 * Displays a day separator header with the absolute date format (e.g., "June 4, 2026")
 * followed by a list of ThoughtCard components for that day
 *
 * @example
 * <TimelineGroup
 *   date={1717534800000}
 *   thoughts={[thought1, thought2]}
 *   onSurpriseClick={(thought) => console.log(thought.id)}
 * />
 */
export const TimelineGroup: React.FC<TimelineGroupProps> = ({
  date,
  thoughts,
  onSurpriseClick,
}) => {
  const formattedDate = formatDate(date, 'absolute');

  return (
    <div className="mb-8">
      {/* Day separator header with horizontal line */}
      <div className="flex items-center gap-4 mb-4">
        {/* Left horizontal line */}
        <div className="flex-1 h-px bg-gray-300" />
        
        {/* Date label - centered, compact styling */}
        <span className="text-sm font-semibold text-gray-600 px-2 whitespace-nowrap">
          {formattedDate}
        </span>
        
        {/* Right horizontal line */}
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      {/* List of thoughts for this day */}
      <div className="space-y-3 px-2">
        {thoughts.map((thought) => (
          <ThoughtCard
            key={thought.id}
            thought={thought}
            onHighlight={
              onSurpriseClick
                ? () => onSurpriseClick(thought)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineGroup;
