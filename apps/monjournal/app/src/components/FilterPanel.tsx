import React, { useState } from 'react';
import { Tag } from '../models/tagModel';
import { FilterState } from '../utils/filterLogic';
import { DateRangePicker } from './DateRangePicker';
import { TagMultiSelect } from './TagMultiSelect';

interface FilterPanelProps {
  existingTags: Tag[];
  onFilterChange: (filters: FilterState) => void;
  onSurpriseClick: () => void;
  disableSurprise?: boolean;
}

/**
 * Unified filter UI container for text search, date range, tag multi-select, and surprise button.
 * Manages local state for all filter fields and calls onFilterChange on each user interaction.
 */
export function FilterPanel({
  existingTags,
  onFilterChange,
  onSurpriseClick,
  disableSurprise = false,
}: FilterPanelProps): React.ReactElement {
  const [textQuery, setTextQuery] = useState('');
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
      selectedTags,
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
      selectedTags,
    });
  };

  // Handle selected tags change
  const handleTagsChange = (newSelectedTags: string[]) => {
    setSelectedTags(newSelectedTags);
    emitFilterChange({
      textQuery,
      startDate,
      endDate,
      selectedTags: newSelectedTags,
    });
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    setTextQuery('');
    setStartDate(null);
    setEndDate(null);
    setSelectedTags([]);
    emitFilterChange({
      textQuery: '',
      startDate: null,
      endDate: null,
      selectedTags: [],
    });
  };

  return (
    <div className="filter-panel">
      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="search-input" className="filter-label">
            Search
          </label>
          <input
            id="search-input"
            type="text"
            className="filter-input"
            placeholder="Search title and content"
            value={textQuery}
            onChange={handleTextChange}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Date Range</label>
          <DateRangePicker
            dateStart={startDate}
            dateEnd={endDate}
            onChange={handleDateRangeChange}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Tags</label>
          <TagMultiSelect
            availableTags={existingTags}
            selectedTags={selectedTags}
            onChange={handleTagsChange}
          />
        </div>

        <div className="filter-buttons">
          <button
            className="surprise-button"
            onClick={onSurpriseClick}
            disabled={disableSurprise}
            title={disableSurprise ? 'No thoughts match current filters' : 'Select random thought'}
          >
            Surprise!
          </button>
          {(textQuery || startDate || endDate || selectedTags.length > 0) && (
            <button className="clear-button" onClick={handleClearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
