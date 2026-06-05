/**
 * ThoughtList component — displays thoughts as a flat list of cards
 * Renders thoughts sorted by creation date (most recent first)
 * Shows empty state message when no thoughts exist
 */

import React from 'react';
import { Thought } from '../models/types';
import { ThoughtCard } from './ThoughtCard';

export interface ThoughtListProps {
  /** Array of thoughts to display */
  thoughts: Thought[];
  /** Optional callback when surprise/highlight is triggered on a thought */
  onSurpriseClick?: (thought: Thought) => void;
}

/**
 * ThoughtList component
 * Displays an array of thoughts as individual cards in a flat list
 * Thoughts are sorted by createdAt in descending order (most recent first)
 * Shows an empty state message when no thoughts are provided
 *
 * @example
 * <ThoughtList thoughts={thoughts} />
 * <ThoughtList thoughts={thoughts} onSurpriseClick={(thought) => console.log(thought)} />
 */
export const ThoughtList: React.FC<ThoughtListProps> = ({
  thoughts,
  onSurpriseClick,
}) => {
  // Sort thoughts by createdAt descending (most recent first)
  const sortedThoughts = [...thoughts].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  // Empty state
  if (sortedThoughts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <p className="text-center text-gray-500 text-lg">
          No thoughts yet. Start by adding a new thought!
        </p>
      </div>
    );
  }

  return (
    <ul
      className="space-y-4 p-4"
      role="list"
    >
      {sortedThoughts.map((thought) => (
        <li key={thought.id}>
          <ThoughtCard
            thought={thought}
            onHighlight={
              onSurpriseClick
                ? () => onSurpriseClick(thought)
                : undefined
            }
          />
        </li>
      ))}
    </ul>
  );
};

export default ThoughtList;
