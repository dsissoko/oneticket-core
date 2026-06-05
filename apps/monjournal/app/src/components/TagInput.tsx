import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';

/**
 * TagInput Component Props
 */
interface TagInputProps {
  value: string;
  onChange: (text: string) => void;
  suggestions: string[];
  onAddTag: (tag: string) => void;
  disabled?: boolean;
}

/**
 * TagInput Component
 *
 * Controlled autocomplete input for adding tags.
 * Shows filtered suggestions dropdown and handles tag addition via Enter key or click.
 */
export function TagInput({
  value,
  onChange,
  suggestions,
  onAddTag,
  disabled = false,
}: TagInputProps): React.ReactElement {
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter suggestions based on current input (case-insensitive substring match)
  const filteredSuggestions = useMemo(() => {
    if (!value.trim()) {
      return [];
    }
    const lowerInput = value.toLowerCase();
    return suggestions.filter((tag) => tag.toLowerCase().includes(lowerInput));
  }, [value, suggestions]);

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onAddTag(value);
      }
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    onAddTag(suggestion);
    setShowDropdown(false);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowDropdown(newValue.trim().length > 0);
  };

  // Handle blur
  const handleBlur = () => {
    // Delay hiding dropdown to allow click on suggestion to register
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Type tag name and press Enter"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => value.trim().length > 0 && setShowDropdown(true)}
        onBlur={handleBlur}
        disabled={disabled}
      />

      {/* Dropdown suggestions */}
      {showDropdown && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 border border-border rounded-md bg-background shadow-lg">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-muted focus:outline-none focus:bg-muted transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

TagInput.displayName = 'TagInput';
