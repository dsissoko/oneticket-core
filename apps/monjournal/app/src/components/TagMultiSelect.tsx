import React from 'react';
import { Tag } from '../models/tagModel';
import { getTagColor } from '../models/tagModel';

interface TagMultiSelectProps {
  availableTags: Tag[];
  selectedTags: string[];
  onChange: (selectedTags: string[]) => void;
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
 * TagMultiSelect component provides a checkbox list for selecting multiple tags.
 * Each tag is displayed with its color chip and can be toggled on/off.
 */
export const TagMultiSelect: React.FC<TagMultiSelectProps> = ({
  availableTags,
  selectedTags,
  onChange,
}) => {
  const handleToggleTag = (tagName: string) => {
    const newSelection = selectedTags.includes(tagName)
      ? selectedTags.filter((t) => t !== tagName)
      : [...selectedTags, tagName];
    onChange(newSelection);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      {availableTags.map((tag) => {
        const isSelected = selectedTags.includes(tag.name);
        const backgroundColor = getTagColor(tag.name);
        const textColor = shouldUseWhiteText(backgroundColor) ? '#ffffff' : '#000000';

        return (
          <label
            key={tag.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggleTag(tag.name)}
              style={{
                cursor: 'pointer',
              }}
            />
            <span
              style={{
                backgroundColor,
                color: textColor,
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                opacity: isSelected ? 1 : 0.7,
                border: isSelected ? `2px solid ${backgroundColor}` : '2px solid transparent',
              }}
            >
              {tag.name}
            </span>
          </label>
        );
      })}
    </div>
  );
};

export default TagMultiSelect;
