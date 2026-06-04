/**
 * Filter logic utilities for MonJournal
 * Provides filtering capabilities for thoughts based on text search, date range, and tags
 */

/**
 * Thought interface
 * Represents a single thought entry with metadata
 */
interface Thought {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  tags: string[];
}

/**
 * FilterState interface
 * Encapsulates all filter criteria
 */
export interface FilterState {
  text: string;
  dateStart: number | null;
  dateEnd: number | null;
  selectedTags: string[];
}

/**
 * Matches a thought against a text search query
 * Performs case-insensitive substring matching on both title and content
 *
 * @param thought - The thought to match
 * @param query - The search query string
 * @returns true if the thought matches the query
 */
export function matchesTextSearch(thought: Thought, query: string): boolean {
  if (!query || query.trim().length === 0) {
    return true;
  }

  const lowerQuery = query.toLowerCase();
  const titleMatch = thought.title.toLowerCase().includes(lowerQuery);
  const contentMatch = thought.content.toLowerCase().includes(lowerQuery);

  return titleMatch || contentMatch;
}

/**
 * Matches a thought against a date range with inclusive bounds
 * Both start and end dates are optional (null means no boundary)
 *
 * @param thought - The thought to match
 * @param start - Start date timestamp in milliseconds (inclusive), or null for no lower bound
 * @param end - End date timestamp in milliseconds (inclusive), or null for no upper bound
 * @returns true if the thought's createdAt is within the date range
 */
export function matchesDateRange(
  thought: Thought,
  start: number | null,
  end: number | null
): boolean {
  const createdAt = thought.createdAt;

  // Check start date (inclusive)
  if (start !== null && createdAt < start) {
    return false;
  }

  // Check end date (inclusive)
  if (end !== null && createdAt > end) {
    return false;
  }

  return true;
}

/**
 * Matches a thought against selected tags using OR logic
 * If no tags are selected, all thoughts match
 * If tags are selected, the thought matches if it has at least one of the selected tags
 *
 * @param thought - The thought to match
 * @param selectedTags - Array of tag names to match against
 * @returns true if selectedTags is empty or the thought has at least one matching tag
 */
export function matchesTags(thought: Thought, selectedTags: string[]): boolean {
  // If no tags are selected, all thoughts match
  if (!selectedTags || selectedTags.length === 0) {
    return true;
  }

  // OR logic: thought must have at least one of the selected tags
  return selectedTags.some((tag) => thought.tags.includes(tag));
}

/**
 * Applies all filters to a collection of thoughts
 * Combines text, date, and tag filters with AND logic
 *
 * @param thoughts - Array of thoughts to filter
 * @param filterState - FilterState object containing all filter criteria
 * @returns Array of thoughts that match all filter criteria
 */
export function applyFilters(
  thoughts: Thought[],
  filterState: FilterState
): Thought[] {
  return thoughts.filter((thought) => {
    // AND logic: all filters must match
    return (
      matchesTextSearch(thought, filterState.text) &&
      matchesDateRange(thought, filterState.dateStart, filterState.dateEnd) &&
      matchesTags(thought, filterState.selectedTags)
    );
  });
}
