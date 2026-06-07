import { describe, expect, it, vi } from 'vitest';
import { ScoreService } from '@/game/services/ScoreService';

function createMockStorage(initialBestScore: string | null = null): Pick<Storage, 'getItem' | 'setItem'> {
  const data = new Map<string, string>();

  if (initialBestScore !== null) {
    data.set('spaceinvaders.best-score', initialBestScore);
  }

  const getItem = vi.fn((key: string) => data.get(key) ?? null);
  const setItem = vi.fn((key: string, value: string) => {
    data.set(key, value);
  });

  return {
    getItem,
    setItem,
  };
}

describe('ScoreService', () => {
  it('reads best score from storage at startup', () => {
    const storage = createMockStorage('120');
    const service = new ScoreService(storage);

    expect(service.getBestScore()).toBe(120);
  });

  it('falls back to zero for invalid persisted scores', () => {
    const storage = createMockStorage('invalid-score');
    const service = new ScoreService(storage);

    expect(service.getBestScore()).toBe(0);
  });

  it('handles unavailable localStorage reads defensively', () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error('read blocked');
      }),
      setItem: vi.fn(),
    };

    const service = new ScoreService(storage);

    expect(service.getBestScore()).toBe(0);
  });

  it('updates best score only when run ends with a higher score', () => {
    const storage = createMockStorage('20');
    const service = new ScoreService(storage);

    service.addPoints(10);
    service.finalizeRun();
    expect(service.getBestScore()).toBe(20);

    service.resetCurrentScore();
    service.addPoints(45);
    service.finalizeRun();

    expect(service.getBestScore()).toBe(45);
    expect(storage.setItem).toHaveBeenCalledWith('spaceinvaders.best-score', '45');
  });

  it('handles unavailable localStorage writes defensively', () => {
    const storage = {
      getItem: vi.fn(() => '5'),
      setItem: vi.fn(() => {
        throw new Error('write blocked');
      }),
    };

    const service = new ScoreService(storage);
    service.addPoints(10);

    expect(() => service.finalizeRun()).not.toThrow();
    expect(service.getBestScore()).toBe(10);
  });
});
