/**
 * Tag data model and utilities
 * Handles tag derivation from thoughts and deterministic color assignment
 */

import { Thought, Tag } from './types';
import { COLORS } from '../utils/colorPalette';

/**
 * Simple but effective hash function for deterministic color assignment
 * Uses djb2 algorithm for better distribution than charCodeAt
 * @param str - String to hash
 * @returns Hash value
 */
export const hashCode = (str: string): number => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i); // hash * 33 + char
  }
  return Math.abs(hash);
};

/**
 * Gets the deterministic color for a tag name
 * Same tag name always produces the same color across sessions
 * @param tagName - Name of the tag
 * @returns Hex color string
 */
export const getTagColor = (tagName: string): string => {
  if (!tagName || tagName.trim().length === 0) {
    return COLORS[0]; // Default to first color for empty/invalid tags
  }
  const hash = hashCode(tagName);
  const index = hash % COLORS.length;
  return COLORS[index];
};

/**
 * Derives all unique tags from an array of thoughts with assigned colors
 * Tags are computed on demand, not stored separately
 * @param thoughts - Array of Thought objects
 * @returns Array of Tag objects with names and colors
 */
export const deriveTags = (thoughts: Thought[]): Tag[] => {
  // Collect all unique tag names
  const tagNameSet = new Set<string>();

  for (const thought of thoughts) {
    if (Array.isArray(thought.tags)) {
      thought.tags.forEach((tag) => {
        if (typeof tag === 'string' && tag.trim().length > 0) {
          tagNameSet.add(tag.trim());
        }
      });
    }
  }

  // Convert to sorted array of Tag objects with colors
  const tags: Tag[] = Array.from(tagNameSet)
    .sort() // Sort alphabetically for consistent ordering
    .map((name) => ({
      name,
      color: getTagColor(name),
    }));

  return tags;
};

/**
 * Validates a Tag object
 * @param t - Object to validate
 * @returns true if valid Tag
 */
export const validateTag = (t: any): t is Tag => {
  if (!t || typeof t !== 'object') return false;
  if (typeof t.name !== 'string' || !t.name) return false;
  if (typeof t.color !== 'string' || !t.color) return false;
  return true;
};
