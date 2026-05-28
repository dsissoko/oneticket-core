/**
 * Hook: useTimelineSort
 *
 * Manages chronological sorting and date filtering of journal entries.
 * Supports descending (newest first) and ascending (oldest first) sort orders.
 * Handles single-date filtering with localStorage persistence for sort preference.
 *
 * Performance target: < 50ms for typical use cases (< 1000 entries).
 */

import { useMemo, useState } from 'react';
import type { JournalEntry } from '../domain/Entry';

const SORT_ORDER_STORAGE_KEY = 'journal_sort_order';

export type SortOrder = 'desc' | 'asc';

/**
 * State and actions returned by useTimelineSort hook
 */
export interface UseTimelineSortState {
  displayEntries: JournalEntry[];           // Sorted and filtered entries
  sortOrder: SortOrder;                     // Current sort order
  setSortOrder: (order: SortOrder) => void;
  filterByDate: (date: string) => void;    // Filter entries to single date
  clearDateFilter: () => void;              // Show all entries
  dateFilter: string | null;                // Current date filter or null
}

/**
 * Helper function to group entries by date
 * Returns a Map with date as key and array of entries for that date as value
 */
function groupEntriesByDate(entries: JournalEntry[]): Map<string, JournalEntry[]> {
  const grouped = new Map<string, JournalEntry[]>();

  for (const entry of entries) {
    const date = entry.date;
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(entry);
  }

  // Sort entries within each date by createdAt (earliest first)
  for (const dateEntries of grouped.values()) {
    dateEntries.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  return grouped;
}

/**
 * Helper function to get sorted date keys
 */
function getSortedDateKeys(grouped: Map<string, JournalEntry[]>, sortOrder: SortOrder): string[] {
  const dates = Array.from(grouped.keys()).sort();
  return sortOrder === 'desc' ? dates.reverse() : dates;
}

/**
 * Hook to manage timeline entry sorting and filtering
 *
 * @param entries - Array of journal entries to sort and filter
 * @returns Object containing sorted entries, sort controls, and filter controls
 *
 * @example
 * const { displayEntries, sortOrder, setSortOrder, filterByDate, clearDateFilter, dateFilter } = useTimelineSort(entries);
 *
 * // Display all entries sorted by date
 * entries.map(e => <TimelineItem key={e.id} entry={e} />)
 *
 * // Change sort order
 * setSortOrder('asc');
 *
 * // Filter to single date
 * filterByDate('2026-05-25');
 *
 * // Clear filter
 * clearDateFilter();
 */
export function useTimelineSort(entries: JournalEntry[]): UseTimelineSortState {
  // Initialize sort order from localStorage or default to 'desc'
  const [sortOrder, setSortOrderState] = useState<SortOrder>(() => {
    if (typeof window === 'undefined') {
      return 'desc';
    }

    try {
      const stored = localStorage.getItem(SORT_ORDER_STORAGE_KEY);
      return (stored === 'asc' || stored === 'desc') ? stored : 'desc';
    } catch {
      // Fallback if localStorage is unavailable
      return 'desc';
    }
  });

  const [dateFilter, setDateFilter] = useState<string | null>(null);

  // Handler to set sort order and persist to localStorage
  const handleSetSortOrder = (order: SortOrder) => {
    setSortOrderState(order);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SORT_ORDER_STORAGE_KEY, order);
      } catch {
        // Silently fail if localStorage is unavailable
        console.warn('[useTimelineSort] Failed to persist sort order to localStorage');
      }
    }
  };

  // Compute sorted and filtered entries using useMemo to avoid unnecessary recalculations
  const displayEntries = useMemo(() => {
    const startTime = performance.now();

    // Group entries by date
    const grouped = groupEntriesByDate(entries);

    // Get sorted date keys
    const sortedDates = getSortedDateKeys(grouped, sortOrder);

    // Flatten back into array, in sorted date order
    let result: JournalEntry[] = [];
    for (const date of sortedDates) {
      const dateEntries = grouped.get(date);
      if (dateEntries) {
        result = result.concat(dateEntries);
      }
    }

    // Apply date filter if set
    if (dateFilter) {
      result = result.filter(entry => entry.date === dateFilter);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Log performance metric
    if (typeof window !== 'undefined' && window.performance) {
      console.debug(
        `[useTimelineSort] Sorted ${entries.length} entries${dateFilter ? ` (filtered to ${dateFilter})` : ''} in ${duration.toFixed(2)}ms`,
      );
    }

    return result;
  }, [entries, sortOrder, dateFilter]);

  return {
    displayEntries,
    sortOrder,
    setSortOrder: handleSetSortOrder,
    filterByDate: setDateFilter,
    clearDateFilter: () => setDateFilter(null),
    dateFilter,
  };
}
