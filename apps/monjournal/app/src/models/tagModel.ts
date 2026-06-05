/**
 * Tag model: derive tags from thoughts with deterministic color assignment
 * All operations are pure and stateless
 */

import { Tag, Thought } from './types';
import { COLORS } from '../utils/colorPalette';

/**
 * Deterministic hash function for tag names
 * Uses the sum of character codes modulo palette length
 * Ensures same tag name always produces same color
 *
 * @param tagName - The tag name to hash
 * @returns A consistent hash value
 */
function hashTagName(tagName: string): number {
  let hash = 0;

  for (let i = 0; i < tagName.length; i++) {
    hash = (hash << 5) - hash + tagName.charCodeAt(i);
    // Use bitwise OR to convert to 32-bit signed integer
    hash = hash & hash; // eslint-disable-line no-bitwise
  }

  return Math.abs(hash);
}

/**
 * Get the deterministic color for a tag name
 * Uses a consistent hash function to map tag names to colors
 * Same tag name always produces the same color across sessions
 *
 * @param tagName - The tag name to assign a color to
 * @returns A hex color string from the palette
 *
 * @example
 * const color = getTagColor("personal");
 * // Returns same color every time for "personal"
 */
export function getTagColor(tagName: string): string {
  const hash = hashTagName(tagName);
  const index = hash % COLORS.length;
  return COLORS[index];
}

/**
 * Derive all unique tags from an array of thoughts
 * Computes deterministic colors for each tag
 *
 * @param thoughts - Array of thoughts to extract tags from
 * @returns Array of Tag objects with name and color, sorted alphabetically by name
 *
 * @example
 * const tags = deriveTags([
 *   { id: "1", title: "x", content: "y", createdAt: 123, tags: ["personal", "morning"] },
 *   { id: "2", title: "a", content: "b", createdAt: 456, tags: ["personal", "evening"] }
 * ]);
 * // Returns: [
 * //   { name: "evening", color: "..." },
 * //   { name: "morning", color: "..." },
 * //   { name: "personal", color: "..." }
 * // ]
 */
export function deriveTags(thoughts: Thought[]): Tag[] {
  // Collect all unique tag names using a Set
  const uniqueTagNames = new Set<string>();

  for (const thought of thoughts) {
    for (const tag of thought.tags) {
      uniqueTagNames.add(tag);
    }
  }

  // Convert to sorted Tag array with computed colors
  return Array.from(uniqueTagNames)
    .sort()
    .map((name) => ({
      name,
      color: getTagColor(name),
    }));
}
