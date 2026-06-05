/**
 * Core type definitions for MonJournal
 */

/**
 * Represents a single thought entry
 * Immutable after creation
 */
export interface Thought {
  /** Unique identifier (UUID), auto-generated */
  id: string;
  /** Title of the thought (required, immutable) */
  title: string;
  /** Content/body of the thought (required, immutable) */
  content: string;
  /** Timestamp of creation in milliseconds (auto-generated, immutable) */
  createdAt: number;
  /** Optional array of tag names associated with this thought (immutable) */
  tags: string[];
}

/**
 * Represents a tag with derived color
 * Tags are derived from thoughts, not stored separately
 */
export interface Tag {
  /** Name of the tag as used in thoughts */
  name: string;
  /** Color assigned deterministically to this tag (hex format, e.g., "#FF6B6B") */
  color: string;
}

/**
 * Represents filter criteria for filtering thoughts
 * Not persisted across sessions
 */
export interface FilterState {
  /** Text search query (case-insensitive substring matching) */
  text?: string;
  /** Start date for date range filter (timestamp in ms) */
  dateStart?: number | null;
  /** End date for date range filter (timestamp in ms) */
  dateEnd?: number | null;
  /** Array of tag names to filter by (any matching tag included) */
  selectedTags?: string[];
  /** View mode toggle */
  viewMode?: 'list' | 'timeline';
}
