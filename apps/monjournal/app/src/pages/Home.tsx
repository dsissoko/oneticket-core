/**
 * Home Page Component
 *
 * Main page for MonJournal that orchestrates the complete thought viewing experience.
 * Integrates:
 * - useThoughts hook to fetch all thoughts (task B)
 * - Filter state management (task A)
 * - View mode toggle (task H)
 * - FilterPanel for filtering controls (slice 3)
 * - ThoughtList and TimelineView display components (slice 2)
 *
 * Responsibilities:
 * 1. Initialize and manage filter state
 * 2. Initialize and manage view mode state (list vs timeline)
 * 3. Apply filters to thoughts
 * 4. Handle surprise click to select random thought
 * 5. Render all components in correct layout
 */

import React, { useState, useMemo } from 'react';
import { useThoughts } from '../hooks/useThoughts';
import { applyFilters } from '../utils/filterLogic';
import { FilterState, Thought } from '../models/types';
import FilterPanel from '../components/FilterPanel';
import { ViewModeToggle } from '../components/ViewModeToggle';
import ThoughtList from '../components/ThoughtList';
import TimelineView from '../components/TimelineView';

/**
 * Home page component
 * Renders the complete thought viewing and filtering interface
 * 
 * @example
 * <Home />
 */
export function Home(): React.ReactElement {
  // Initialize useThoughts hook to fetch all thoughts
  const { thoughts, getTags } = useThoughts();

  // Initialize view mode state: 'list' or 'timeline'
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  // Initialize filter state with empty default (no filters applied)
  const [filterState, setFilterState] = useState<FilterState>({});

  // Track highlighted thought from surprise feature (for visual feedback)
  const [_highlightedThoughtId, setHighlightedThoughtId] = useState<string | null>(null);

  // Get all available tags derived from current thoughts
  const existingTags = getTags();

  // Apply filters to thoughts with memoization to avoid recalculation on every render
  const filteredThoughts = useMemo(() => {
    return applyFilters(thoughts, filterState);
  }, [thoughts, filterState]);

  /**
   * Handler for view mode change
   * Updates viewMode state when user toggles between list and timeline
   */
  const handleViewModeChange = (mode: 'list' | 'timeline'): void => {
    setViewMode(mode);
  };

  /**
   * Handler for filter change
   * Called by FilterPanel when any filter is updated
   * Updates filterState to apply filters in real-time
   */
  const handleFilterChange = (filters: FilterState): void => {
    setFilterState(filters);
    // Clear highlight when filters change
    setHighlightedThoughtId(null);
  };

  /**
   * Handler for surprise click
   * Selects a random thought from filtered results
   * Highlights it for visual feedback
   */
  const handleSurpriseClick = (): void => {
    if (filteredThoughts.length === 0) {
      return;
    }

    // Calculate random index: Math.floor(Math.random() * filteredThoughts.length)
    const randomIndex = Math.floor(Math.random() * filteredThoughts.length);
    const selectedThought = filteredThoughts[randomIndex];

    // Set highlight state for visual feedback
    setHighlightedThoughtId(selectedThought.id);

    // Scroll the highlighted thought into view (smooth scroll)
    // Implementation TBD in slice 3 with focus management
    setTimeout(() => {
      const element = document.getElementById(`thought-${selectedThought.id}`);
      if (element) {
        // Check if scrollIntoView is available (not available in jsdom test environment)
        if (typeof element.scrollIntoView === 'function') {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        element.focus();
      }
    }, 0);
  };

  /**
   * Handler to pass to ThoughtList/TimelineView for surprise feature
   * When a thought is highlighted from surprise, we can accept it
   */
  const handleThoughtHighlight = (thought: Thought): void => {
    setHighlightedThoughtId(thought.id);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground">
      {/* Main container with responsive layout */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Filter Panel - always visible at top */}
        <div className="flex-shrink-0 border-b border-border px-4 py-4">
          <FilterPanel
            existingTags={existingTags}
            onFilterChange={handleFilterChange}
            onSurpriseClick={handleSurpriseClick}
            surpriseDisabled={filteredThoughts.length === 0}
          />
        </div>

        {/* View Mode Toggle + Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* View Mode Toggle Control */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredThoughts.length} thought{filteredThoughts.length !== 1 ? 's' : ''}
            </div>
            <ViewModeToggle
              currentMode={viewMode}
              onChange={handleViewModeChange}
            />
          </div>

          {/* Scrollable Content Area - renders active view */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === 'list' ? (
              <ThoughtList
                thoughts={filteredThoughts}
                onSurpriseClick={handleThoughtHighlight}
              />
            ) : (
              <TimelineView
                thoughts={filteredThoughts}
                onSurpriseClick={handleThoughtHighlight}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
