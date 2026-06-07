import { describe, expect, it, vi } from 'vitest';
import { createBestScoreStorage } from '@/features/game/application/best-score-storage';
import { createScoreService } from '@/features/game/application/score-service';

describe('score-service', () => {
  it('loads best score from persistence at startup', () => {
    const storage = {
      getItem: vi.fn(() => '120'),
      setItem: vi.fn(),
    };

    const service = createScoreService(createBestScoreStorage('best', storage));

    expect(service.getSnapshot()).toEqual({
      currentScore: 0,
      bestScore: 120,
    });
  });

  it('increments score on alien destruction and persists best score updates', () => {
    const storage = {
      getItem: vi.fn(() => '0'),
      setItem: vi.fn(),
    };

    const service = createScoreService(createBestScoreStorage('best', storage));
    const afterFirstKill = service.onAlienDestroyed();

    expect(afterFirstKill).toEqual({ currentScore: 10, bestScore: 10 });
    expect(storage.setItem).toHaveBeenCalledWith('best', '10');

    service.onAlienDestroyed(5);
    expect(service.getSnapshot()).toEqual({ currentScore: 15, bestScore: 15 });
    expect(storage.setItem).toHaveBeenLastCalledWith('best', '15');
  });

  it('keeps best score and avoids persistence writes when score does not exceed it', () => {
    const storage = {
      getItem: vi.fn(() => '50'),
      setItem: vi.fn(),
    };

    const service = createScoreService(createBestScoreStorage('best', storage));
    service.onAlienDestroyed();
    service.onAlienDestroyed();

    expect(service.getSnapshot()).toEqual({ currentScore: 20, bestScore: 50 });
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('resets current score on restart while preserving best score', () => {
    const storage = {
      getItem: vi.fn(() => '0'),
      setItem: vi.fn(),
    };

    const service = createScoreService(createBestScoreStorage('best', storage));
    service.onAlienDestroyed();
    service.onAlienDestroyed();

    const resetSnapshot = service.resetRun();
    expect(resetSnapshot).toEqual({ currentScore: 0, bestScore: 20 });
    expect(storage.getItem).toHaveBeenCalledTimes(2);
  });
});
