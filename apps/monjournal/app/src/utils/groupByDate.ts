/**
 * Grouping utilities for organizing thoughts by date
 */

/**
 * Thought interface for typing purposes
 * Mirrors the structure defined in the architecture documentation
 */
interface Thought {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  tags: readonly string[];
}

/**
 * Group thoughts by creation date (normalized to midnight)
 * Returns a Map where keys are date strings in YYYY-MM-DD format
 * Thoughts within each group are sorted by createdAt in descending order (newest first)
 *
 * @param thoughts - array of thoughts to group
 * @returns Map of dateKey (YYYY-MM-DD) to grouped and sorted thoughts
 */
export function groupThoughtsByDate(thoughts: Thought[]): Map<string, Thought[]> {
  // Return empty map for empty array
  if (thoughts.length === 0) {
    return new Map();
  }

  // Group thoughts by normalized date
  const grouped = new Map<string, Thought[]>();

  thoughts.forEach((thought) => {
    const dateKey = getDateKey(thought.createdAt);

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }

    grouped.get(dateKey)!.push(thought);
  });

  // Sort thoughts within each group by createdAt descending (newest first)
  grouped.forEach((groupThoughts) => {
    groupThoughts.sort((a, b) => b.createdAt - a.createdAt);
  });

  // Convert to sorted Map (by date, newest first)
  // Create array of entries, sort by date descending, rebuild map
  const sortedEntries = Array.from(grouped.entries()).sort(
    ([dateKeyA], [dateKeyB]) => dateKeyB.localeCompare(dateKeyA)
  );

  const sortedMap = new Map<string, Thought[]>(sortedEntries);

  return sortedMap;
}

/**
 * Convert a timestamp to a normalized date key (YYYY-MM-DD)
 * The date is in local time (not UTC)
 *
 * @param timestamp - milliseconds since epoch
 * @returns dateKey in YYYY-MM-DD format
 */
function getDateKey(timestamp: number): string {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
