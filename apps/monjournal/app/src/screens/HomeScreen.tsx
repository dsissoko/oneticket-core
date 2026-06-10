import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useThoughtsContext } from '@/context/ThoughtsContext';
import { FilterPanel } from '@/components/FilterPanel';
import { ControlZone } from '@/components/ControlZone';
import { ThoughtList } from '@/components/ThoughtList';
import { TimelineView } from '@/components/TimelineView';
import { InlineAddThoughtForm } from '@/components/InlineAddThoughtForm';
import { applyFilters, FilterState } from '@/utils/filterLogic';

/**
 * HomeScreen Component
 *
 * Landing page of the application served at `/`.
 * Displays the list of thoughts with filtering, search, and view mode toggle.
 * All functionality on a single page with no separate routes needed.
 */
export function HomeScreen(): React.ReactElement {
  const { thoughts, addThought, getTags } = useThoughtsContext();
  const [filters, setFilters] = useState<FilterState>({
    textQuery: '',
    startDate: null,
    endDate: null,
    selectedTags: [],
  });
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [highlightedThoughtId, setHighlightedThoughtId] = useState<string | null>(null);
  const highlightedRef = useRef<HTMLDivElement>(null);

  // Apply filters to thoughts and sort by most recent first
  const filteredThoughts = useMemo(() => {
    return applyFilters(thoughts, filters)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [thoughts, filters]);

  // Handle filter changes from FilterPanel
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    // Clear highlight when filters change
    setHighlightedThoughtId(null);
  }, []);

  // Handle surprise button — select a random thought from filtered results
  const handleSurpriseClick = useCallback(() => {
    if (filteredThoughts.length === 0) {
      return;
    }
    const randomIndex = Math.floor(Math.random() * filteredThoughts.length);
    const randomThought = filteredThoughts[randomIndex];
    setHighlightedThoughtId(randomThought.id);
    // Scroll to highlighted thought
    setTimeout(() => {
      highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }, [filteredThoughts]);

  return (
    <div className="flex flex-col flex-grow bg-background text-foreground">
      {/* Main content container */}
      <div className="flex-1 px-4 py-6 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">MonJournal</h1>
          <p className="text-muted-foreground">Your personal thought journal</p>
        </div>

        {/* Inline Add Thought Form */}
        <div className="mb-8">
          <InlineAddThoughtForm 
            addThought={addThought}
            getAvailableTags={() => getTags().map((tag) => tag.name)}
            onThoughtAdded={() => {
              // Force refresh of the UI by resetting highlights
              // The addThought from useThoughts hook will trigger re-render
              setHighlightedThoughtId(null);
            }}
          />
        </div>

        {/* Control Zone (View Mode + Surprise) */}
        <div className="mb-6">
          <ControlZone
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onSurpriseClick={handleSurpriseClick}
            disableSurprise={filteredThoughts.length === 0}
          />
        </div>

        {/* Filter Panel */}
        <div className="mb-8">
          <FilterPanel
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Results Info */}
        <div className="mb-6 text-sm text-muted-foreground">
          Showing {filteredThoughts.length} thought{filteredThoughts.length !== 1 ? 's' : ''}
        </div>

        {/* Thought List or Timeline */}
        <div className="mb-8">
          {viewMode === 'list' ? (
            <ThoughtList
              thoughts={filteredThoughts}
              onSurpriseClick={handleSurpriseClick}
              highlightedThoughtId={highlightedThoughtId}
              highlightedRef={highlightedRef}
            />
          ) : (
            <TimelineView
              thoughts={filteredThoughts}
              onSurpriseClick={handleSurpriseClick}
              highlightedThoughtId={highlightedThoughtId}
              highlightedRef={highlightedRef}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
