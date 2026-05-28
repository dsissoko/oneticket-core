/**
 * Hook: useEditEntry
 *
 * Provides functionality to update an existing journal entry with validation.
 * Preserves createdAt timestamp (immutable) and updates updatedAt.
 * Validates date format (YYYY-MM-DD) and text (non-empty).
 * Performance target: < 50ms per edit operation.
 */

import { useState, useCallback } from 'react';
import type { JournalEntry } from '../domain/Entry';
import { validateDateFormat, validateText } from '../domain/Entry';
import { getLocalStorageRepository } from '../infrastructure/LocalStorageRepository';
import type { IEntryRepository } from '../domain/IEntryRepository';

/**
 * Update data for editing an entry (partial fields only)
 */
export interface EditEntryInput {
  date?: string; // YYYY-MM-DD format (optional)
  text?: string; // Non-empty text (optional)
}

/**
 * State returned by useEditEntry hook
 */
export interface UseEditEntryState {
  editEntry: (id: string, input: EditEntryInput) => Promise<JournalEntry>;
  isEditing: boolean;
  error: Error | null;
}

/**
 * Hook to edit existing journal entries with validation
 *
 * Preserves createdAt timestamp while updating updatedAt automatically.
 *
 * @returns Object containing editEntry function, isEditing flag, and error
 *
 * @example
 * const { editEntry, isEditing, error } = useEditEntry();
 * await editEntry(entryId, { text: 'Updated text' });
 * await editEntry(entryId, { date: '2026-05-27', text: 'New date and text' });
 */
export function useEditEntry(): UseEditEntryState {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const editEntry = useCallback(
    async (id: string, input: EditEntryInput): Promise<JournalEntry> => {
      const startTime = performance.now();

      try {
        setIsEditing(true);
        setError(null);

        // Validate id
        if (!id || typeof id !== 'string') {
          throw new Error('Entry ID must be a non-empty string');
        }

        // Validate input date if provided
        if (input.date !== undefined) {
          if (typeof input.date !== 'string') {
            throw new Error('Date must be a string');
          }

          if (!validateDateFormat(input.date)) {
            throw new Error('Date must be in YYYY-MM-DD format and not in the future');
          }
        }

        // Validate input text if provided
        if (input.text !== undefined) {
          if (!validateText(input.text)) {
            throw new Error('Text must be non-empty');
          }
        }

        // Ensure at least one field is being updated
        if (Object.keys(input).length === 0) {
          throw new Error('At least one field must be provided for update');
        }

        const repository: IEntryRepository = getLocalStorageRepository();
        const updatedEntry = await repository.update(id, input);

        const endTime = performance.now();
        const duration = endTime - startTime;

        // Log performance metric
        if (typeof window !== 'undefined' && window.performance) {
          console.debug(`[useEditEntry] Updated entry ${id} in ${duration.toFixed(2)}ms`);
        }

        return updatedEntry;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('[useEditEntry] Error editing entry:', error);
        throw error;
      } finally {
        setIsEditing(false);
      }
    },
    [],
  );

  return { editEntry, isEditing, error };
}
