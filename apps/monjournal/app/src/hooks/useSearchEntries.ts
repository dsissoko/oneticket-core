/**
 * Hook: useSearchEntries
 *
 * Manages search state for journal entries with date range filtering.
 * Integrates with SearchService for filtering and useJournalEntries for data access.
 * Returns results sorted according to the user's timeline sort preference.
 *
 * Performance target: < 100ms for typical use cases (< 1000 entries).
 */

import { useState, useCallback } from 'react';
import type { JournalEntry } from '../domain/Entry';
import {
  filterByDateRange,
  type SearchCriteria,
  SearchValidationError,
} from '../domain/SearchService';
import { useJournalEntries } from './useJournalEntries';
import { useTimelineSort } from './useTimelineSort';

/**
 * State returned by useSearchEntries hook
 */
export interface UseSearchEntriesState {
  results: JournalEntry[];           // Filtered and sorted search results
  search: (criteria: SearchCriteria) => Promise<void>;  // Trigger search
  isSearching: boolean;              // Loading state during search
  error: Error | null;               // Error from search or validation
  clearSearch: () => void;           // Clear search state and show all entries
}

/**
 * Hook to manage search functionality for journal entries
 *
 * Uses SearchService to filter by date range and applies the user's
 * preferred timeline sort order (newest or oldest first).
 *
 * @returns Object containing results, search function, loading state, error, and clear function
 *
 * @example
 * const { results, search, isSearching, error, clearSearch } = useSearchEntries();
 *
 * // Trigger search
 * await search({ startDate: '2026-05-20', endDate: '2026-05-30' });
 *
 * // Display results
 * results.map(entry => <TimelineItem key={entry.id} entry={entry} />)
 *
 * // Clear search to show all entries
 * clearSearch();
 */
export function useSearchEntries(): UseSearchEntriesState {
  const [searchResults, setSearchResults] = useState<JournalEntry[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

  // Fetch all entries from storage
  const { entries: allEntries, error: entriesError } = useJournalEntries();

  // Get timeline sort preferences
  const { displayEntries: sortedSearchResults, sortOrder } = useTimelineSort(searchResults);

  /**
   * Execute search with given criteria
   * Validates input, filters entries, and updates state
   */
  const handleSearch = useCallback(
    async (criteria: SearchCriteria): Promise<void> => {
      const startTime = performance.now();

      try {
        setIsSearching(true);
        setError(null);

        // If entries are still loading, wait or return empty
        if (allEntries.length === 0 && entriesError) {
          const error = new Error('Failed to load entries for search');
          setError(error);
          setSearchResults([]);
          return;
        }

        // Perform filtering using domain service
        // filterByDateRange validates criteria and throws SearchValidationError if invalid
        const filtered = filterByDateRange(
          allEntries,
          criteria.startDate,
          criteria.endDate,
        );

        // Update results state
        setSearchResults(filtered);
        setIsSearchActive(true);

        const endTime = performance.now();
        const duration = endTime - startTime;

        // Log performance metric
        if (typeof window !== 'undefined' && window.performance) {
          console.debug(
            `[useSearchEntries] Searched ${allEntries.length} entries, found ${filtered.length} results in ${duration.toFixed(2)}ms`,
          );
        }

        // Warn if search takes too long (performance regression)
        if (duration > 100) {
          console.warn(
            `[useSearchEntries] Search took ${duration.toFixed(2)}ms (target: <100ms)`,
          );
        }
      } catch (err) {
        // Handle validation errors from SearchService or unexpected errors
        const error =
          err instanceof SearchValidationError
            ? err
            : err instanceof Error
              ? err
              : new Error(String(err));

        setError(error);
        setSearchResults([]);
        setIsSearchActive(false);
        console.error('[useSearchEntries] Search error:', error);
      } finally {
        setIsSearching(false);
      }
    },
    [allEntries, entriesError],
  );

  /**
   * Clear search state and return to viewing all entries
   */
  const handleClearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
    setIsSearchActive(false);
  }, []);

  return {
    results: sortedSearchResults,
    search: handleSearch,
    isSearching,
    error,
    clearSearch: handleClearSearch,
  };
}
