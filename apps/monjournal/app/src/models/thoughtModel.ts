/**
 * Represents a single thought in MonJournal.
 *
 * All properties are immutable after creation:
 * - `id` is auto-generated UUID
 * - `createdAt` is auto-generated timestamp
 * - `title`, `content`, and `tags` are set at creation and never modified
 */
export interface Thought {
  /**
   * Unique identifier for this thought (UUID).
   * Auto-generated on creation, immutable.
   */
  id: string;

  /**
   * Title of the thought.
   * Required, immutable.
   */
  title: string;

  /**
   * Main content/body of the thought.
   * Required, immutable.
   */
  content: string;

  /**
   * Timestamp of when this thought was created (milliseconds since epoch).
   * Auto-generated on creation, immutable.
   */
  createdAt: number;

  /**
   * Array of tag names associated with this thought.
   * Optional, immutable. Empty array if no tags.
   */
  tags: string[];
}

/**
 * Creates a new Thought with auto-generated UUID and timestamp.
 *
 * @param title - The title of the thought (required, non-empty string)
 * @param content - The main content of the thought (required, non-empty string)
 * @param tags - Array of tag names (defaults to empty array)
 * @returns A new immutable Thought object
 *
 * @example
 * const thought = createThought('Morning Reflection', 'Had a great start to the day', ['personal', 'morning']);
 * // Returns: { id: 'uuid...', title: 'Morning Reflection', content: '...', createdAt: 1717459200000, tags: [...] }
 */
export function createThought(
  title: string,
  content: string,
  tags: string[] = []
): Thought {
  return {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: Date.now(),
    tags,
  };
}

/**
 * Validates that an object conforms to the Thought interface.
 *
 * Checks that all required fields are present and have correct types:
 * - `id` must be a non-empty string
 * - `title` must be a non-empty string
 * - `content` must be a non-empty string
 * - `createdAt` must be a number (milliseconds since epoch)
 * - `tags` must be an array of strings (can be empty)
 *
 * @param obj - Any object to validate
 * @returns `true` if the object is a valid Thought, `false` otherwise
 *
 * @example
 * const thought = { id: 'uuid', title: 'Test', content: 'Content', createdAt: 123456, tags: [] };
 * validateThought(thought); // Returns true
 *
 * const invalid = { title: 'Test', content: 'Content' }; // Missing id and createdAt
 * validateThought(invalid); // Returns false
 */
export function validateThought(obj: unknown): obj is Thought {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }

  const candidate = obj as Record<string, unknown>;

  // Check that id is a non-empty string
  if (typeof candidate.id !== 'string' || candidate.id.trim() === '') {
    return false;
  }

  // Check that title is a non-empty string
  if (typeof candidate.title !== 'string' || candidate.title.trim() === '') {
    return false;
  }

  // Check that content is a non-empty string
  if (typeof candidate.content !== 'string' || candidate.content.trim() === '') {
    return false;
  }

  // Check that createdAt is a number (milliseconds timestamp)
  if (typeof candidate.createdAt !== 'number' || candidate.createdAt < 0) {
    return false;
  }

  // Check that tags is an array of strings
  if (!Array.isArray(candidate.tags)) {
    return false;
  }

  // Verify all elements in tags array are strings
  if (!candidate.tags.every((tag): tag is string => typeof tag === 'string')) {
    return false;
  }

  return true;
}
