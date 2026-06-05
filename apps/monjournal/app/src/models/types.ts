/**
 * Core data model types for MonJournal
 */

/**
 * Immutable Thought record
 * Represents a single journal entry with metadata
 */
export interface Thought {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly createdAt: number;
  readonly tags: readonly string[];
}

/**
 * Tag with deterministically assigned color
 * Derived from Thought.tags array
 */
export interface Tag {
  readonly name: string;
  readonly color: string;
}

/**
 * Filter state for thought queries
 * All filters are optional and composed with AND logic
 */
export interface FilterState {
  readonly text?: string;
  readonly dateStart?: number;
  readonly dateEnd?: number;
  readonly selectedTags?: readonly string[];
}
