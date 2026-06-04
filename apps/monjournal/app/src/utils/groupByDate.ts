/**
 * Utility for grouping thoughts by creation date
 */

/**
 * Thought type definition
 * This matches the MonJournal data model from the product specification
 */
export type Thought = {
  id: string;
  title: string;
  content: string;
  createdAt: number; // Timestamp in milliseconds
  tags: string[]; // Array of tag names
};

/**
 * Groups thoughts by creation date (normalized to midnight)
 * 
 * @param thoughts - Array of thoughts to group
 * @returns Map with YYYY-MM-DD keys and sorted thought arrays as values
 * 
 * - Each key is formatted as YYYY-MM-DD for stable grouping
 * - Thoughts within each group are sorted by createdAt in descending order (newest first)
 * - Map iteration order is stable for consistent rendering
 */
export function groupThoughtsByDate(thoughts: Thought[]): Map<string, Thought[]> {
  const grouped = new Map<string, Thought[]>();

  // Group thoughts by their date (normalized to midnight)
  for (const thought of thoughts) {
    // Create a date normalized to midnight in UTC
    const date = new Date(thought.createdAt);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    // Add thought to the group
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(thought);
  }

  // Sort thoughts within each group by createdAt descending (newest first)
  for (const thoughtArray of grouped.values()) {
    thoughtArray.sort((a, b) => b.createdAt - a.createdAt);
  }

  return grouped;
}
