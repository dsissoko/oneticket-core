/**
 * Filter Logic Utilities
 * Composable filtering functions for thoughts
 * Supports text search, date range, and tag filtering
 */

import { Thought, FilterState } from '../models/types';

/**
 * Checks if a thought matches a text search query
 * Case-insensitive substring matching on title and content
 * @param thought - Thought to check
 * @param query - Search query
 * @returns true if thought matches query
 */
export const matchesTextSearch = (thought: Thought, query: string): boolean => {
  if (!query || query.trim().length === 0) {
    return true;
  }
  const lowerQuery = query.toLowerCase();
  const titleMatch = thought.title.toLowerCase().includes(lowerQuery);
  const contentMatch = thought.content.toLowerCase().includes(lowerQuery);
  return titleMatch || contentMatch;
};

/**
 * Checks if a thought's creation date falls within a range
 * Date range is inclusive (>= start and <= end)
 * @param thought - Thought to check
 * @param start - Start date (timestamp in ms) or null
 * @param end - End date (timestamp in ms) or null
 * @returns true if thought falls within range
 */
export const matchesDateRange = (
  thought: Thought,
  start: number | null | undefined,
  end: number | null | undefined
): boolean => {
  if (start !== null && start !== undefined) {
    if (thought.createdAt < start) {
      return false;
    }
  }
  if (end !== null && end !== undefined) {
    if (thought.createdAt > end) {
      return false;
    }
  }
  return true;
};

/**
 * Checks if a thought has at least one of the selected tags
 * @param thought - Thought to check
 * @param selectedTags - Array of tag names to match
 * @returns true if thought has any matching tag
 */
export const matchesTags = (
  thought: Thought,
  selectedTags: string[] | undefined
): boolean => {
  if (!selectedTags || selectedTags.length === 0) {
    return true;
  }
  return selectedTags.some((tag) => thought.tags.includes(tag));
};

/**
 * Applies all filters to an array of thoughts
 * Combines filters with AND logic: all active filters must pass
 * @param thoughts - Array of thoughts to filter
 * @param filters - Filter criteria
 * @returns Filtered array of thoughts
 */
export const applyFilters = (
  thoughts: Thought[],
  filters: FilterState
): Thought[] => {
  return thoughts.filter((thought) => {
    // Apply each filter
    if (!matchesTextSearch(thought, filters.text || '')) {
      return false;
    }
    if (!matchesDateRange(thought, filters.dateStart, filters.dateEnd)) {
      return false;
    }
    if (!matchesTags(thought, filters.selectedTags)) {
      return false;
    }
    return true;
  });
};
