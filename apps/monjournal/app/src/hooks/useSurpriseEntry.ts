/**
 * Hook: useSurpriseEntry
 *
 * Manages the state and logic for the Surprise feature, which displays
 * a randomly selected journal entry from the user's history.
 *
 * Provides functions to:
 * - Select a new random entry (getSurprise)
 * - Navigate to the next random entry (nextSurprise)
 * - Return to the timeline (goBack)
 *
 * Handles empty state gracefully when no entries are available.
 * Performance target: < 50ms for random selection (even with 1000+ entries).
 */

import { useCallback, useState } from 'react';
import type { JournalEntry } from '../domain/Entry';
import { selectRandom } from '../domain/RandomSelector';

/**
 * State returned by useSurpriseEntry hook
 */
export interface UseSurpriseEntryState {
  surpriseEntry: JournalEntry | null; // Currently displayed entry, or null if no entry selected
  getSurprise: () => void; // Select and display a new random entry
  nextSurprise: () => void; // Alias for getSurprise (user-friendly name)
  goBack: () => void; // Clear surprise state and return to timeline
  isLoading: boolean; // Loading state (unused for localStorage, always false)
  error: string | null; // Error message if no entries available, null otherwise
}

/**
 * Hook to manage the Surprise feature state and operations
 *
 * @param entries - Array of all available journal entries
 * @returns Object containing surprise entry state and control functions
 *
 * @example
 * const { entries } = useJournalEntries();
 * const { surpriseEntry, getSurprise, nextSurprise, goBack, isLoading, error } = useSurpriseEntry(entries);
 *
 * if (error) {
 *   return <div>{error} — Créez votre première entrée</div>;
 * }
 *
 * return (
 *   <div>
 *     <button onClick={getSurprise}>Surprise!</button>
 *     {surpriseEntry && (
 *       <div>
 *         <p>{surpriseEntry.text}</p>
 *         <button onClick={nextSurprise}>Autre surprise</button>
 *         <button onClick={goBack}>Retour</button>
 *       </div>
 *     )}
 *   </div>
 * );
 */
export function useSurpriseEntry(entries: JournalEntry[]): UseSurpriseEntryState {
  const [surpriseEntry, setSurpriseEntry] = useState<JournalEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Determine error state: if no entries, show error message
  const errorState = entries.length === 0 ? 'Aucune entrée trouvée' : null;

  const getSurprise = useCallback(() => {
    const startTime = performance.now();

    try {
      setError(null);

      // Check if entries array is empty
      if (entries.length === 0) {
        setError('Aucune entrée trouvée');
        setSurpriseEntry(null);
        return;
      }

      // Select a random entry using uniform distribution
      const selected = selectRandom(entries);

      if (selected === null) {
        // This should not happen if entries.length > 0, but handle gracefully
        setError('Impossible de sélectionner une entrée');
        setSurpriseEntry(null);
        return;
      }

      // Successfully selected an entry
      setSurpriseEntry(selected);
      setError(null);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Log performance metric
      if (typeof window !== 'undefined' && window.performance) {
        console.debug(
          `[useSurpriseEntry] Selected random entry in ${duration.toFixed(2)}ms`,
        );
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Erreur lors de la sélection aléatoire — ${errorMsg}`);
      setSurpriseEntry(null);
      console.error('[useSurpriseEntry] Error selecting surprise entry:', err);
    }
  }, [entries]);

  const nextSurprise = useCallback(() => {
    // Alias for getSurprise - selects another random entry
    getSurprise();
  }, [getSurprise]);

  const goBack = useCallback(() => {
    // Clear surprise state and return to timeline
    setSurpriseEntry(null);
    setError(null);
  }, []);

  return {
    surpriseEntry,
    getSurprise,
    nextSurprise,
    goBack,
    isLoading: false, // localStorage is synchronous, never truly loading
    error: errorState, // Return current error state (empty entries message)
  };
}
