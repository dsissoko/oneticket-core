import { useCallback } from 'react';

export type LearningMode = 'flip' | 'spaced-repetition';

export interface SchedulingResult {
  nextReviewAt: number | null;
  interval: number;
  easeFactor: number;
}

export interface UseLearningModeResult {
  /**
   * For 'flip' mode: returns null (immediate reveal)
   * For 'spaced-repetition' mode: schedules based on known/unknown
   */
  getDisplayTiming: () => number | null;
  /**
   * Records result and returns updated scheduling info
   */
  recordResult: (known: boolean, cardId: string) => SchedulingResult;
  /**
   * Resets scheduling state for a new session
   */
  reset: () => void;
}

const INITIAL_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const FIRST_INTERVAL_MS = 30_000; // 30 seconds

/**
 * Hook that isolates algorithm logic for flip timing and spaced-repetition scheduling.
 *
 * - 'flip' mode: simple tap to reveal (immediate, no scheduling)
 * - 'spaced-repetition' mode: schedule based on known/unknown results (SM-2 inspired)
 */
export function useLearningMode(mode: LearningMode): UseLearningModeResult {
  // Per-card scheduling state: cardId -> scheduling info
  const cardStateMap = new Map<string, SchedulingResult>();

  const getDisplayTiming = useCallback((): number | null => {
    if (mode === 'flip') {
      return null; // Immediate reveal, no delay
    }
    // spaced-repetition doesn't affect initial display timing
    return null;
  }, [mode]);

  const recordResult = useCallback(
    (known: boolean, cardId: string): SchedulingResult => {
      const existing = cardStateMap.get(cardId);

      if (mode === 'flip') {
        // Flip mode has no scheduling - return neutral values
        return {
          nextReviewAt: null,
          interval: 0,
          easeFactor: INITIAL_EASE_FACTOR,
        };
      }

      // Spaced-repetition scheduling (SM-2 inspired algorithm)
      if (!existing) {
        // First time seeing this card
        const result: SchedulingResult = known
          ? {
              nextReviewAt: Date.now() + FIRST_INTERVAL_MS,
              interval: FIRST_INTERVAL_MS,
              easeFactor: INITIAL_EASE_FACTOR,
            }
          : {
              nextReviewAt: Date.now() + 10_000, // 10 seconds for unknown
              interval: 10_000,
              easeFactor: Math.max(MIN_EASE_FACTOR, INITIAL_EASE_FACTOR - 0.2),
            };
        cardStateMap.set(cardId, result);
        return result;
      }

      // Update existing card's scheduling
      let newEaseFactor = existing.easeFactor;
      let newInterval = existing.interval;

      if (known) {
        // Increase interval based on ease factor
        newInterval = Math.round(existing.interval * newEaseFactor);
        // Bonus for consistently knowing
        newEaseFactor = Math.min(newEaseFactor + 0.1, 3.0);
      } else {
        // Decrease interval and ease factor for unknown
        newInterval = Math.round(existing.interval * 0.5);
        newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor - 0.2);
      }

      const result: SchedulingResult = {
        nextReviewAt: Date.now() + newInterval,
        interval: newInterval,
        easeFactor: newEaseFactor,
      };

      cardStateMap.set(cardId, result);
      return result;
    },
    [mode],
  );

  const reset = useCallback(() => {
    cardStateMap.clear();
  }, []);

  return { getDisplayTiming, recordResult, reset };
}