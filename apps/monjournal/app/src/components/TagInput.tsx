import React, { useState, useRef, useEffect } from 'react';
import styles from './TagInput.module.css';

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

  // Filter suggestions by current input (case-insensitive substring match)
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(value.toLowerCase()) &&
      suggestion !== '' &&
      value !== ''
  );

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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowDropdown(newValue.length > 0 && filteredSuggestions.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      // Do not add empty or duplicate tags
      if (value.trim() !== '') {
        onAddTag(value.trim());
        onChange('');
        setShowDropdown(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onAddTag(suggestion);
    onChange('');
    setShowDropdown(false);
  };

  const handleInputFocus = () => {
    if (value.length > 0 && filteredSuggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className={styles.tagInputContainer}>
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder="Add tag..."
          disabled={disabled}
          className={styles.input}
        />
      </div>
      {showDropdown && filteredSuggestions.length > 0 && (
        <div ref={dropdownRef} className={styles.dropdown}>
          {filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion}
              className={styles.suggestionItem}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
