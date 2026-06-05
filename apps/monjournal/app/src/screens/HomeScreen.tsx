import React, { useState, useRef } from 'react';
import { Thought, FilterState } from '../models/types';
import { useThoughts } from '../hooks/useThoughts';
import { applyFilters } from '../utils/filterLogic';
import { FilterPanel } from '../components/FilterPanel';
import { ViewModeToggle } from '../components/ViewModeToggle';
import { ThoughtList } from '../components/ThoughtList';
import { TimelineView } from '../components/TimelineView';

/**
 * HomeScreen Component
 *
 * Main thoughts display and filtering interface of MonJournal.
 * - Manages filter state locally with useState
 * - Fetches thoughts using useThoughts hook
 * - Applies filters in real-time as user interacts with FilterPanel
 * - Supports list and timeline view modes
 * - Handles surprise button for random thought selection
 */
export function HomeScreen(): React.ReactElement {
  // Data and hooks
  const { thoughts, getTags } = useThoughts();

  // Filter state management
  const [filterState, setFilterState] = useState<FilterState>({});
  
  // View mode toggle
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  // Highlight state for surprise button
  const [highlightedThoughtId, setHighlightedThoughtId] = useState<string | null>(null);
  const highlightedRef = useRef<HTMLDivElement>(null);

  // Get all available tags
  const existingTags = getTags();

  // Apply filters to thoughts
  const filteredThoughts = applyFilters(thoughts, filterState);

  /**
   * Handles filter state changes from FilterPanel
   * Updates filterState and clears highlight when filters change
   */
  const handleFilterChange = (newFilters: FilterState) => {
    setFilterState(newFilters);
    setHighlightedThoughtId(null); // Clear highlight when filters change
  };

  /**
   * Handles surprise button click
   * Selects random thought from filtered results and highlights it
   */
  const handleSurpriseClick = () => {
    if (filteredThoughts.length === 0) {
      return;
    }

    // Select random thought from filtered results
    const randomIndex = Math.floor(Math.random() * filteredThoughts.length);
    const selectedThought = filteredThoughts[randomIndex];

    // Highlight the selected thought
    setHighlightedThoughtId(selectedThought.id);

    // Scroll into view after a short delay to ensure DOM is updated
    setTimeout(() => {
      highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  };

  /**
   * Wrapper to pass highlight info to thought list/timeline
   */
  const handleThoughtHighlight = (thought: Thought) => {
    setHighlightedThoughtId(thought.id);
    // Scroll into view
    setTimeout(() => {
      highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  };

  // Empty state for no thoughts
  if (thoughts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow bg-background text-foreground py-12 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Welcome to MonJournal</h1>
          <p className="text-muted-foreground text-lg">
            Start journaling by adding your first thought.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow bg-background text-foreground">
      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Thoughts</h1>
            <p className="text-muted-foreground">
              {filteredThoughts.length} of {thoughts.length} thought
              {filteredThoughts.length === 1 ? '' : 's'}
            </p>
          </div>

          {/* Main layout: Filter panel and content */}
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Filter Panel - Sidebar */}
            <div className="lg:col-span-1">
              <FilterPanel
                existingTags={existingTags}
                onFilterChange={handleFilterChange}
                onSurpriseClick={handleSurpriseClick}
                surpriseDisabled={filteredThoughts.length === 0}
              />
            </div>

            {/* Content - List/Timeline View */}
            <div className="lg:col-span-3 space-y-6">
              {/* View Mode Toggle */}
              <ViewModeToggle
                currentMode={viewMode}
                onChange={setViewMode}
              />

              {/* Empty state for no matching filters */}
              {filteredThoughts.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  data-testid="no-thoughts-match"
                >
                  <p className="text-muted-foreground text-lg mb-2">
                    No thoughts match your filters.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Try adjusting your search or date range.
                  </p>
                </div>
              ) : (
                <>
                  {/* List View */}
                  {viewMode === 'list' && (
                    <div ref={highlightedRef}>
                      <ThoughtList
                        thoughts={filteredThoughts}
                        onSurpriseClick={handleThoughtHighlight}
                      />
                    </div>
                  )}

                  {/* Timeline View */}
                  {viewMode === 'timeline' && (
                    <div ref={highlightedRef}>
                      <TimelineView
                        thoughts={filteredThoughts}
                        onSurpriseClick={handleThoughtHighlight}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
