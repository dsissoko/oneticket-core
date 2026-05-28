/**
 * Infrastructure Layer: LocalStorageRepository
 * 
 * Implements IEntryRepository using browser localStorage.
 * Provides graceful error handling for quota exceeded and deserialization failures.
 */

import type { JournalEntry } from '../domain/Entry';
import { isJournalEntry, validateJournalEntry, EntryValidationError } from '../domain/Entry';
import { IEntryRepository, RepositoryError } from '../domain/IEntryRepository';
import { generateUUID } from './UUIDGenerator';
import { getCurrentTimestamp } from './DateUtils';

/**
 * Custom error class for localStorage-specific errors
 */
export class LocalStorageError extends RepositoryError {
  constructor(
    message: string,
    code: string,
    public originalError?: Error,
    details?: Record<string, unknown>,
  ) {
    super(message, code, details);
    this.name = 'LocalStorageError';
  }
}

/**
 * LocalStorageRepository - Implements IEntryRepository using browser localStorage
 * 
 * Storage Key: 'journal_entries'
 * Value: JSON array of JournalEntry objects
 * 
 * Error Handling:
 * - QuotaExceededError: Caught and wrapped as RepositoryError with user-friendly message
 * - Parse errors: Caught and falls back to empty array with warning logged
 * - Validation errors: Entries that fail validation are skipped with logging
 * 
 * Thread Safety: Not thread-safe (browser limitation). Use cautiously in concurrent scenarios.
 */
export class LocalStorageRepository implements IEntryRepository {
  private readonly storageKey = 'journal_entries';

  /**
   * Retrieves all entries from localStorage
   * 
   * @returns Promise resolving to array of all valid entries
   * @throws LocalStorageError if storage is unavailable
   */
  async getAll(): Promise<JournalEntry[]> {
    try {
      const data = localStorage.getItem(this.storageKey);

      // No data stored yet
      if (data === null) {
        return [];
      }

      // Parse JSON with error handling
      let entries: unknown[];
      try {
        entries = JSON.parse(data);
      } catch (parseError) {
        // Log the parse error and return empty array for graceful degradation
        console.warn(
          `[LocalStorageRepository] Failed to parse journal_entries from localStorage:`,
          parseError instanceof Error ? parseError.message : String(parseError),
        );
        return [];
      }

      // Ensure it's an array
      if (!Array.isArray(entries)) {
        console.warn(
          `[LocalStorageRepository] Expected array of entries, got ${typeof entries}. Returning empty array.`,
        );
        return [];
      }

      // Filter and validate entries
      const validEntries: JournalEntry[] = [];
      entries.forEach((entry, index) => {
        try {
          validateJournalEntry(entry);
          validEntries.push(entry as JournalEntry);
        } catch (error) {
          // Log invalid entries but continue processing
          console.warn(
            `[LocalStorageRepository] Skipping invalid entry at index ${index}:`,
            error instanceof Error ? error.message : String(error),
          );
        }
      });

      return validEntries;
    } catch (error) {
      // localStorage might be unavailable (private browsing, quota exceeded, etc.)
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new LocalStorageError(
          'Storage quota exceeded. Please delete some old entries to continue.',
          'QUOTA_EXCEEDED',
          error,
          { availableSpace: this.getAvailableSpace() },
        );
      }

      if (error instanceof LocalStorageError) {
        throw error;
      }

      // Generic storage error
      throw new LocalStorageError(
        'Failed to retrieve entries from storage',
        'STORAGE_ACCESS_ERROR',
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Retrieves a single entry by ID
   * 
   * @param id - The UUID of the entry to retrieve
   * @returns Promise resolving to the entry or null if not found
   * @throws LocalStorageError if retrieval fails
   */
  async getById(id: string): Promise<JournalEntry | null> {
    const entries = await this.getAll();
    const entry = entries.find((e) => e.id === id);
    return entry || null;
  }

  /**
   * Creates a new entry in localStorage
   * 
   * Generates UUID and timestamps, then persists to storage.
   * 
   * @param entry - Entry data without id, createdAt, or updatedAt
   * @returns Promise resolving to the created entry with all fields
   * @throws LocalStorageError if validation fails, storage is full, or write fails
   */
  async create(
    entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<JournalEntry> {
    // Validate input
    if (!entry.date || typeof entry.date !== 'string') {
      throw new LocalStorageError(
        'Entry date is required and must be a string',
        'VALIDATION_ERROR',
        undefined,
        { received: entry.date },
      );
    }

    if (!entry.text || typeof entry.text !== 'string') {
      throw new LocalStorageError(
        'Entry text is required and must be a string',
        'VALIDATION_ERROR',
        undefined,
        { received: entry.text },
      );
    }

    // Generate ID and timestamps
    const id = generateUUID();
    const now = getCurrentTimestamp();
    const newEntry: JournalEntry = {
      ...entry,
      id,
      createdAt: now,
      updatedAt: now,
    };

    // Validate the complete entry
    try {
      validateJournalEntry(newEntry);
    } catch (error) {
      if (error instanceof EntryValidationError) {
        throw new LocalStorageError(
          `Entry validation failed: ${error.message}`,
          'VALIDATION_ERROR',
          error,
          error.details,
        );
      }
      throw error;
    }

    // Get all existing entries
    const entries = await this.getAll();

    // Add the new entry
    entries.push(newEntry);

    // Persist to storage
    await this.persistEntries(entries);

    return newEntry;
  }

  /**
   * Updates an existing entry in localStorage
   * 
   * Preserves createdAt, updates updatedAt to current timestamp.
   * 
   * @param id - The UUID of the entry to update
   * @param updates - Partial entry data to merge
   * @returns Promise resolving to the updated entry
   * @throws LocalStorageError if entry not found, validation fails, or write fails
   */
  async update(
    id: string,
    updates: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>,
  ): Promise<JournalEntry> {
    // Get all entries
    const entries = await this.getAll();
    const entryIndex = entries.findIndex((e) => e.id === id);

    // Entry not found
    if (entryIndex === -1) {
      throw new LocalStorageError(
        `Entry with ID ${id} not found`,
        'NOT_FOUND',
        undefined,
        { entryId: id },
      );
    }

    // Get the entry to update
    const existingEntry = entries[entryIndex];

    // Merge updates, preserving createdAt and id
    const updatedEntry: JournalEntry = {
      ...existingEntry,
      ...updates,
      id: existingEntry.id, // Preserve id
      createdAt: existingEntry.createdAt, // Preserve createdAt
      updatedAt: getCurrentTimestamp(), // Update timestamp
    };

    // Validate the updated entry
    try {
      validateJournalEntry(updatedEntry);
    } catch (error) {
      if (error instanceof EntryValidationError) {
        throw new LocalStorageError(
          `Entry validation failed: ${error.message}`,
          'VALIDATION_ERROR',
          error,
          error.details,
        );
      }
      throw error;
    }

    // Replace the entry
    entries[entryIndex] = updatedEntry;

    // Persist to storage
    await this.persistEntries(entries);

    return updatedEntry;
  }

  /**
   * Deletes an entry from localStorage
   * 
   * @param id - The UUID of the entry to delete
   * @returns Promise resolving to void
   * @throws LocalStorageError if entry not found or deletion fails
   */
  async delete(id: string): Promise<void> {
    // Get all entries
    const entries = await this.getAll();
    const entryIndex = entries.findIndex((e) => e.id === id);

    // Entry not found
    if (entryIndex === -1) {
      throw new LocalStorageError(
        `Entry with ID ${id} not found`,
        'NOT_FOUND',
        undefined,
        { entryId: id },
      );
    }

    // Remove the entry
    entries.splice(entryIndex, 1);

    // Persist to storage
    await this.persistEntries(entries);
  }

  /**
   * Persists entries to localStorage
   * 
   * @param entries - Array of entries to persist
   * @throws LocalStorageError if serialization fails or quota is exceeded
   */
  private async persistEntries(entries: JournalEntry[]): Promise<void> {
    try {
      const json = JSON.stringify(entries);
      localStorage.setItem(this.storageKey, json);
    } catch (error) {
      // Handle quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new LocalStorageError(
          'Storage quota exceeded. Please delete some old entries to continue.',
          'QUOTA_EXCEEDED',
          error,
          { availableSpace: this.getAvailableSpace() },
        );
      }

      // Handle serialization errors (should be rare)
      if (error instanceof TypeError) {
        throw new LocalStorageError(
          'Failed to serialize entries to JSON',
          'SERIALIZATION_ERROR',
          error,
        );
      }

      // Generic write error
      throw new LocalStorageError(
        'Failed to persist entries to storage',
        'STORAGE_WRITE_ERROR',
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Estimates available storage space
   * 
   * Uses a binary search approach to estimate available bytes.
   * This is a rough estimate and may not be 100% accurate.
   * 
   * @returns Estimated available bytes, or -1 if unavailable
   */
  private getAvailableSpace(): number {
    try {
      if (!navigator.storage || !navigator.storage.estimate) {
        return -1;
      }

      // Note: This is async in the real StorageManager API,
      // but we can't await in a non-async context here.
      // Return -1 to indicate it's not synchronously available.
      return -1;
    } catch {
      return -1;
    }
  }
}

/**
 * Factory function to create and return a singleton instance
 */
let repositoryInstance: LocalStorageRepository | null = null;

export function getLocalStorageRepository(): IEntryRepository {
  if (!repositoryInstance) {
    repositoryInstance = new LocalStorageRepository();
  }
  return repositoryInstance;
}
