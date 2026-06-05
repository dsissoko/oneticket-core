import { Thought } from '../models/thoughtModel';

export interface FilterState {
  textQuery: string;
  startDate: number | null;
  endDate: number | null;
  selectedTags: string[];
}

/**
 * Checks if a thought's title, content, or tags contain the search query (case-insensitive).
 */
export function matchesTextSearch(thought: Thought, query: string): boolean {
  if (!query || query.trim() === '') {
    return true;
  }
  const lowerQuery = query.toLowerCase();
  const lowerTitle = thought.title.toLowerCase();
  const lowerContent = thought.content.toLowerCase();
  const matchesTitleOrContent = lowerTitle.includes(lowerQuery) || lowerContent.includes(lowerQuery);
  const matchesTags = thought.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));
  return matchesTitleOrContent || matchesTags;
}

/**
 * Checks if a thought's createdAt is within the given date range (inclusive).
 * null values mean no boundary in that direction.
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
 * Checks if the thought has at least one tag from the selectedTags list.
 * If selectedTags is empty, returns true (no tag filter applied).
 */
export function matchesTags(thought: Thought, selectedTags: string[]): boolean {
  if (selectedTags.length === 0) {
    return true;
  }
  return thought.tags.some((tag) => selectedTags.includes(tag));
}

/**
 * Applies all filters to a list of thoughts using AND logic.
 * Returns thoughts that match all active filters.
 */
export function applyFilters(
  thoughts: Thought[],
  filters: FilterState
): Thought[] {
  return thoughts.filter((thought) => {
    return (
      matchesTextSearch(thought, filters.textQuery) &&
      matchesDateRange(thought, filters.startDate, filters.endDate) &&
      matchesTags(thought, filters.selectedTags)
    );
  });
}
