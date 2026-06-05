import { Thought } from '../models/thoughtModel';

/**
 * Represents the current filter state for thoughts.
 * All properties are optional; if not set, that filter is inactive.
 */
export interface FilterState {
  /**
   * Text search query. Matches against thought title or content (case-insensitive substring).
   * If undefined or empty, text filter is inactive.
   */
  text?: string;

  /**
   * Start of date range filter (timestamp in milliseconds).
   * If null or undefined, no start date constraint.
   * Matches thoughts with `createdAt >= dateStart` (inclusive).
   */
  dateStart?: number | null;

  /**
   * End of date range filter (timestamp in milliseconds).
   * If null or undefined, no end date constraint.
   * Matches thoughts with `createdAt <= dateEnd` (inclusive).
   */
  dateEnd?: number | null;

  /**
   * Array of selected tag names to filter by.
   * If undefined or empty, tag filter is inactive.
   * Uses OR logic: a thought matches if it has at least one of the selected tags.
   */
  selectedTags?: string[];
}

/**
 * Applies all active filters to a thought array.
 * Combines multiple filters with AND logic: a thought must pass all active filters to be included.
 *
 * @param thoughts - Array of thoughts to filter
 * @param filters - FilterState object with optional filter criteria
 * @returns Filtered array of thoughts that match all active filters
 *
 * @example
 * const thoughts = [
 *   { id: '1', title: 'Work', content: 'Meeting notes', createdAt: 1717459200000, tags: ['work'] },
 *   { id: '2', title: 'Personal', content: 'Reflections', createdAt: 1717545600000, tags: ['personal'] },
 * ];
 * const filters = { text: 'work', selectedTags: ['work'] };
 * applyFilters(thoughts, filters); // Returns only the first thought
 */
export function applyFilters(thoughts: Thought[], filters: FilterState): Thought[] {
  return thoughts.filter((thought) => {
    // Text search filter (AND with other filters)
    if (filters.text && !matchesTextSearch(thought, filters.text)) {
      return false;
    }

    // Date range filter (AND with other filters)
    if (!matchesDateRange(thought, filters.dateStart ?? null, filters.dateEnd ?? null)) {
      return false;
    }

    // Tag filter (AND with other filters)
    if (filters.selectedTags && filters.selectedTags.length > 0) {
      if (!matchesTags(thought, filters.selectedTags)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Checks if a thought matches a text search query.
 * Performs case-insensitive substring matching on both title and content.
 * A thought matches if the query appears in either the title OR the content.
 *
 * @param thought - The thought to check
 * @param query - The search query string (case-insensitive)
 * @returns `true` if the query matches title or content, `false` otherwise
 *
 * @example
 * const thought = { id: '1', title: 'Morning Run', content: 'Had a great run today', createdAt: 123, tags: [] };
 * matchesTextSearch(thought, 'run');     // Returns true (matches both title and content)
 * matchesTextSearch(thought, 'MORNING'); // Returns true (case-insensitive)
 * matchesTextSearch(thought, 'swim');    // Returns false
 */
export function matchesTextSearch(thought: Thought, query: string): boolean {
  if (!query || query.trim() === '') {
    return true;
  }

  const lowerQuery = query.toLowerCase();
  const lowerTitle = thought.title.toLowerCase();
  const lowerContent = thought.content.toLowerCase();

  return lowerTitle.includes(lowerQuery) || lowerContent.includes(lowerQuery);
}

/**
 * Checks if a thought falls within a date range.
 * Supports inclusive bounds: `start <= createdAt <= end`.
 *
 * @param thought - The thought to check
 * @param start - Start of date range (timestamp in ms), or null for no start constraint
 * @param end - End of date range (timestamp in ms), or null for no end constraint
 * @returns `true` if the thought's createdAt is within bounds, `false` otherwise
 *
 * @example
 * const thought = { id: '1', title: 'Test', content: 'Test', createdAt: 1717459200000, tags: [] };
 * matchesDateRange(thought, 1717459200000, 1717545600000); // Returns true (within range)
 * matchesDateRange(thought, 1717545600000, 1717632000000); // Returns false (after range)
 * matchesDateRange(thought, null, 1717545600000);          // Returns true (only end constraint)
 * matchesDateRange(thought, null, null);                   // Returns true (no constraints)
 */
export function matchesDateRange(
  thought: Thought,
  start: number | null,
  end: number | null
): boolean {
  if (start !== null && thought.createdAt < start) {
    return false;
  }

  if (end !== null && thought.createdAt > end) {
    return false;
  }

  return true;
}

/**
 * Checks if a thought has at least one tag from a selected list.
 * Uses OR logic: the thought matches if it contains ANY of the selected tags.
 *
 * @param thought - The thought to check
 * @param selectedTags - Array of tag names to search for (case-sensitive)
 * @returns `true` if thought has at least one matching tag, `false` otherwise
 *
 * @example
 * const thought = { id: '1', title: 'Test', content: 'Test', createdAt: 123, tags: ['work', 'urgent'] };
 * matchesTags(thought, ['work']);                    // Returns true
 * matchesTags(thought, ['work', 'personal']);        // Returns true
 * matchesTags(thought, ['personal']);                // Returns false
 * matchesTags(thought, []);                          // Returns false
 */
export function matchesTags(thought: Thought, selectedTags: string[]): boolean {
  if (!selectedTags || selectedTags.length === 0) {
    return false;
  }

  return thought.tags.some((tag) => selectedTags.includes(tag));
}
