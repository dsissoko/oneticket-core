/**
 * Thought data model and utilities
 * 
 * Thought objects are immutable once created. They represent journal entries
 * with titles, content, timestamps, and optional tags.
 */

/**
 * Represents a single journal thought entry.
 * 
 * Immutability Rules:
 * - id is auto-generated (UUID) and never changes
 * - title and content are set once and never modified
 * - createdAt is set at creation and never changed
 * - tags are assigned at creation and never modified
 * - No update or delete operations are provided
 */
export interface Thought {
  /** Unique identifier (UUID) - immutable */
  id: string;

  /** Title of the thought - immutable */
  title: string;

  /** Main content of the thought - immutable */
  content: string;

  /** ISO 8601 timestamp in milliseconds - immutable */
  createdAt: number;

  /** Optional array of tag names - immutable */
  tags: string[];
}

/**
 * Simple UUID v4-like generator using randomness
 * For a production app, consider using a proper UUID library
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Creates a new Thought with validation
 * 
 * @param title - The title of the thought (required, non-empty)
 * @param content - The main content (required, non-empty)
 * @param tags - Optional array of tag names (defaults to empty array)
 * @returns A new immutable Thought object
 * @throws Error if title or content are empty
 */
export function createThought(
  title: string,
  content: string,
  tags: string[] = []
): Thought {
  // Validate inputs
  if (!title || title.trim().length === 0) {
    throw new Error('Title cannot be empty');
  }

  if (!content || content.trim().length === 0) {
    throw new Error('Content cannot be empty');
  }

  // Create the thought with immutable properties
  const thought: Thought = {
    id: generateId(),
    title: title.trim(),
    content: content.trim(),
    createdAt: Date.now(),
    tags: Array.isArray(tags) ? tags.filter(t => t.trim().length > 0).map(t => t.trim()) : [],
  };

  return thought;
}

/**
 * Validates an existing Thought object for structural integrity
 * 
 * @param thought - The thought to validate
 * @returns true if the thought is valid, false otherwise
 */
export function validateThought(thought: unknown): thought is Thought {
  if (typeof thought !== 'object' || thought === null) {
    return false;
  }

  const t = thought as Record<string, unknown>;

  // Check required fields
  if (typeof t.id !== 'string' || !t.id) {
    return false;
  }

  if (typeof t.title !== 'string' || !t.title) {
    return false;
  }

  if (typeof t.content !== 'string' || !t.content) {
    return false;
  }

  if (typeof t.createdAt !== 'number' || t.createdAt <= 0) {
    return false;
  }

  // Validate tags array
  if (!Array.isArray(t.tags)) {
    return false;
  }

  // All tags must be non-empty strings
  if (!t.tags.every(tag => typeof tag === 'string' && tag.length > 0)) {
    return false;
  }

  return true;
}
