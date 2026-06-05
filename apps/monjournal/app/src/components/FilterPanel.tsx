/**
 * FilterPanel Component
 * Unified filter UI container with text search, date range, tag multi-select, and surprise button
 */

import React, { useState } from 'react';
import { Tag, FilterState } from '../models/types';
import { DateRangePicker } from './DateRangePicker';
import { TagMultiSelect } from './TagMultiSelect';

interface FilterPanelProps {
  /** All available tags derived from thoughts */
  existingTags: Tag[];
  /** Callback when filter state changes */
  onFilterChange: (filters: FilterState) => void;
  /** Callback when surprise button is clicked */
  onSurpriseClick: () => void;
  /** Whether surprise button should be disabled (no filtered results) */
  surpriseDisabled?: boolean;
}

/**
 * FilterPanel: Unified UI for all filtering controls
 * - Text search input with real-time updates
 * - Date range picker with start/end date fields
 * - Tag multi-select with checkboxes
 * - Surprise button for random thought selection
 * - Optional reset button to clear all filters
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({
  existingTags,
  onFilterChange,
  onSurpriseClick,
  surpriseDisabled = false,
}) => {
  const [text, setText] = useState<string>('');
  const [dateStart, setDateStart] = useState<number | null>(null);
  const [dateEnd, setDateEnd] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  /**
   * Handles text input changes
   * Updates filter state with new search query
   */
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText(newText);
    emitFilterChange({
      text: newText || undefined,
      dateStart: dateStart || undefined,
      dateEnd: dateEnd || undefined,
      selectedTags: selectedTags.length > 0 ? selectedTags : undefined,
    });
  };

  /**
   * Handles date range changes
   * Updates filter state with new date bounds
   */
  const handleDateRangeChange = (start: number | null, end: number | null) => {
    setDateStart(start);
    setDateEnd(end);
    emitFilterChange({
      text: text || undefined,
      dateStart: start || undefined,
      dateEnd: end || undefined,
      selectedTags: selectedTags.length > 0 ? selectedTags : undefined,
    });
  };

  /**
   * Handles tag selection changes
   * Updates filter state with new selected tags
   */
  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
    emitFilterChange({
      text: text || undefined,
      dateStart: dateStart || undefined,
      dateEnd: dateEnd || undefined,
      selectedTags: tags.length > 0 ? tags : undefined,
    });
  };

  /**
   * Clears all filters and resets to default state
   */
  const handleClearFilters = () => {
    setText('');
    setDateStart(null);
    setDateEnd(null);
    setSelectedTags([]);
    emitFilterChange({});
  };

  /**
   * Emits filter change to parent component
   * Cleans up undefined values for cleaner state
   */
  const emitFilterChange = (filters: FilterState) => {
    onFilterChange(filters);
  };

  // Check if any filters are active
  const hasActiveFilters = text || dateStart || dateEnd || selectedTags.length > 0;

  return (
    <div
      className="space-y-4 p-6 bg-card border border-border rounded-lg"
      data-testid="filter-panel"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            data-testid="clear-filters-button"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Text Search Input */}
      <div data-testid="text-search-container">
        <label
          htmlFor="text-search"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Search
        </label>
        <input
          id="text-search"
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Search title and content"
          className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          data-testid="text-search-input"
        />
      </div>

      {/* Date Range Picker */}
      <div data-testid="date-range-container">
        <p className="text-sm font-medium text-foreground mb-2">Date Range</p>
        <DateRangePicker
          dateStart={dateStart}
          dateEnd={dateEnd}
          onChange={handleDateRangeChange}
        />
      </div>

      {/* Tag Multi-Select */}
      <div data-testid="tag-filter-container">
        <TagMultiSelect
          availableTags={existingTags}
          selectedTags={selectedTags}
          onChange={handleTagsChange}
        />
      </div>

      {/* Surprise Button */}
      <button
        onClick={onSurpriseClick}
        disabled={surpriseDisabled}
        className={`w-full px-4 py-2 rounded-md font-medium text-sm transition-colors ${
          surpriseDisabled
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:opacity-90 active:opacity-100'
        }`}
        data-testid="surprise-button"
      >
        Surprise!
      </button>
    </div>
  );
};

export default FilterPanel;
