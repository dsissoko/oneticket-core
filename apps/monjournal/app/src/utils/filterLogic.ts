/**
 * Filter logic for thoughts
 * Pure, stateless functions for composing filters with AND logic
 */

import { FilterState, Thought } from '../models/types';

/**
 * Test if a thought matches a text search query
 * Case-insensitive substring matching in title or content
 *
 * @param thought - The thought to test
 * @param query - The search query (required)
 * @returns true if thought title or content contains query (case-insensitive)
 *
 * @example
 * const thought = { id: "1", title: "Morning", content: "Felt great", createdAt: 123, tags: [] };
 * matchesTextSearch(thought, "morning"); // true
 * matchesTextSearch(thought, "FELT"); // true
 * matchesTextSearch(thought, "evening"); // false
 */
export function matchesTextSearch(thought: Thought, query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return (
    thought.title.toLowerCase().includes(lowerQuery) ||
    thought.content.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Test if a thought's creation date falls within a range
 * Inclusive on both bounds (start <= createdAt <= end)
 * Handles null bounds gracefully (null = no limit on that end)
 *
 * @param thought - The thought to test
 * @param start - Start timestamp in milliseconds (null = no lower bound)
 * @param end - End timestamp in milliseconds (null = no upper bound)
 * @returns true if thought's createdAt is within range
 *
 * @example
 * const thought = { id: "1", title: "x", content: "y", createdAt: 500, tags: [] };
 * matchesDateRange(thought, 100, 600); // true
 * matchesDateRange(thought, 100, 400); // false
 * matchesDateRange(thought, null, 600); // true
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
 * Test if a thought matches selected tags
 * Uses OR logic: thought matches if ANY of its tags are in selectedTags
 * Empty selectedTags array matches all thoughts (no filter applied)
 *
 * @param thought - The thought to test
 * @param selectedTags - Array of tag names to match (empty = match all)
 * @returns true if selectedTags is empty OR thought has at least one matching tag
 *
 * @example
 * const thought = { id: "1", title: "x", content: "y", createdAt: 123, tags: ["personal", "morning"] };
 * matchesTags(thought, []); // true (no filter)
 * matchesTags(thought, ["personal"]); // true
 * matchesTags(thought, ["evening"]); // false
 * matchesTags(thought, ["personal", "evening"]); // true (at least one match)
 */
export function matchesTags(
  thought: Thought,
  selectedTags: readonly string[]
): boolean {
  // Empty filter matches all
  if (selectedTags.length === 0) {
    return true;
  }

  // Check if thought has at least one tag in selectedTags
  return thought.tags.some((tag) => selectedTags.includes(tag));
}

/**
 * Apply all filters to an array of thoughts with AND composition
 * Each filter is optional and independent
 * Results only include thoughts matching ALL applied filters
 *
 * @param thoughts - Array of thoughts to filter
 * @param filters - Filter criteria (all optional)
 * @returns Filtered array of thoughts matching all criteria
 *
 * @example
 * const thoughts = [
 *   { id: "1", title: "Morning", content: "Felt great", createdAt: 500, tags: ["personal"] },
 *   { id: "2", title: "Evening", content: "Tired", createdAt: 1000, tags: ["work"] }
 * ];
 *
 * applyFilters(thoughts, { text: "morning" });
 * // Returns: [thoughts[0]]
 *
 * applyFilters(thoughts, { text: "personal", dateStart: 100, dateEnd: 600 });
 * // Returns: [thoughts[0]] (matches text and is within date range)
 *
 * applyFilters(thoughts, { text: "morning", selectedTags: ["work"] });
 * // Returns: [] (matches text but no "work" tag)
 */
export function applyFilters(
  thoughts: Thought[],
  filters: FilterState
): Thought[] {
  return thoughts.filter((thought) => {
    // Apply text filter if present
    if (filters.text && !matchesTextSearch(thought, filters.text)) {
      return false;
    }

    // Apply date range filter if present
    if (
      filters.dateStart !== undefined ||
      filters.dateEnd !== undefined
    ) {
      if (!matchesDateRange(thought, filters.dateStart ?? null, filters.dateEnd ?? null)) {
        return false;
      }
    }

    // Apply tag filter if present
    if (filters.selectedTags && !matchesTags(thought, filters.selectedTags)) {
      return false;
    }

    return true;
  });
}
