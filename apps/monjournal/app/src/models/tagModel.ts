import { Thought } from './thoughtModel';
import { COLORS } from '../utils/colorPalette';

/**
 * Tag interface representing a unique tag with assigned color
 */
export interface Tag {
  name: string;
  color: string;
}

/**
 * Computes a deterministic hash for a tag name
 * Uses sum of character codes modulo color palette length to ensure consistency
 * @param tagName - The tag name to hash
 * @returns A consistent color from the palette
 */
export function getTagColor(tagName: string): string {
  let hash = 0;
  
  // Sum character codes for a simple but effective hash
  for (let i = 0; i < tagName.length; i++) {
    hash += tagName.charCodeAt(i);
  }
  
  // Map hash to color palette index
  const colorIndex = hash % COLORS.length;
  return COLORS[colorIndex];
}

/**
 * Derives unique tags from all thoughts with deterministically assigned colors
 * @param thoughts - Array of Thought objects
 * @returns Array of Tag objects with unique names and consistent colors
 */
export function deriveTags(thoughts: Thought[]): Tag[] {
  // Collect unique tag names from all thoughts
  const uniqueTagNames = new Set<string>();
  
  for (const thought of thoughts) {
    for (const tag of thought.tags) {
      uniqueTagNames.add(tag);
    }
  }
  
  // Convert to sorted array for consistent ordering
  const sortedTagNames = Array.from(uniqueTagNames).sort();
  
  // Create Tag objects with computed colors
  return sortedTagNames.map((name) => ({
    name,
    color: getTagColor(name),
  }));
}
