import React, { useState } from 'react';
import { FilterState } from '../utils/filterLogic';
import { DateRangePicker } from './DateRangePicker';

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
}

/**
 * Unified filter UI container for text search, date range, and tag multi-select.
 * Manages local state for all filter fields and calls onFilterChange on each user interaction.
 * Displayed horizontally to minimize vertical space.
 */
export function FilterPanel({
  onFilterChange,
}: FilterPanelProps): React.ReactElement {
  const [textQuery, setTextQuery] = useState('');
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);

  // Helper to emit filter change
  const emitFilterChange = (newFilters: FilterState) => {
    onFilterChange(newFilters);
  };

  // Handle text query change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setTextQuery(newText);
    emitFilterChange({
      textQuery: newText,
      startDate,
      endDate,
      selectedTags: [],
    });
  };

  // Handle date range change
  const handleDateRangeChange = (newStart: number | null, newEnd: number | null) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    emitFilterChange({
      textQuery,
      startDate: newStart,
      endDate: newEnd,
      selectedTags: [],
    });
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    setTextQuery('');
    setStartDate(null);
    setEndDate(null);
    emitFilterChange({
      textQuery: '',
      startDate: null,
      endDate: null,
      selectedTags: [],
    });
  };

  return (
    <div className="filter-panel">
      <div className="filter-controls">
        <div className="filter-group filter-group-text">
          <input
            id="search-input"
            type="text"
            className="filter-input filter-input-text"
            placeholder="Search thoughts, tags..."
            value={textQuery}
            onChange={handleTextChange}
            aria-label="Search thoughts by title, content, or tags"
          />
        </div>

        <div className="filter-group">
          <DateRangePicker
            dateStart={startDate}
            dateEnd={endDate}
            onChange={handleDateRangeChange}
          />
        </div>

        {(textQuery || startDate || endDate) && (
          <button className="clear-button" onClick={handleClearFilters}>
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
