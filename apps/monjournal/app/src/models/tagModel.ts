/**
 * Represents a tag in MonJournal with a name and deterministically computed color.
 *
 * Tags are derived from thoughts and are not stored separately.
 * The color is computed deterministically from the tag name hash,
 * ensuring the same tag always gets the same color across sessions.
 */
export interface Tag {
  /**
   * The name of the tag.
   * Derived from thought.tags array.
   */
  name: string;

  /**
   * The hex color code for this tag.
   * Computed deterministically from the tag name hash.
   * Same tag name always produces the same color.
   */
  color: string;
}

import { COLORS } from '../utils/colorPalette';
import type { Thought } from './thoughtModel';

/**
 * Computes a deterministic color for a given tag name.
 *
 * Uses the first character's character code modulo the color palette length
 * to select a color. This ensures:
 * - Same tag name always gets the same color
 * - Consistent across browser sessions and device reloads
 * - Distributed relatively evenly across the color palette
 *
 * @param tagName - The name of the tag
 * @returns A hex color string from the color palette (e.g., "#FF6B6B")
 *
 * @example
 * getTagColor('work') // Returns '#FF6B6B' (always)
 * getTagColor('personal') // Returns '#4ECDC4' (always)
 * getTagColor('work') // Returns '#FF6B6B' (consistent)
 */
export function getTagColor(tagName: string): string {
  if (!tagName || tagName.length === 0) {
    // Default to first color if tag name is empty
    return COLORS[0];
  }

  // Use charCodeAt(0) to get the first character's code
  // Modulo by COLORS.length to get an index in valid range
  const hashCode = tagName.charCodeAt(0) % COLORS.length;
  return COLORS[hashCode];
}

/**
 * Derives all unique tags from an array of thoughts and computes their colors.
 *
 * Algorithm:
 * 1. Collect all tag names from all thoughts
 * 2. Deduplicate (convert to Set)
 * 3. For each unique tag name, compute color using deterministic hash
 * 4. Return array of Tag objects
 *
 * @param thoughts - Array of Thought objects to extract tags from
 * @returns Array of unique Tag objects with names and deterministic colors
 *
 * @example
 * const thoughts = [
 *   { id: '1', title: 'Thought 1', content: '...', createdAt: 123456, tags: ['work', 'urgent'] },
 *   { id: '2', title: 'Thought 2', content: '...', createdAt: 123457, tags: ['work', 'personal'] },
 * ];
 * deriveTags(thoughts);
 * // Returns:
 * // [
 * //   { name: 'work', color: '#FF6B6B' },
 * //   { name: 'urgent', color: '#4ECDC4' },
 * //   { name: 'personal', color: '#45B7D1' },
 * // ]
 */
export function deriveTags(thoughts: Thought[]): Tag[] {
  // Collect all unique tag names
  const uniqueTagNames = new Set<string>();

  for (const thought of thoughts) {
    // Iterate through each tag in the thought
    for (const tagName of thought.tags) {
      uniqueTagNames.add(tagName);
    }
  }

  // Convert set to array and sort for consistent ordering
  const sortedTagNames = Array.from(uniqueTagNames).sort();

  // Create Tag objects with computed colors
  const tags: Tag[] = sortedTagNames.map((name) => ({
    name,
    color: getTagColor(name),
  }));

  return tags;
}
