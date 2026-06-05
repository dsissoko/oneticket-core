/**
 * Thought data model and utilities
 * Handles creation and validation of immutable Thought objects
 */

import { Thought } from './types';

/**
 * Generates a UUID v4 for unique thought identifiers
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Creates a new Thought object with auto-generated id and timestamp
 * @param title - Title of the thought
 * @param content - Content/body of the thought
 * @param tags - Optional array of tag names
 * @returns A new immutable Thought object
 */
export const createThought = (
  title: string,
  content: string,
  tags: string[] = []
): Thought => {
  return Object.freeze({
    id: generateUUID(),
    title,
    content,
    createdAt: Date.now(),
    tags: Object.freeze([...tags]),
  });
};

/**
 * Validates that an object conforms to the Thought interface
 * @param t - Object to validate
 * @returns true if valid Thought, false otherwise
 */
export const validateThought = (t: any): t is Thought => {
  // Check required fields
  if (!t || typeof t !== 'object') return false;
  if (typeof t.id !== 'string' || !t.id) return false;
  if (typeof t.title !== 'string' || !t.title) return false;
  if (typeof t.content !== 'string') return false;
  if (typeof t.createdAt !== 'number' || t.createdAt <= 0) return false;

  // Check optional tags array
  if (!Array.isArray(t.tags)) return false;
  if (!t.tags.every((tag: any) => typeof tag === 'string')) return false;

  return true;
};

/**
 * Validates an array of Thought objects
 * @param thoughts - Array to validate
 * @returns true if all items are valid Thoughts
 */
export const validateThoughts = (thoughts: any): thoughts is Thought[] => {
  if (!Array.isArray(thoughts)) return false;
  return thoughts.every(validateThought);
};
