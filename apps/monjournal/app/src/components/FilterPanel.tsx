import React, { useState } from 'react';
import { Tag } from '../models/tagModel';
import DateRangePicker from './DateRangePicker';
import TagMultiSelect from './TagMultiSelect';
import { FilterState } from '../utils/filterLogic';

interface FilterPanelProps {
  existingTags: Tag[];
  onFilterChange: (filters: FilterState) => void;
  onSurpriseClick: () => void;
}

/**
 * FilterPanel component provides a unified UI for all filtering controls.
 * Manages local state for text search, date range, and tag selection.
 * Calls onFilterChange callback whenever any filter changes.
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({
  existingTags,
  onFilterChange,
  onSurpriseClick,
}) => {
  const [text, setText] = useState<string>('');
  const [dateStart, setDateStart] = useState<number | null>(null);
  const [dateEnd, setDateEnd] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Call onFilterChange whenever any filter state changes
  const handleTextChange = (newText: string) => {
    setText(newText);
    onFilterChange({
      text: newText,
      dateStart,
      dateEnd,
      selectedTags,
    });
  };

  const handleDateRangeChange = (newStart: number | null, newEnd: number | null) => {
    setDateStart(newStart);
    setDateEnd(newEnd);
    onFilterChange({
      text,
      dateStart: newStart,
      dateEnd: newEnd,
      selectedTags,
    });
  };

  const handleTagsChange = (newSelectedTags: string[]) => {
    setSelectedTags(newSelectedTags);
    onFilterChange({
      text,
      dateStart,
      dateEnd,
      selectedTags: newSelectedTags,
    });
  };

  const handleReset = () => {
    setText('');
    setDateStart(null);
    setDateEnd(null);
    setSelectedTags([]);
    onFilterChange({
      text: '',
      dateStart: null,
      dateEnd: null,
      selectedTags: [],
    });
  };

  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Text Search Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label
          htmlFor="search-input"
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          Search:
        </label>
        <input
          id="search-input"
          type="text"
          placeholder="Search title and content"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '0.875rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Date Range Picker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Date Range:</label>
        <DateRangePicker
          dateStart={dateStart}
          dateEnd={dateEnd}
          onChange={handleDateRangeChange}
        />
      </div>

      {/* Tag Multi-Select */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Tags:</label>
        <TagMultiSelect
          availableTags={existingTags}
          selectedTags={selectedTags}
          onChange={handleTagsChange}
        />
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={onSurpriseClick}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#0056b3';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#007bff';
          }}
        >
          Surprise!
        </button>

        <button
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#5a6268';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#6c757d';
          }}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
