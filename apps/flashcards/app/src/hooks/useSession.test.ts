import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSession } from './useSession';

// Mock localStorage using vi.stubGlobal (ESM-safe, configurable)
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
};

describe('useSession', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('initial state', () => {
    it('starts with currentIndex at 0', () => {
      const { result } = renderHook(() => useSession());
      expect(result.current.currentIndex).toBe(0);
    });

    it('starts with empty results array', () => {
      const { result } = renderHook(() => useSession());
      expect(result.current.results).toEqual([]);
    });

    it('starts with null themeId and mode', () => {
      const { result } = renderHook(() => useSession());
      expect(result.current.themeId).toBeNull();
      expect(result.current.mode).toBeNull();
    });
  });

  describe('recordResult', () => {
    it('adds a SessionResult to results array', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.recordResult('card-1', true);
      });

      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0]).toMatchObject({
        cardId: 'card-1',
        known: true,
      });
      expect(typeof result.current.results[0].timestamp).toBe('number');
    });

    it('records unknown result correctly', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.recordResult('card-2', false);
      });

      expect(result.current.results[0].known).toBe(false);
    });

    it('accumulates multiple results', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.recordResult('card-1', true);
        result.current.recordResult('card-2', false);
        result.current.recordResult('card-3', true);
      });

      expect(result.current.results).toHaveLength(3);
    });
  });

  describe('nextCard / previousCard', () => {
    it('increments currentIndex with nextCard', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.nextCard();
      });

      expect(result.current.currentIndex).toBe(1);
    });

    it('decrements currentIndex with previousCard', () => {
      const { result } = renderHook(() => useSession());

      // First go forward
      act(() => {
        result.current.nextCard();
        result.current.nextCard();
      });

      // Then go back
      act(() => {
        result.current.previousCard();
      });

      expect(result.current.currentIndex).toBe(1);
    });

    it('previousCard does not go below 0', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.previousCard();
      });

      expect(result.current.currentIndex).toBe(0);
    });
  });

  describe('resetSession', () => {
    it('resets currentIndex to 0', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.nextCard();
        result.current.nextCard();
        result.current.resetSession();
      });

      expect(result.current.currentIndex).toBe(0);
    });

    it('clears results array', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.recordResult('card-1', true);
        result.current.recordResult('card-2', false);
        result.current.resetSession();
      });

      expect(result.current.results).toEqual([]);
    });
  });

  describe('setPreferences', () => {
    it('sets themeId and mode', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.setPreferences('theme-dark', 'flip');
      });

      expect(result.current.themeId).toBe('theme-dark');
      expect(result.current.mode).toBe('flip');
    });

    it('can update themeId', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.setPreferences('theme-light', 'spaced-repetition');
      });

      act(() => {
        result.current.setPreferences('theme-dark', 'spaced-repetition');
      });

      expect(result.current.themeId).toBe('theme-dark');
      expect(result.current.mode).toBe('spaced-repetition');
    });
  });

  describe('localStorage persistence', () => {
    it('persists results to localStorage', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.recordResult('card-1', true);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'flashcards-session',
        expect.stringContaining('"cardId":"card-1"')
      );
    });

    it('persists preferences to localStorage', () => {
      const { result } = renderHook(() => useSession());

      act(() => {
        result.current.setPreferences('theme-dark', 'flip');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'flashcards-preferences',
        expect.stringContaining('"themeId":"theme-dark"')
      );
    });

    it('loads persisted results on mount', () => {
      // Pre-populate localStorage
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'flashcards-session') {
          return JSON.stringify({ results: [{ cardId: 'loaded-card', known: true, timestamp: 12345 }] });
        }
        return null;
      });

      const { result } = renderHook(() => useSession());

      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].cardId).toBe('loaded-card');
    });

    it('loads persisted preferences on mount', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'flashcards-preferences') {
          return JSON.stringify({ themeId: 'loaded-theme', mode: 'spaced-repetition' });
        }
        return null;
      });

      const { result } = renderHook(() => useSession());

      expect(result.current.themeId).toBe('loaded-theme');
      expect(result.current.mode).toBe('spaced-repetition');
    });

    it('gracefully handles malformed localStorage data', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'flashcards-session') {
          return 'not-valid-json';
        }
        return null;
      });

      const { result } = renderHook(() => useSession());

      // Should not throw, defaults to empty state
      expect(result.current.results).toEqual([]);
    });
  });
});