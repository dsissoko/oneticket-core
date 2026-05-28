/**
 * Hook: useDeleteEntry
 *
 * Provides functionality to delete a journal entry with confirmation state management.
 * Maintains a confirmation state for each entry to allow UI to implement
 * confirmation dialogs before actual deletion.
 * Performance target: < 50ms per delete operation.
 */

import { useState, useCallback } from 'react';
import { getLocalStorageRepository } from '../infrastructure/LocalStorageRepository';
import type { IEntryRepository } from '../domain/IEntryRepository';

/**
 * State returned by useDeleteEntry hook
 */
export interface UseDeleteEntryState {
  deleteEntry: (id: string) => Promise<void>;
  isDeleting: boolean;
  error: Error | null;
  confirmDelete: (id: string) => Promise<void>;
  isConfirming: Set<string>; // Track which entries are awaiting confirmation
}

/**
 * Hook to delete journal entries with confirmation state
 *
 * Provides two-step deletion: first call confirmDelete() to show confirmation,
 * then call deleteEntry() to actually remove the entry.
 *
 * @returns Object containing deleteEntry and confirmDelete functions, loading states, and error
 *
 * @example
 * const { deleteEntry, confirmDelete, isConfirming, isDeleting, error } = useDeleteEntry();
 * // Show confirmation dialog for entry
 * await confirmDelete(entryId);
 * // After user confirms, actually delete
 * await deleteEntry(entryId);
 */
export function useDeleteEntry(): UseDeleteEntryState {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConfirming, setIsConfirming] = useState<Set<string>>(new Set<string>());

  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    const startTime = performance.now();

    try {
      setIsDeleting(true);
      setError(null);

      // Validate id
      if (!id || typeof id !== 'string') {
        throw new Error('Entry ID must be a non-empty string');
      }

      const repository: IEntryRepository = getLocalStorageRepository();
      await repository.delete(id);

      // Remove from confirmation set
      setIsConfirming((prev: Set<string>) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Log performance metric
      if (typeof window !== 'undefined' && window.performance) {
        console.debug(`[useDeleteEntry] Deleted entry ${id} in ${duration.toFixed(2)}ms`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('[useDeleteEntry] Error deleting entry:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const confirmDelete = useCallback(async (id: string): Promise<void> => {
    // Validate id
    if (!id || typeof id !== 'string') {
      throw new Error('Entry ID must be a non-empty string');
    }

    // Add entry ID to confirmation set
    setIsConfirming((prev: Set<string>) => new Set(prev).add(id));
  }, []);

  return { deleteEntry, isDeleting, error, confirmDelete, isConfirming };
}
