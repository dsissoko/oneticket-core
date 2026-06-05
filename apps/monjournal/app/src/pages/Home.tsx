import React, { useState } from 'react';
import { useThoughts } from '../hooks/useThoughts';
import { applyFilters, FilterState } from '../utils/filterLogic';
import { ViewModeToggle } from '../components/ViewModeToggle';
import { ThoughtList } from '../components/ThoughtList';
import { TimelineView } from '../components/TimelineView';

/**
 * Home page component that integrates useThoughts hook with display components.
 * Manages view mode state and applies filtering.
 */
export function Home(): React.ReactElement {
  const { thoughts } = useThoughts();
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [filterState] = useState<FilterState>({
    textQuery: '',
    selectedTags: [],
    startDate: null,
    endDate: null,
  });

  // Apply filters to thoughts
  const filteredThoughts = applyFilters(thoughts, filterState);

  // Handle surprise click (for future surprise feature)
  const handleSurpriseClick = (thought: any) => {
    console.log('Surprise clicked for thought:', thought.id);
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>My Thoughts</h1>
        <ViewModeToggle currentMode={viewMode} onChange={setViewMode} />
      </div>

      <div className="home-content">
        {viewMode === 'list' ? (
          <ThoughtList
            thoughts={filteredThoughts}
            onSurpriseClick={handleSurpriseClick}
          />
        ) : (
          <TimelineView
            thoughts={filteredThoughts}
            onSurpriseClick={handleSurpriseClick}
          />
        )}
      </div>
    </div>
  );
}
