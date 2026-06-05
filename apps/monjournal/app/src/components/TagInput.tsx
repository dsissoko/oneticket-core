import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export interface TagInputProps {
  value: string;
  onChange: (text: string) => void;
  suggestions: string[];
  onAddTag: (tag: string) => void;
  disabled?: boolean;
}

/**
 * TagInput - Controlled autocomplete input component for tags
 * 
 * Renders a text input with autocomplete dropdown suggestions.
 * Filters suggestions by case-insensitive substring match.
 * Adds tags on Enter key or suggestion click.
 */
export function TagInput({
  value,
  onChange,
  suggestions,
  onAddTag,
  disabled = false,
}: TagInputProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on current input (case-insensitive substring)
  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(value.toLowerCase())
  );

  // Handle Enter key to add tag
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      onAddTag(value.trim());
      onChange('');
      setIsOpen(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    onAddTag(suggestion);
    onChange('');
    setIsOpen(false);
  };

  // Handle input focus/blur
  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Delay to allow suggestion click to register
    setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Type tag name..."
        disabled={disabled}
        autoComplete="off"
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <div className={cn(
          'absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-md z-10',
          'max-h-48 overflow-y-auto'
        )}>
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                'w-full text-left px-3 py-2 text-sm',
                'hover:bg-accent hover:text-accent-foreground',
                'transition-colors'
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default TagInput;
