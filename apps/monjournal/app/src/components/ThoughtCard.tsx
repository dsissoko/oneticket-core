import React from 'react';
import { Thought } from '../models/thoughtModel';
import { formatDate } from '../utils/dateFormat';
import { TagDisplay } from './TagDisplay';

interface ThoughtCardProps {
  thought: Thought;
}

/**
 * Individual thought display card showing title, truncated content, date, and tags.
 * Pure display component — no click behavior.
 */
export function ThoughtCard({
  thought,
}: ThoughtCardProps): React.ReactElement {
  const truncatedContent = truncateText(thought.content, 100);
  const formattedDate = formatDate(thought.createdAt, 'relative');

  return (
    <div className="thought-card">
      <div className="thought-card-header">
        <h3 className="thought-title">{thought.title}</h3>
      </div>
      <div className="thought-card-content">
        <p className="thought-text">{truncatedContent}</p>
      </div>
      <div className="thought-card-footer">
        <span className="thought-date">{formattedDate}</span>
      </div>
      {thought.tags.length > 0 && (
        <div className="thought-card-tags">
          <TagDisplay tags={thought.tags} compact={true} />
        </div>
      )}
    </div>
  );
}

/**
 * Truncates text to a maximum length with ellipsis if needed.
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '…';
}
