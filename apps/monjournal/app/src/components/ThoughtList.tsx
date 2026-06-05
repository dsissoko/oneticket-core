/**
 * ThoughtList Component
 * Renders thoughts as a flat list of cards, sorted by most recent first
 */

import React, { useMemo } from 'react';
import { Thought } from '../models/types';
import { ThoughtCard } from './ThoughtCard';

interface ThoughtListProps {
  /** Array of thoughts to display */
  thoughts: Thought[];
  /** Optional callback when a thought is highlighted */
  onSurpriseClick?: (thought: Thought) => void;
}

/**
 * ThoughtList: Display thoughts as a flat list of cards
 * - Renders each thought as a ThoughtCard
 * - Sorts by createdAt descending (most recent first)
 * - Shows empty state when no thoughts exist
 * - Uses responsive grid layout
 */
export const ThoughtList: React.FC<ThoughtListProps> = ({ thoughts, onSurpriseClick }) => {
  // Sort thoughts by createdAt descending (most recent first)
  const sortedThoughts = useMemo(
    () => [...thoughts].sort((a, b) => b.createdAt - a.createdAt),
    [thoughts]
  );

  // Empty state
  if (sortedThoughts.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        data-testid="thought-list-empty"
      >
        <p className="text-muted-foreground text-lg mb-2">No thoughts yet</p>
        <p className="text-muted-foreground text-sm">
          Create your first thought to get started
        </p>
      </div>
    );
  }

  // Render thought list
  return (
    <div
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="thought-list"
    >
      {sortedThoughts.map((thought) => (
        <ThoughtCard
          key={thought.id}
          thought={thought}
          onHighlight={onSurpriseClick ? () => onSurpriseClick(thought) : undefined}
        />
      ))}
    </div>
  );
};

export default ThoughtList;
