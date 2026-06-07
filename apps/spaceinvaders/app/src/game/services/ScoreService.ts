const BEST_SCORE_STORAGE_KEY = 'spaceinvaders.best-score';
const MIN_SCORE = 0;

type StorageAdapter = Pick<Storage, 'getItem' | 'setItem'>;

function getStorageAdapter(): StorageAdapter | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export class ScoreService {
  private readonly storage: StorageAdapter | null;

  private currentScore = 0;

  private bestScore = 0;

  constructor(storage: StorageAdapter | null = getStorageAdapter()) {
    this.storage = storage;
    this.bestScore = this.readBestScore();
  }

  public resetCurrentScore(): void {
    this.currentScore = 0;
  }

  public addPoints(points: number): void {
    if (!Number.isFinite(points)) {
      return;
    }

    const safePoints = Math.floor(points);
    if (safePoints <= MIN_SCORE) {
      return;
    }

    this.currentScore += safePoints;

    if (import.meta.env.DEV) {
      console.debug(`[SpaceInvaders] Score updated to ${this.currentScore}`);
    }
  }

  public getCurrentScore(): number {
    return this.currentScore;
  }

  public getBestScore(): number {
    return this.bestScore;
  }

  public finalizeRun(): void {
    if (this.currentScore <= this.bestScore) {
      return;
    }

    this.bestScore = this.currentScore;

    if (import.meta.env.DEV) {
      console.debug(`[SpaceInvaders] New best score persisted: ${this.bestScore}`);
    }

    this.persistBestScore(this.bestScore);
  }

  private readBestScore(): number {
    if (!this.storage) {
      return 0;
    }

    try {
      const rawValue = this.storage.getItem(BEST_SCORE_STORAGE_KEY);
      if (rawValue === null) {
        return 0;
      }

      const parsed = Number(rawValue);
      if (!Number.isFinite(parsed) || parsed < MIN_SCORE || !Number.isInteger(parsed)) {
        if (import.meta.env.DEV) {
          console.warn(`[SpaceInvaders] Invalid best score in storage: ${rawValue}`);
        }

        return 0;
      }

      return parsed;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[SpaceInvaders] Unable to read best score from localStorage', error);
      }

      return 0;
    }
  }

  private persistBestScore(value: number): void {
    if (!this.storage) {
      return;
    }

    try {
      this.storage.setItem(BEST_SCORE_STORAGE_KEY, String(value));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[SpaceInvaders] Unable to persist best score to localStorage', error);
      }
    }
  }
}
