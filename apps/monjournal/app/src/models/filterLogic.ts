/**
 * Filter logic and utilities for searching and filtering thoughts
 * 
 * Supports filtering by:
 * - Text search (case-insensitive substring matching on title and content)
 * - Date range (between startDate and endDate timestamps)
 * - Tags (AND/OR logic selectable)
 * 
 * All filters are combined with AND logic (a thought must match all active filters).
 */

import { Thought } from './thoughtModel';

/**
 * Represents the current filter state
 * 
 * All fields are optional; undefined means that filter is not active.
 */
export interface FilterState {
  /** Text search query (matched case-insensitively against title and content) */
  text?: string;

  /** Start of date range (inclusive, in milliseconds since epoch) */
  dateStart?: number;

  /** End of date range (inclusive, in milliseconds since epoch) */
  dateEnd?: number;

  /** Array of selected tag names for filtering */
  selectedTags?: string[];

  /** Current view mode (list or timeline) */
  viewMode?: 'list' | 'timeline';
}

/**
 * Checks if a thought matches a text search query
 * 
 * Performs case-insensitive substring matching on both title and content.
 * 
 * @param thought - The thought to check
 * @param query - The search query (or undefined/empty to match all)
 * @returns true if the query is empty, undefined, or matches the thought
 */
export function matchesTextSearch(thought: Thought, query?: string): boolean {
  if (!query || query.trim().length === 0) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();
  const titleMatch = thought.title.toLowerCase().includes(normalizedQuery);
  const contentMatch = thought.content.toLowerCase().includes(normalizedQuery);

  return titleMatch || contentMatch;
}

/**
 * Checks if a thought's creation date falls within a date range
 * 
 * Both boundaries are inclusive. If either bound is undefined, that
 * direction is unbounded.
 * 
 * @param thought - The thought to check
 * @param startDate - Inclusive start of range (milliseconds, or undefined for unbounded)
 * @param endDate - Inclusive end of range (milliseconds, or undefined for unbounded)
 * @returns true if the thought's date is within the range
 */
export function matchesDateRange(
  thought: Thought,
  startDate?: number,
  endDate?: number
): boolean {
  if (startDate !== undefined && thought.createdAt < startDate) {
    return false;
  }

  if (endDate !== undefined && thought.createdAt > endDate) {
    return false;
  }

  return true;
}

/**
 * Checks if a thought's tags match selected tags
 * 
 * If selectedTags is empty or undefined, all thoughts match (filter inactive).
 * If selectedTags has items, a thought matches if it has at least one
 * of the selected tags (OR logic).
 * 
 * @param thought - The thought to check
 * @param selectedTags - Array of tag names to match against
 * @returns true if selectedTags is empty, undefined, or thought has at least one selected tag
 */
export function matchesTags(thought: Thought, selectedTags?: string[]): boolean {
  if (!selectedTags || selectedTags.length === 0) {
    return true;
  }

  const selectedTagsSet = new Set(selectedTags);

  // Check if thought has any of the selected tags
  if (Array.isArray(thought.tags)) {
    return thought.tags.some(tag => selectedTagsSet.has(tag));
  }

  return false;
}

/**
 * Applies all active filters to a thought
 * 
 * A thought is included in results only if it matches ALL active filters
 * (AND composition).
 * 
 * @param thought - The thought to evaluate
 * @param filters - The current filter state
 * @returns true if the thought matches all active filters
 */
export function matchesAllFilters(thought: Thought, filters: FilterState): boolean {
  // All filters must pass (AND logic)
  return (
    matchesTextSearch(thought, filters.text) &&
    matchesDateRange(thought, filters.dateStart, filters.dateEnd) &&
    matchesTags(thought, filters.selectedTags)
  );
}

/**
 * Applies filters to an array of thoughts
 * 
 * Returns a new array containing only thoughts that match all active filters.
 * If no filters are active, returns a copy of the input array.
 * 
 * The returned array maintains the original order from the input.
 * 
 * @param thoughts - Array of thoughts to filter
 * @param filters - The current filter state
 * @returns Array of matching thoughts (may be empty)
 */
export function applyFilters(thoughts: Thought[], filters: FilterState): Thought[] {
  return thoughts.filter(thought => matchesAllFilters(thought, filters));
}

/**
 * Counts how many thoughts match the current filters
 * 
 * @param thoughts - Array of thoughts to evaluate
 * @param filters - The current filter state
 * @returns Number of matching thoughts
 */
export function countMatches(thoughts: Thought[], filters: FilterState): number {
  return applyFilters(thoughts, filters).length;
}

/**
 * Checks if any filters are currently active
 * 
 * @param filters - The filter state to check
 * @returns true if any filter is set (has a non-empty/non-undefined value)
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return (
    (filters.text !== undefined && filters.text.trim().length > 0) ||
    filters.dateStart !== undefined ||
    filters.dateEnd !== undefined ||
    (Array.isArray(filters.selectedTags) && filters.selectedTags.length > 0)
  );
}

/**
 * Resets all filters to their default (inactive) state
 * 
 * @returns A new FilterState with all filters cleared
 */
export function resetFilters(): FilterState {
  return {
    text: undefined,
    dateStart: undefined,
    dateEnd: undefined,
    selectedTags: undefined,
    viewMode: 'list',
  };
}
