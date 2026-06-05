import React, { useState, useRef } from 'react';
import { useThoughts } from '../hooks/useThoughts';
import { applyFilters, FilterState } from '../utils/filterLogic';
import { ControlZone } from '../components/ControlZone';
import { FilterPanel } from '../components/FilterPanel';
import { ThoughtList } from '../components/ThoughtList';
import { TimelineView } from '../components/TimelineView';

/**
 * Home page component that integrates useThoughts hook with display components.
 * Manages view mode state, filter state, and applies filtering in real-time.
 */
export function Home(): React.ReactElement {
  const { thoughts, getTags } = useThoughts();
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [filterState, setFilterState] = useState<FilterState>({
    textQuery: '',
    selectedTags: [],
    startDate: null,
    endDate: null,
  });
  const [highlightedThoughtId, setHighlightedThoughtId] = useState<string | null>(null);
  const highlightedRef = useRef<HTMLDivElement>(null);

  // Get all available tags
  const existingTags = getTags();

  // Apply filters to thoughts
  const filteredThoughts = applyFilters(thoughts, filterState);

  // Handle filter state change
  const handleFilterChange = (newFilterState: FilterState) => {
    setFilterState(newFilterState);
    // Clear highlight when filters change
    setHighlightedThoughtId(null);
  };

  // Handle surprise click - select random thought from filtered results
  const handleSurpriseClick = () => {
    if (filteredThoughts.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredThoughts.length);
    const selectedThought = filteredThoughts[randomIndex];
    setHighlightedThoughtId(selectedThought.id);

    // Scroll into view on next render
    setTimeout(() => {
      if (highlightedRef.current) {
        highlightedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>My Thoughts</h1>
      </div>

      <ControlZone
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSurpriseClick={handleSurpriseClick}
        disableSurprise={filteredThoughts.length === 0}
      />

      <FilterPanel
        existingTags={existingTags}
        onFilterChange={handleFilterChange}
      />

      <div className="home-content">
        {filteredThoughts.length === 0 ? (
          <div className="empty-state">
            <p>No thoughts match your filters. Try adjusting your search or date range.</p>
          </div>
        ) : viewMode === 'list' ? (
          <ThoughtList
            thoughts={filteredThoughts}
            highlightedThoughtId={highlightedThoughtId}
            highlightedRef={highlightedRef}
          />
        ) : (
          <TimelineView
            thoughts={filteredThoughts}
            highlightedThoughtId={highlightedThoughtId}
            highlightedRef={highlightedRef}
          />
        )}
      </div>
    </div>
  );
}
