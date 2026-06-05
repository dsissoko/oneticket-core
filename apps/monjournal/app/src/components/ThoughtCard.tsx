import React, { CSSProperties } from 'react';
import { Thought } from '../models/thoughtModel';
import { formatDate } from '../utils/dateUtils';
import { TagDisplay } from './TagDisplay';

/**
 * Props for the ThoughtCard component.
 */
export interface ThoughtCardProps {
  /**
   * The thought to display.
   */
  thought: Thought;

  /**
   * Optional callback when the card is highlighted (for surprise feature).
   */
  onHighlight?: () => void;

  /**
   * Optional CSS class name for styling.
   */
  className?: string;
}

/**
 * ThoughtCard component displays a single thought in a card layout.
 *
 * Renders:
 * - Title (bold, card header)
 * - Content (truncated to ~100 characters with ellipsis)
 * - Creation date (relative format, e.g., "2 hours ago")
 * - Tags via TagDisplay component
 * - Optional highlight/selected state for surprise feature
 *
 * Styling uses AppShell card layout with hover state.
 *
 * @param props - Component props
 * @returns React component
 *
 * @example
 * const thought = createThought('My thought', 'This is the content...', ['work']);
 * <ThoughtCard thought={thought} onHighlight={() => console.log('highlighted')} />
 */
export function ThoughtCard({
  thought,
  onHighlight,
  className = '',
}: ThoughtCardProps): React.ReactElement {
  // Truncate content to ~100 characters
  const truncateContent = (text: string, maxLength: number = 100): string => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  const truncatedContent = truncateContent(thought.content);

  // Card container styles - using AppShell card layout pattern
  const [isHovered, setIsHovered] = React.useState(false);
  
  const cardStyle: CSSProperties = {
    padding: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: isHovered ? '#d1d9e0' : '#e1e4e8',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    boxShadow: isHovered ? '0 3px 12px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
  };

  // Header style (title)
  const titleStyle: CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: '#24292f',
    lineHeight: '1.4',
  };

  // Content style
  const contentStyle: CSSProperties = {
    fontSize: '14px',
    color: '#57606a',
    margin: '0 0 8px 0',
    lineHeight: '1.5',
  };

  // Metadata container style
  const metadataStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#6e7781',
  };

  // Date style
  const dateStyle: CSSProperties = {
    fontSize: '12px',
    color: '#6e7781',
  };

  const handleClick = (): void => {
    if (onHighlight) {
      onHighlight();
    }
  };

  return (
    <div
      className={className}
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      role="article"
      data-testid="thought-card"
    >
      {/* Title */}
      <h3 style={titleStyle}>{thought.title}</h3>

      {/* Content */}
      <p style={contentStyle}>{truncatedContent}</p>

      {/* Metadata: Date and Tags */}
      <div style={metadataStyle}>
        <span style={dateStyle}>{formatDate(thought.createdAt, 'relative')}</span>
      </div>

      {/* Tags */}
      {thought.tags.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <TagDisplay tags={thought.tags} compact={true} />
        </div>
      )}
    </div>
  );
}

export default ThoughtCard;
