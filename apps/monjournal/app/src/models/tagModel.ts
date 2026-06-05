import { Thought } from './thoughtModel';
import { COLORS } from '../utils/colorPalette';

export interface Tag {
  name: string;
  color: string;
}

/**
 * Simple deterministic hash function for tag names.
 * Returns same result for same input across sessions.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Gets the deterministic color for a tag name.
 * Same tag name always produces the same color.
 */
export function getTagColor(tagName: string): string {
  const hash = hashString(tagName);
  const colorIndex = hash % COLORS.length;
  return COLORS[colorIndex];
}

/**
 * Derives all unique tags from a list of thoughts and assigns colors.
 * Returns sorted by tag name for consistency.
 */
export function deriveTags(thoughts: Thought[]): Tag[] {
  const tagSet = new Set<string>();

  // Collect all unique tag names (case-sensitive)
  for (const thought of thoughts) {
    for (const tag of thought.tags) {
      tagSet.add(tag);
    }
  }

  // Convert to Tag objects with colors and sort by name
  const tags = Array.from(tagSet)
    .map((name) => ({
      name,
      color: getTagColor(name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return tags;
}
