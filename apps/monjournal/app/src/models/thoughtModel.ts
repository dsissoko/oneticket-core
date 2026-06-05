/**
 * Thought model: core data definition and factory functions
 * All operations are pure and stateless
 */

import { Thought } from './types';

/**
 * Generate a UUID v4 string
 * Uses crypto.randomUUID for a standards-compliant implementation
 *
 * @returns A UUID v4 string
 */
function generateUUID(): string {
  // Fallback implementation for environments without crypto.randomUUID
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: generate a pseudo-random UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create a new Thought with auto-generated id and createdAt timestamp
 * Ensures immutability through readonly properties
 *
 * @param title - The thought title (required)
 * @param content - The thought content (required)
 * @param tags - Array of tag names (can be empty)
 * @returns A new immutable Thought object
 *
 * @example
 * const thought = createThought("Morning", "Felt productive", ["personal", "morning"]);
 * // Returns: { id: "...", title: "Morning", content: "Felt productive", createdAt: 1717459200000, tags: ["personal", "morning"] }
 */
export function createThought(
  title: string,
  content: string,
  tags: string[] = []
): Thought {
  return Object.freeze({
    id: generateUUID(),
    title,
    content,
    createdAt: Date.now(),
    tags: Object.freeze([...tags]) as readonly string[],
  });
}

/**
 * Validate that an object conforms to the Thought interface
 * Checks required fields and validates types
 *
 * @param t - The object to validate
 * @returns true if object is a valid Thought, false otherwise
 *
 * @example
 * const valid = validateThought({ id: "...", title: "x", content: "y", createdAt: 123, tags: [] });
 * // Returns: true
 */
export function validateThought(t: any): boolean {
  // Check existence of required fields
  if (!t || typeof t !== 'object') {
    return false;
  }

  // Validate id: must be a non-empty string
  if (typeof t.id !== 'string' || t.id.trim().length === 0) {
    return false;
  }

  // Validate title: must be a string
  if (typeof t.title !== 'string') {
    return false;
  }

  // Validate content: must be a string
  if (typeof t.content !== 'string') {
    return false;
  }

  // Validate createdAt: must be a positive number (timestamp in milliseconds)
  if (typeof t.createdAt !== 'number' || t.createdAt < 0) {
    return false;
  }

  // Validate tags: must be an array of strings (or empty array)
  if (!Array.isArray(t.tags)) {
    return false;
  }

  if (!t.tags.every((tag: any) => typeof tag === 'string')) {
    return false;
  }

  return true;
}
