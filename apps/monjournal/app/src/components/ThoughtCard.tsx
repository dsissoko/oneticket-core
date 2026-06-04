import React, { useState } from 'react';
import { Thought } from '../models/thoughtModel';
import { formatDate } from '../utils/dateFormat';
import { TagDisplay } from './TagDisplay';

interface ThoughtCardProps {
  thought: Thought;
  onHighlight?: () => void;
}

/**
 * ThoughtCard component renders an individual thought as a card unit.
 * Displays title, truncated content, creation date, and tags.
 * Supports optional highlight state for surprise feature.
 */
export const ThoughtCard: React.FC<ThoughtCardProps> = ({ thought, onHighlight }) => {
  const [isHighlighted, setIsHighlighted] = useState(false);

  const handleHighlight = () => {
    setIsHighlighted(!isHighlighted);
    onHighlight?.();
  };

  // Truncate content to ~100 characters with ellipsis
  const truncatedContent =
    thought.content.length > 100
      ? thought.content.substring(0, 100) + '...'
      : thought.content;

  return (
    <div
      onClick={handleHighlight}
      style={{
        padding: '12px 16px',
        border: isHighlighted ? '2px solid #4f46e5' : '1px solid #e5e7eb',
        borderRadius: '6px',
        backgroundColor: isHighlighted ? '#eef2ff' : '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        cursor: onHighlight ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {/* Title (bold header) */}
      <h3
        style={{
          margin: '0 0 8px 0',
          fontSize: '1rem',
          fontWeight: 700,
          color: '#1f2937',
          lineHeight: 1.4,
        }}
      >
        {thought.title}
      </h3>

      {/* Truncated content */}
      <p
        style={{
          margin: '0 0 8px 0',
          fontSize: '0.875rem',
          color: '#6b7280',
          lineHeight: 1.5,
        }}
      >
        {truncatedContent}
      </p>

      {/* Creation date (relative format) */}
      <p
        style={{
          margin: '0 0 8px 0',
          fontSize: '0.75rem',
          color: '#9ca3af',
        }}
      >
        {formatDate(thought.createdAt, 'relative')}
      </p>

      {/* Tags via TagDisplay component */}
      {thought.tags.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <TagDisplay tags={thought.tags} compact={true} />
        </div>
      )}
    </div>
  );
};

export default ThoughtCard;
