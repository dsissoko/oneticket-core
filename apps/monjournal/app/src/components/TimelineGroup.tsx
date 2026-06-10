import React from 'react';
import { Thought } from '../models/thoughtModel';
import { formatDate } from '../utils/dateFormat';
import { ThoughtCard } from './ThoughtCard';

interface TimelineGroupProps {
  date: number;
  thoughts: Thought[];
  highlightedThoughtId?: string | null;
  highlightedRef?: React.RefObject<HTMLDivElement>;
}

/**
 * Container for one day's thoughts with a day separator.
 */
export function TimelineGroup({
  date,
  thoughts,
  highlightedThoughtId,
  highlightedRef,
}: TimelineGroupProps): React.ReactElement {
  const formattedDate = formatDate(date, 'absolute');

  return (
    <div className="timeline-group">
      <div className="timeline-separator">
        <div className="timeline-line" />
        <div className="timeline-date">{formattedDate}</div>
        <div className="timeline-line" />
      </div>
      <div className="timeline-group-content">
        {thoughts.map((thought) => (
          <div
            key={thought.id}
            ref={thought.id === highlightedThoughtId ? highlightedRef : undefined}
            className={thought.id === highlightedThoughtId ? 'highlighted' : ''}
          >
            <ThoughtCard thought={thought} />
          </div>
        ))}
      </div>
    </div>
  );
}
