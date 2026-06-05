/**
 * TagMultiSelect Component
 * Multi-select tag filtering with checkboxes and colored indicators
 */

import React from 'react';
import { Tag } from '../models/types';

interface TagMultiSelectProps {
  /** All available tags to choose from */
  availableTags: Tag[];
  /** Currently selected tag names */
  selectedTags: string[];
  /** Callback when selection changes */
  onChange: (selectedTags: string[]) => void;
}

/**
 * TagMultiSelect: Checkbox list for selecting multiple tags
 * - Renders each available tag as a checkbox with colored indicator
 * - Uses getTagColor() colors from Slice 1 for consistency
 * - Toggles tag selection on click
 * - Uses flex wrap layout for responsive tag display
 */
export const TagMultiSelect: React.FC<TagMultiSelectProps> = ({
  availableTags,
  selectedTags,
  onChange,
}) => {
  const handleToggle = (tagName: string) => {
    const isSelected = selectedTags.includes(tagName);
    const newSelection = isSelected
      ? selectedTags.filter((t) => t !== tagName)
      : [...selectedTags, tagName];
    onChange(newSelection);
  };

  if (availableTags.length === 0) {
    return (
      <div
        className="p-4 bg-muted rounded-lg text-sm text-muted-foreground"
        data-testid="tag-multi-select-empty"
      >
        No tags available
      </div>
    );
  }

  return (
    <div
      className="p-4 bg-muted rounded-lg"
      data-testid="tag-multi-select"
    >
      <p className="text-sm font-medium text-foreground mb-3">Filter by tags:</p>
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.name);

          // Determine contrast color for text based on background
          const getTextColor = (hexColor: string): 'white' | 'black' => {
            const hex = hexColor.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance < 0.5 ? 'white' : 'black';
          };

          const textColor = getTextColor(tag.color);

          return (
            <label
              key={tag.name}
              className="flex items-center gap-2 cursor-pointer"
              data-testid={`tag-checkbox-${tag.name}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(tag.name)}
                className="w-4 h-4 rounded cursor-pointer"
                data-testid={`tag-checkbox-input-${tag.name}`}
              />
              <span
                className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
                style={{
                  backgroundColor: tag.color,
                  color: textColor,
                  opacity: isSelected ? 1 : 0.6,
                }}
                data-testid={`tag-chip-${tag.name}`}
              >
                {tag.name}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default TagMultiSelect;
