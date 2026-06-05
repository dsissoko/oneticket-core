/**
 * FilterPanel component — unified filter UI for thoughts
 * Manages text search, date range, tag selection, and surprise filter
 * Orchestrates all filter state and callbacks
 */

import React, { useState, useCallback } from 'react';
import { Tag, FilterState } from '../models/types';
import DateRangePicker from './DateRangePicker';
import TagMultiSelect from './TagMultiSelect';

export interface FilterPanelProps {
  /** Array of all available tags (from useThoughts().getTags()) */
  existingTags: readonly Tag[];
  /** Callback when filter state changes */
  onFilterChange: (filters: FilterState) => void;
  /** Callback when "Surprise!" button is clicked */
  onSurpriseClick: () => void;
  /** Whether the surprise button should be disabled (no results available) */
  surpriseDisabled?: boolean;
}

/**
 * FilterPanel component
 * Renders complete filter UI with text input, date range picker, tag selector, and buttons
 * Manages local state for all filter fields
 * Calls onFilterChange on each field change
 *
 * @example
 * <FilterPanel
 *   existingTags={tags}
 *   onFilterChange={(filters) => setFilterState(filters)}
 *   onSurpriseClick={() => handleSurprise()}
 *   surpriseDisabled={filteredThoughts.length === 0}
 * />
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

  // Emit filter change when any field updates
  const emitFilterChange = useCallback(
    (updatedText: string, updatedStart: number | null, updatedEnd: number | null, updatedTags: string[]) => {
      const newFilterState: Record<string, any> = {};
      if (updatedText) newFilterState.text = updatedText;
      if (updatedStart !== null) newFilterState.dateStart = updatedStart;
      if (updatedEnd !== null) newFilterState.dateEnd = updatedEnd;
      if (updatedTags.length > 0) newFilterState.selectedTags = updatedTags;
      onFilterChange(newFilterState as FilterState);
    },
    [onFilterChange]
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newText = e.target.value;
    setText(newText);
    emitFilterChange(newText, dateStart, dateEnd, selectedTags);
  };

  const handleDateChange = (start: number | null, end: number | null): void => {
    setDateStart(start);
    setDateEnd(end);
    emitFilterChange(text, start, end, selectedTags);
  };

  const handleTagChange = (newTags: string[]): void => {
    setSelectedTags(newTags);
    emitFilterChange(text, dateStart, dateEnd, newTags);
  };

  const handleClearFilters = (): void => {
    setText('');
    setDateStart(null);
    setDateEnd(null);
    setSelectedTags([]);
    onFilterChange({});
  };

  return (
    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Filter Thoughts</h2>
        <p className="text-sm text-gray-600 mt-1">Search and refine your journal entries</p>
      </div>

      {/* Text Search Input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="search-input" className="text-sm font-medium text-gray-900">
          Search:
        </label>
        <input
          id="search-input"
          type="text"
          placeholder="Search title and content"
          value={text}
          onChange={handleTextChange}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Date Range Picker */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-900">Date Range:</label>
        <DateRangePicker
          dateStart={dateStart}
          dateEnd={dateEnd}
          onChange={handleDateChange}
        />
      </div>

      {/* Tag Multi-Select */}
      <div>
        <TagMultiSelect
          availableTags={existingTags}
          selectedTags={selectedTags}
          onChange={handleTagChange}
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={onSurpriseClick}
          disabled={surpriseDisabled}
          className={`
            px-4 py-2 rounded-md font-medium text-sm transition-all duration-150
            ${
              surpriseDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            }
          `}
          title={surpriseDisabled ? 'No results to choose from' : 'Show a random thought from results'}
        >
          Surprise!
        </button>

        <button
          onClick={handleClearFilters}
          className="px-4 py-2 rounded-md font-medium text-sm border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-150"
          title="Reset all filters to default state"
        >
          Clear Filters
        </button>
      </div>

      {/* Filter Summary */}
      {(text || dateStart !== null || dateEnd !== null || selectedTags.length > 0) && (
        <div className="pt-2 border-t border-gray-200 text-xs text-gray-600">
          {text && <div>• Searching for: <span className="font-medium">"{text}"</span></div>}
          {(dateStart !== null || dateEnd !== null) && (
            <div>
              • Date range:{' '}
              <span className="font-medium">
                {dateStart ? new Date(dateStart).toLocaleDateString() : 'any'} to{' '}
                {dateEnd ? new Date(dateEnd).toLocaleDateString() : 'any'}
              </span>
            </div>
          )}
          {selectedTags.length > 0 && (
            <div>
              • Tags: <span className="font-medium">{selectedTags.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
