/**
 * Hook: useCreateEntry
 *
 * Provides functionality to create a new journal entry with validation.
 * Validates date format (YYYY-MM-DD) and text (non-empty).
 * Returns created entry and manages loading/error states.
 * Performance target: < 50ms per create operation.
 */

import { useState, useCallback } from 'react';
import type { JournalEntry } from '../domain/Entry';
import { validateDateFormat, validateText } from '../domain/Entry';
import { getLocalStorageRepository } from '../infrastructure/LocalStorageRepository';
import type { IEntryRepository } from '../domain/IEntryRepository';

/**
 * Input data for creating an entry (without id, createdAt, updatedAt)
 */
export interface CreateEntryInput {
  date: string; // YYYY-MM-DD format
  text: string; // Non-empty text
}

/**
 * State returned by useCreateEntry hook
 */
export interface UseCreateEntryState {
  createEntry: (input: CreateEntryInput) => Promise<JournalEntry>;
  isCreating: boolean;
  error: Error | null;
}

/**
 * Hook to create new journal entries with validation
 *
 * @returns Object containing createEntry function, isCreating flag, and error
 *
 * @example
 * const { createEntry, isCreating, error } = useCreateEntry();
 * await createEntry({ date: '2026-05-28', text: 'My thoughts...' });
 */
export function useCreateEntry(): UseCreateEntryState {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createEntry = useCallback(async (input: CreateEntryInput): Promise<JournalEntry> => {
    const startTime = performance.now();

    try {
      setIsCreating(true);
      setError(null);

      // Validate input date format
      if (!input.date || typeof input.date !== 'string') {
        throw new Error('Date must be a non-empty string');
      }

      if (!validateDateFormat(input.date)) {
        throw new Error('Date must be in YYYY-MM-DD format and not in the future');
      }

      // Validate input text
      if (!validateText(input.text)) {
        throw new Error('Text must be non-empty');
      }

      const repository: IEntryRepository = getLocalStorageRepository();
      const newEntry = await repository.create({
        date: input.date,
        text: input.text,
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Log performance metric
      if (typeof window !== 'undefined' && window.performance) {
        console.debug(
          `[useCreateEntry] Created entry ${newEntry.id} in ${duration.toFixed(2)}ms`,
        );
      }

      return newEntry;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('[useCreateEntry] Error creating entry:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return { createEntry, isCreating, error };
}
