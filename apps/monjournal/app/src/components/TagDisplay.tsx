/**
 * TagDisplay Component
 * Renders tags as colored chips with WCAG AA compliant contrast
 */

import React from 'react';
import { getTagColor } from '../models/tagModel';

interface TagDisplayProps {
  /** Array of tag names to display */
  tags: string[];
  /** Optional: use compact sizing */
  compact?: boolean;
}

/**
 * Determines if text should be white or black based on background color brightness
 * Uses relative luminance calculation for WCAG AA contrast
 * @param hexColor - Hex color string (e.g., "#FF6B6B")
 * @returns 'white' or 'black' for best contrast
 */
const getContrastColor = (hexColor: string): 'white' | 'black' => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Use white text for dark backgrounds, black text for light backgrounds
  return luminance < 0.5 ? 'white' : 'black';
};

/**
 * TagDisplay: Renders an array of tags as colored chips
 * Each tag receives a deterministic color from getTagColor()
 * Text color is chosen for WCAG AA contrast compliance
 */
export const TagDisplay: React.FC<TagDisplayProps> = ({ tags, compact = false }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  const paddingClass = compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const gapClass = compact ? 'gap-1' : 'gap-2';

  return (
    <div className={`flex flex-wrap ${gapClass}`} data-testid="tag-display">
      {tags.map((tag) => {
        const backgroundColor = getTagColor(tag);
        const textColor = getContrastColor(backgroundColor);

        return (
          <span
            key={tag}
            className={`rounded-full font-medium whitespace-nowrap ${paddingClass}`}
            style={{
              backgroundColor,
              color: textColor,
            }}
            data-testid={`tag-chip-${tag}`}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
};

export default TagDisplay;
