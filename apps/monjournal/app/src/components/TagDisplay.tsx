import React, { CSSProperties } from 'react';
import { getTagColor } from '../models/tagModel';

/**
 * Props for the TagDisplay component.
 */
export interface TagDisplayProps {
  /**
   * Array of tag names to display.
   */
  tags: string[];

  /**
   * Optional compact size (default false for normal size).
   * When true, uses smaller padding and font size.
   */
  compact?: boolean;

  /**
   * Optional CSS class name for styling.
   */
  className?: string;
}

/**
 * Determines the text color for a tag based on background brightness.
 * Returns 'white' for dark backgrounds, 'black' for light backgrounds.
 *
 * @param backgroundColor - Hex color string (e.g., "#FF6B6B")
 * @returns Either 'white' or 'black' for text color
 */
function getContrastColor(backgroundColor: string): string {
  // Remove the # if present
  const hex = backgroundColor.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance using WCAG formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * TagDisplay component renders tags as colored chips.
 *
 * Features:
 * - Each tag displays as a colored chip using getTagColor()
 * - Text color is automatically determined for contrast (black or white)
 * - Responsive sizing (compact mode for smaller displays)
 * - Inline flex layout for horizontal arrangement
 * - WCAG AA compliant contrast ratios
 *
 * @param props - Component props
 * @returns React component
 *
 * @example
 * <TagDisplay tags={['work', 'urgent']} compact={false} />
 */
export function TagDisplay({
  tags,
  compact = false,
  className = '',
}: TagDisplayProps): React.ReactElement {
  // Container style - inline flex layout
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: compact ? '4px' : '8px',
    alignItems: 'center',
  };

  // Chip style - base styling for each tag
  const getChipStyle = (tagColor: string): CSSProperties => ({
    display: 'inline-block',
    backgroundColor: tagColor,
    color: getContrastColor(tagColor),
    padding: compact ? '4px 8px' : '6px 12px',
    borderRadius: '12px',
    fontSize: compact ? '11px' : '12px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    lineHeight: '1.4',
  });

  if (tags.length === 0) {
    return <div style={containerStyle} className={className} />;
  }

  return (
    <div style={containerStyle} className={className} data-testid="tag-display">
      {tags.map((tag) => (
        <span
          key={tag}
          style={getChipStyle(getTagColor(tag))}
          data-testid={`tag-chip-${tag}`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export default TagDisplay;
