/**
 * Domain Layer: IEntryRepository Port Interface
 * 
 * Defines the contract for entry persistence operations.
 * Implementations can use localStorage, an API, IndexedDB, or any other backend.
 * This port interface enables clean separation between domain logic and infrastructure.
 */

import type { JournalEntry } from './Entry';

/**
 * Custom error type for repository operations
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

/**
 * IEntryRepository - Port interface for entry persistence
 * 
 * All methods are async to support both localStorage (which can be wrapped in Promise)
 * and future API-based implementations.
 */
export interface IEntryRepository {
  /**
   * Retrieves all entries from the repository
   * 
   * @returns Promise resolving to array of all entries, empty array if none exist
   * @throws RepositoryError if deserialization fails or storage is unavailable
   */
  getAll(): Promise<JournalEntry[]>;

  /**
   * Retrieves a single entry by ID
   * 
   * @param id - The UUID of the entry to retrieve
   * @returns Promise resolving to the entry or null if not found
   * @throws RepositoryError if the entry cannot be retrieved
   */
  getById(id: string): Promise<JournalEntry | null>;

  /**
   * Creates a new entry in the repository
   * 
   * The repository implementation is responsible for:
   * - Generating a unique UUID v4 for the entry
   * - Setting createdAt to the current ISO 8601 timestamp
   * - Setting updatedAt to the same value as createdAt
   * 
   * @param entry - Entry data without id, createdAt, or updatedAt (these are generated)
   * @returns Promise resolving to the complete entry with all fields populated
   * @throws RepositoryError if validation fails, storage is full, or write fails
   */
  create(
    entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<JournalEntry>;

  /**
   * Updates an existing entry in the repository
   * 
   * The repository implementation is responsible for:
   * - Preserving the original createdAt timestamp (immutable)
   * - Updating updatedAt to the current ISO 8601 timestamp
   * - Merging provided fields with existing data
   * 
   * @param id - The UUID of the entry to update
   * @param updates - Partial entry data to merge (id, createdAt will be ignored if provided)
   * @returns Promise resolving to the updated entry with all fields
   * @throws RepositoryError if entry not found, validation fails, or write fails
   */
  update(
    id: string,
    updates: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>,
  ): Promise<JournalEntry>;

  /**
   * Deletes an entry from the repository
   * 
   * @param id - The UUID of the entry to delete
   * @returns Promise resolving to void
   * @throws RepositoryError if entry not found or deletion fails
   */
  delete(id: string): Promise<void>;
}
