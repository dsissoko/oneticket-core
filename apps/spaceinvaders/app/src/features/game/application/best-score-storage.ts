import { logger } from '@/lib/logger';

export interface BestScoreStorage {
  getBestScore: () => number;
  setBestScore: (score: number) => void;
}

const BEST_SCORE_KEY = 'spaceinvaders.bestScore';

function normalizeScore(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.floor(parsed);
}

export function createBestScoreStorage(
  key = BEST_SCORE_KEY,
  storage: Pick<Storage, 'getItem' | 'setItem'> | null =
    typeof window !== 'undefined' ? window.localStorage : null,
): BestScoreStorage {
  return {
    getBestScore: () => {
      if (!storage) return 0;

      try {
        return normalizeScore(storage.getItem(key));
      } catch (error) {
        logger.warn('[best-score-storage] failed reading best score', error);
        return 0;
      }
    },
    setBestScore: (score: number) => {
      if (!storage) return;

      const normalizedScore = normalizeScore(score);
      try {
        storage.setItem(key, String(normalizedScore));
      } catch (error) {
        logger.warn('[best-score-storage] failed writing best score', error);
      }
    },
  };
}

export { BEST_SCORE_KEY };
