import { logger } from '@/lib/logger';
import {
  createBestScoreStorage,
  type BestScoreStorage,
} from '@/features/game/application/best-score-storage';

const DEFAULT_POINTS_PER_ALIEN = 10;

export interface ScoreSnapshot {
  currentScore: number;
  bestScore: number;
}

export interface ScoreService {
  getSnapshot: () => ScoreSnapshot;
  onAlienDestroyed: (points?: number) => ScoreSnapshot;
  resetRun: () => ScoreSnapshot;
}

function normalizePoints(points: number): number {
  if (!Number.isFinite(points) || points <= 0) {
    return DEFAULT_POINTS_PER_ALIEN;
  }

  return Math.floor(points);
}

export function createScoreService(
  storage: BestScoreStorage = createBestScoreStorage(),
): ScoreService {
  let currentScore = 0;
  let bestScore = storage.getBestScore();

  const getSnapshot = (): ScoreSnapshot => ({ currentScore, bestScore });

  return {
    getSnapshot,
    onAlienDestroyed: (points = DEFAULT_POINTS_PER_ALIEN) => {
      currentScore += normalizePoints(points);

      if (currentScore > bestScore) {
        bestScore = currentScore;
        storage.setBestScore(bestScore);
        logger.info('[score-service] best score persisted', { bestScore });
      }

      return getSnapshot();
    },
    resetRun: () => {
      currentScore = 0;
      bestScore = Math.max(bestScore, storage.getBestScore());
      return getSnapshot();
    },
  };
}
