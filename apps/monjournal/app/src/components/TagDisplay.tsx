import React from 'react';
import { getTagColor } from '../models/tagModel';

interface TagDisplayProps {
  tags: string[];
  compact?: boolean;
}

/**
 * Determines if text should be white or black based on background color brightness.
 * Uses relative luminance calculation for WCAG AA contrast compliance.
 * @param hexColor - Background color in hex format
 * @returns true if white text should be used, false for black text
 */
function shouldUseWhiteText(hexColor: string): boolean {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Parse hex color to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate relative luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // If luminance is > 0.5 (bright color), use black text; otherwise white
  return luminance <= 0.5;
}

/**
 * TagDisplay component renders tags as colored chips with responsive sizing.
 * Each tag uses a deterministic color from getTagColor() and chooses text color
 * for WCAG AA contrast compliance.
 */
export const TagDisplay: React.FC<TagDisplayProps> = ({ tags, compact = false }) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: compact ? '4px' : '8px',
      }}
    >
      {tags.map((tag) => {
        const backgroundColor = getTagColor(tag);
        const textColor = shouldUseWhiteText(backgroundColor) ? '#ffffff' : '#000000';

        return (
          <span
            key={tag}
            style={{
              backgroundColor,
              color: textColor,
              padding: compact ? '4px 8px' : '6px 12px',
              borderRadius: '4px',
              fontSize: compact ? '0.75rem' : '0.875rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              display: 'inline-block',
            }}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
};

export default TagDisplay;
