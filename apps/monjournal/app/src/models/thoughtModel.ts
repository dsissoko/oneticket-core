import { v4 as uuidv4 } from 'uuid';

/**
 * Thought interface representing a journal entry
 */
export interface Thought {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  tags: string[];
}

/**
 * Creates a new Thought with auto-generated id and timestamp
 * @param title - The title of the thought
 * @param content - The content/body of the thought
 * @param tags - Array of tags associated with the thought (optional)
 * @returns A new Thought object with UUID id and current timestamp
 */
export function createThought(
  title: string,
  content: string,
  tags: string[] = []
): Thought {
  return {
    id: uuidv4(),
    title,
    content,
    createdAt: Date.now(),
    tags,
  };
}

/**
 * Validates that a Thought object has all required fields
 * @param t - The object to validate
 * @returns true if all required fields are present and valid, false otherwise
 */
export function validateThought(t: any): boolean {
  // Check if t is an object
  if (typeof t !== 'object' || t === null) {
    return false;
  }

  // Check required string fields
  if (typeof t.id !== 'string' || !t.id) {
    return false;
  }

  if (typeof t.title !== 'string' || !t.title) {
    return false;
  }

  if (typeof t.content !== 'string' || !t.content) {
    return false;
  }

  // Check createdAt is a number (timestamp in ms)
  if (typeof t.createdAt !== 'number' || t.createdAt < 0) {
    return false;
  }

  // Check tags is an array of strings
  if (!Array.isArray(t.tags)) {
    return false;
  }

  if (!t.tags.every((tag: any) => typeof tag === 'string')) {
    return false;
  }

  return true;
}
