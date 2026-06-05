import React, { useState, useRef, useEffect } from 'react';
import { getTagColor } from '../models/tagModel';
import '../styles/form-components.css';

/**
 * TagInput - A controlled autocomplete component for adding tags
 *
 * Features:
 * - Text input with dropdown suggestions
 * - Filters suggestions by input (case-insensitive substring match)
 * - Adds tag on Enter key if non-empty and not duplicate
 * - Adds tag on suggestion click if not duplicate
 * - Clears input after tag is added
 * - Prevents empty and duplicate tags
 */
interface TagInputProps {
  value: string;
  onChange: (text: string) => void;
  suggestions: string[];
  onAddTag: (tag: string) => void;
  disabled?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  suggestions,
  onAddTag,
  disabled = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input value (case-insensitive substring match)
  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(value.toLowerCase())
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowDropdown(newValue.length > 0);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = value.trim();
      
      // Only add if non-empty
      if (trimmedValue.length > 0) {
        onAddTag(trimmedValue);
        onChange('');
        setShowDropdown(false);
      }
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    onAddTag(suggestion);
    onChange('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="tag-input-wrapper">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (value.length > 0) {
            setShowDropdown(true);
          }
        }}
        placeholder="Type a tag and press Enter"
        disabled={disabled}
        className="tag-input"
        aria-label="Tag input"
        aria-autocomplete="list"
        aria-controls="tag-suggestions"
      />
      {showDropdown && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          id="tag-suggestions"
          className="tag-suggestions"
          role="listbox"
        >
          {filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="tag-suggestion-item"
              role="option"
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * TagList - Displays selected tags as colored chips
 *
 * Features:
 * - Renders tags as colored chips
 * - Shows tag name with background color from getTagColor()
 * - Displays remove button (X) on each chip
 * - Calls onRemoveTag() callback on remove click
 * - Uses inline flex layout
 */
interface TagListProps {
  tags: string[];
  onRemoveTag: (tag: string) => void;
}

export const TagList: React.FC<TagListProps> = ({ tags, onRemoveTag }) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="tag-list">
      {tags.map((tag) => {
        const color = getTagColor(tag);
        // Determine text color for contrast
        const textColor = shouldUseLightText(color) ? '#FFFFFF' : '#000000';

        return (
          <div
            key={tag}
            className="tag-chip"
            style={{
              backgroundColor: color,
              color: textColor,
            }}
            role="status"
            aria-label={`Tag: ${tag}`}
          >
            <span className="tag-name">{tag}</span>
            <button
              onClick={() => onRemoveTag(tag)}
              className="tag-remove-button"
              aria-label={`Remove tag: ${tag}`}
              type="button"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Helper function to determine if light text should be used based on background color
 * Uses relative luminance calculation (simplified)
 */
function shouldUseLightText(hexColor: string): boolean {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return true if background is dark (luminance < 0.5), use light text
  return luminance < 0.5;
}
