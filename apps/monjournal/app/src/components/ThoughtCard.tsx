/**
 * ThoughtCard Component
 * Displays a single thought with title, truncated content, date, and tags
 */

import React from 'react';
import { Thought } from '../models/types';
import { formatDate } from '../utils/dateFormat';
import { TagDisplay } from './TagDisplay';

interface ThoughtCardProps {
  /** The thought to display */
  thought: Thought;
  /** Optional callback when highlight/surprise is triggered */
  onHighlight?: () => void;
}

/**
 * Truncates content to approximately 100 characters with ellipsis
 * @param content - Content string to truncate
 * @param maxLength - Maximum length (default 100)
 * @returns Truncated content with ellipsis if needed
 */
const truncateContent = (content: string, maxLength: number = 100): string => {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength) + '…';
};

/**
 * ThoughtCard: Display a single thought as a card with:
 * - Title (bold)
 * - Truncated content (~100 chars)
 * - Relative date formatting
 * - Tags with colors
 * - Optional highlight state
 */
export const ThoughtCard: React.FC<ThoughtCardProps> = ({ thought, onHighlight }) => {
  const truncatedContent = truncateContent(thought.content, 100);
  const formattedDate = formatDate(thought.createdAt, 'relative');

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onHighlight}
      data-testid={`thought-card-${thought.id}`}
    >
      {/* Title */}
      <h3 className="font-bold text-base mb-2 text-card-foreground truncate">
        {thought.title}
      </h3>

      {/* Truncated Content */}
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {truncatedContent}
      </p>

      {/* Date and Tags Container */}
      <div className="flex flex-col gap-2">
        {/* Date */}
        <span className="text-xs text-muted-foreground">
          {formattedDate}
        </span>

        {/* Tags */}
        {thought.tags.length > 0 && (
          <TagDisplay tags={thought.tags} compact={true} />
        )}
      </div>
    </div>
  );
};

export default ThoughtCard;
