/**
 * TagDisplay component — renders tags as colored chip elements
 * Each tag is displayed with a color derived from getTagColor()
 * Text color is automatically adjusted (black or white) for WCAG AA contrast
 */

import React from 'react';
import { getTagColor } from '../models/tagModel';

export interface TagDisplayProps {
  /** Array of tag names to display */
  tags: readonly string[];
  /** Optional compact sizing for mobile layouts (default: false) */
  compact?: boolean;
}

/**
 * Determine if a color is light or dark for contrast purposes
 * Uses relative luminance calculation per WCAG standards
 * @param hexColor - Hex color string (e.g., "#FF6B6B")
 * @returns true if color is light, false if dark
 */
function isLightColor(hexColor: string): boolean {
  // Remove # and parse hex color
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance per WCAG formula
  // https://www.w3.org/TR/WCAG20/#relativeluminancedef
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Light if luminance > 0.5
  return luminance > 0.5;
}

/**
 * TagDisplay component
 * Renders tags with deterministic colors and accessible text contrast
 *
 * @example
 * <TagDisplay tags={["personal", "morning"]} />
 * <TagDisplay tags={["work"]} compact={true} />
 * <TagDisplay tags={[]} /> // renders nothing
 */
export const TagDisplay: React.FC<TagDisplayProps> = ({ tags, compact = false }) => {
  // Handle empty tags array gracefully
  if (!tags || tags.length === 0) {
    return null;
  }

  const paddingClass = compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm';
  const gapClass = compact ? 'gap-1' : 'gap-2';

  return (
    <div className={`flex flex-wrap ${gapClass}`}>
      {tags.map((tag) => {
        const backgroundColor = getTagColor(tag);
        const textColor = isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';

        return (
          <span
            key={tag}
            className={`inline-flex rounded-md font-medium transition-colors duration-150 ${paddingClass}`}
            style={{
              backgroundColor,
              color: textColor,
            }}
            title={tag}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
};

export default TagDisplay;
