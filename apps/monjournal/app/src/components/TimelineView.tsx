import React from 'react';
import { Thought } from '../models/thoughtModel';
import { groupThoughtsByDate } from '../utils/groupByDate';
import { TimelineGroup } from './TimelineGroup';

interface TimelineViewProps {
  thoughts: Thought[];
  onSurpriseClick?: (thought: Thought) => void;
}

/**
 * Displays thoughts grouped by creation date with day separators.
 * Groups are shown in reverse chronological order (newest to oldest).
 */
export function TimelineView({
  thoughts,
  onSurpriseClick,
}: TimelineViewProps): React.ReactElement {
  const groupedThoughts = groupThoughtsByDate(thoughts);

  if (groupedThoughts.size === 0) {
    return (
      <div className="timeline-view empty-state">
        <p>No thoughts to display. Start by adding a new thought!</p>
      </div>
    );
  }

  return (
    <div className="timeline-view">
      {Array.from(groupedThoughts.entries()).map(([dateKey, dayThoughts]) => {
        // Convert dateKey back to timestamp for the TimelineGroup
        // dateKey format: YYYY-MM-DD
        const [year, month, day] = dateKey.split('-').map(Number);
        const dateTimestamp = new Date(year, month - 1, day).getTime();

        return (
          <TimelineGroup
            key={dateKey}
            date={dateTimestamp}
            thoughts={dayThoughts}
            onSurpriseClick={onSurpriseClick}
          />
        );
      })}
    </div>
  );
}
