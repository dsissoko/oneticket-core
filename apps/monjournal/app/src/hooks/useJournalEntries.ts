/**
 * Hook: useJournalEntries
 *
 * Fetches all journal entries from the repository on mount and manages loading/error states.
 * Sorts entries by date descending (newest first).
 * Performance target: < 50ms for typical use cases (< 1000 entries).
 */

import { useEffect, useState } from 'react';
import type { JournalEntry } from '../domain/Entry';
import { getLocalStorageRepository } from '../infrastructure/LocalStorageRepository';
import type { IEntryRepository } from '../domain/IEntryRepository';

/**
 * State returned by useJournalEntries hook
 */
export interface UseJournalEntriesState {
  entries: JournalEntry[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and manage all journal entries
 *
 * @returns Object containing entries array, isLoading flag, and error
 *
 * @example
 * const { entries, isLoading, error } = useJournalEntries();
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * return <div>{entries.map(e => <div key={e.id}>{e.text}</div>)}</div>;
 */
export function useJournalEntries(): UseJournalEntriesState {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      const startTime = performance.now();

      try {
        setIsLoading(true);
        setError(null);

        const repository: IEntryRepository = getLocalStorageRepository();
        const fetchedEntries = await repository.getAll();

        // Sort by date descending (newest first)
        const sorted = [...fetchedEntries].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setEntries(sorted);

        const endTime = performance.now();
        const duration = endTime - startTime;

        // Log performance metric
        if (typeof window !== 'undefined' && window.performance) {
          console.debug(
            `[useJournalEntries] Fetched ${sorted.length} entries in ${duration.toFixed(2)}ms`,
          );
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('[useJournalEntries] Error fetching entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  return { entries, isLoading, error };
}
