/**
 * TagMultiSelect component — multi-checkbox selector for tags
 * Renders all available tags with visual indicators and selection state
 * Uses TagDisplay for colored chip representation
 */

import React from 'react';
import { Tag } from '../models/types';

export interface TagMultiSelectProps {
  /** Array of all available tags to choose from */
  availableTags: readonly Tag[];
  /** Array of currently selected tag names */
  selectedTags: readonly string[];
  /** Callback when selection changes (called with new selectedTags array) */
  onChange: (selectedTags: string[]) => void;
}

/**
 * TagMultiSelect component
 * Renders checkboxes for each tag with colored visual indicators
 * Layout uses flex wrap to handle many tags (10+, 100+)
 *
 * @example
 * <TagMultiSelect
 *   availableTags={[
 *     { name: "personal", color: "#FF6B6B" },
 *     { name: "work", color: "#45B7D1" }
 *   ]}
 *   selectedTags={["personal"]}
 *   onChange={(newSelection) => setFilterState({ ...filterState, selectedTags: newSelection })}
 * />
 */
export const TagMultiSelect: React.FC<TagMultiSelectProps> = ({
  availableTags,
  selectedTags,
  onChange,
}) => {
  const handleTagToggle = (tagName: string): void => {
    const newSelection = selectedTags.includes(tagName)
      ? selectedTags.filter((t) => t !== tagName)
      : [...selectedTags, tagName];
    onChange(newSelection);
  };

  // If no tags available, show empty state
  if (!availableTags || availableTags.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No tags available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium">Tags:</label>
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.name);
          return (
            <label
              key={tag.name}
              className={`
                inline-flex items-center gap-2 px-3 py-2 rounded-md
                cursor-pointer transition-all duration-150 border-2
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleTagToggle(tag.name)}
                className="w-4 h-4 rounded cursor-pointer accent-blue-500"
                aria-label={`Toggle ${tag.name} tag`}
              />
              <div className="flex items-center gap-1">
                {/* Render the tag as a colored chip */}
                <div
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                  title={tag.name}
                />
                <span className="text-sm font-medium">{tag.name}</span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default TagMultiSelect;
