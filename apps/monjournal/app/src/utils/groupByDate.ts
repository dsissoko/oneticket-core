import { Thought } from '../models/thoughtModel';

/**
 * Groups thoughts by creation date (normalized to midnight).
 * Returns a Map of dateKey (YYYY-MM-DD) to array of Thoughts sorted by createdAt descending.
 */
export function groupThoughtsByDate(thoughts: Thought[]): Map<string, Thought[]> {
  const groups = new Map<string, Thought[]>();

  for (const thought of thoughts) {
    // Normalize date to midnight (start of day)
    const date = new Date(thought.createdAt);
    date.setHours(0, 0, 0, 0);
    
    // Create dateKey in YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    // Add thought to group
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(thought);
  }

  // Sort thoughts within each group by createdAt descending (newest first)
  for (const [, groupThoughts] of groups) {
    groupThoughts.sort((a, b) => b.createdAt - a.createdAt);
  }

  // Return groups sorted by dateKey descending (newest dates first)
  const sortedMap = new Map<string, Thought[]>();
  const sortedKeys = Array.from(groups.keys()).sort().reverse();
  for (const key of sortedKeys) {
    sortedMap.set(key, groups.get(key)!);
  }

  return sortedMap;
}
