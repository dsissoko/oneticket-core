import React from 'react';
import { getTagColor } from '../models/tagModel';

interface TagDisplayProps {
  tags: string[];
  compact?: boolean;
}

/**
 * Renders tags as colored chip elements with good text contrast.
 */
export function TagDisplay({ tags, compact = false }: TagDisplayProps): React.ReactElement {
  if (tags.length === 0) {
    return <div className="tag-display empty" />;
  }

  return (
    <div className={`tag-display ${compact ? 'compact' : ''}`}>
      {tags.map((tag) => (
        <Tag key={tag} name={tag} compact={compact} />
      ))}
    </div>
  );
}

interface TagProps {
  name: string;
  compact?: boolean;
}

/**
 * Individual tag chip with background color and contrasting text.
 */
function Tag({ name, compact = false }: TagProps): React.ReactElement {
  const bgColor = getTagColor(name);
  const textColor = getContrastColor(bgColor);

  return (
    <span
      className={`tag-chip ${compact ? 'compact' : ''}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {name}
    </span>
  );
}

/**
 * Determines if text should be black or white for good contrast.
 * Uses relative luminance calculation per WCAG.
 */
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Calculate relative luminance
  const luminance =
    0.299 * r * r +
    0.587 * g * g +
    0.114 * b * b;

  // If luminance is high, use dark text; otherwise use light text
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
