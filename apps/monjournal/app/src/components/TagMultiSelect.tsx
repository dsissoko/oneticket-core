import React from 'react';
import { Tag } from '../models/tagModel';

interface TagMultiSelectProps {
  availableTags: Tag[];
  selectedTags: string[];
  onChange: (selectedTags: string[]) => void;
}

/**
 * Renders a list of tag checkboxes for multi-selection.
 * Each tag displays with its associated color as a visual indicator.
 */
export function TagMultiSelect({
  availableTags,
  selectedTags,
  onChange,
}: TagMultiSelectProps): React.ReactElement {
  // Handle checkbox toggle
  const handleTagToggle = (tagName: string) => {
    const updated = selectedTags.includes(tagName)
      ? selectedTags.filter((t) => t !== tagName)
      : [...selectedTags, tagName];
    onChange(updated);
  };

  if (availableTags.length === 0) {
    return <div className="tag-multi-select empty">No tags available</div>;
  }

  return (
    <div className="tag-multi-select">
      {availableTags.map((tag) => (
        <label key={tag.name} className="tag-checkbox-label">
          <input
            type="checkbox"
            className="tag-checkbox-input"
            checked={selectedTags.includes(tag.name)}
            onChange={() => handleTagToggle(tag.name)}
          />
          <span
            className="tag-checkbox-badge"
            style={{
              backgroundColor: tag.color,
              color: getContrastColor(tag.color),
            }}
          >
            {tag.name}
          </span>
        </label>
      ))}
    </div>
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
  const luminance = 0.299 * r * r + 0.587 * g * g + 0.114 * b * b;

  // If luminance is high, use dark text; otherwise use light text
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
