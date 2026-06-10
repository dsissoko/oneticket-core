import React from 'react';
import { Thought } from '../models/thoughtModel';
import { ThoughtCard } from './ThoughtCard';

interface ThoughtListProps {
  thoughts: Thought[];
  highlightedThoughtId?: string | null;
  highlightedRef?: React.RefObject<HTMLDivElement>;
}

/**
 * Displays a flat list of thoughts as cards, sorted by most recent first.
 */
export function ThoughtList({
  thoughts,
  highlightedThoughtId,
  highlightedRef,
}: ThoughtListProps): React.ReactElement {
  // Sort thoughts by createdAt descending (most recent first)
  const sortedThoughts = [...thoughts].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  if (sortedThoughts.length === 0) {
    return (
      <div className="thought-list empty-state">
        <p>No thoughts to display. Start by adding a new thought!</p>
      </div>
    );
  }

  return (
    <div className="thought-list">
      {sortedThoughts.map((thought) => (
        <div
          key={thought.id}
          ref={thought.id === highlightedThoughtId ? highlightedRef : undefined}
          className={thought.id === highlightedThoughtId ? 'highlighted' : ''}
        >
          <ThoughtCard thought={thought} />
        </div>
      ))}
    </div>
  );
}
