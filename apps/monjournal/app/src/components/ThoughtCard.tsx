/**
 * ThoughtCard component — displays an individual thought as a card
 * Shows title, truncated content, date, and tags in a compact card layout
 */

import React from 'react';
import { Thought } from '../models/types';
import { formatDate } from '../utils/dateFormat';
import { TagDisplay } from './TagDisplay';

export interface ThoughtCardProps {
  /** The thought data to display */
  thought: Thought;
  /** Optional callback when card is highlighted/selected (for surprise feature) */
  onHighlight?: () => void;
  /** Optional flag to show highlighted state */
  isHighlighted?: boolean;
}

/**
 * Truncate content to approximately 100 characters with ellipsis
 * @param content - The full content text
 * @param maxLength - Maximum length (default 100)
 * @returns Truncated string with ellipsis if longer than maxLength
 */
function truncateContent(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) {
    return content;
  }
  // Find the last space within maxLength to avoid cutting words
  const truncated = content.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength - 20) {
    // If a space is found within reasonable distance, use it
    return truncated.substring(0, lastSpaceIndex) + '…';
  }
  // Otherwise just truncate at maxLength
  return truncated + '…';
}

/**
 * ThoughtCard component
 * Displays a single thought in card format with title, truncated content, date, and tags
 *
 * @example
 * <ThoughtCard thought={thought} />
 * <ThoughtCard thought={thought} onHighlight={() => console.log('highlighted')} isHighlighted={true} />
 */
export const ThoughtCard: React.FC<ThoughtCardProps> = ({
  thought,
  onHighlight,
  isHighlighted = false,
}) => {
  const truncatedContent = truncateContent(thought.content);
  const formattedDate = formatDate(thought.createdAt, 'relative');

  const handleClick = () => {
    if (onHighlight) {
      onHighlight();
    }
  };

  return (
    <div
      className={`
        p-4
        border rounded-lg
        shadow-sm
        hover:shadow-md
        transition-shadow duration-150
        cursor-pointer
        ${isHighlighted
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white'
        }
      `}
      onClick={handleClick}
      role="article"
    >
      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
        {thought.title}
      </h3>

      {/* Content - truncated */}
      <p className="text-gray-700 text-sm mb-3 leading-relaxed">
        {truncatedContent}
      </p>

      {/* Metadata row: date and tags */}
      <div className="flex items-center justify-between gap-2">
        {/* Date */}
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {formattedDate}
        </span>

        {/* Tags */}
        {thought.tags && thought.tags.length > 0 && (
          <div className="flex-1">
            <TagDisplay tags={thought.tags} compact={true} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ThoughtCard;
