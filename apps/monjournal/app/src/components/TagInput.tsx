import React, { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { X } from 'lucide-react';

export interface TagInputProps {
  value: string;
  onChange: (text: string) => void;
  suggestions: string[];
  onAddTag: (tag: string) => void;
  disabled?: boolean;
}

/**
 * TagInput Component
 * 
 * Controlled autocomplete input with suggestion dropdown
 * - Filters suggestions by input value (case-insensitive substring match)
 * - Adds tag on Enter key or suggestion click
 * - Prevents duplicate tags from being added
 * - Clears input after tag is added
 */
export function TagInput({
  value,
  onChange,
  suggestions,
  onAddTag,
  disabled = false,
}: TagInputProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input value (case-insensitive substring match)
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(value.toLowerCase()) && value.trim().length > 0
  );

  // Show dropdown if there are filtered suggestions and input has content
  useEffect(() => {
    setIsOpen(filteredSuggestions.length > 0 && value.trim().length > 0);
    setHighlightedIndex(-1);
  }, [value, filteredSuggestions.length]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleAddTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (trimmed.length > 0) {
      onAddTag(trimmed);
      onChange('');
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag(value);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleAddTag(filteredSuggestions[highlightedIndex]);
        } else {
          handleAddTag(value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Add tags..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="pr-10"
        aria-autocomplete="list"
        aria-controls="tag-suggestions"
        aria-expanded={isOpen}
      />

      {/* Dropdown suggestions */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          id="tag-suggestions"
          className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-10"
          role="listbox"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleAddTag(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                highlightedIndex === index
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted text-foreground'
              }`}
              role="option"
              aria-selected={highlightedIndex === index}
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
