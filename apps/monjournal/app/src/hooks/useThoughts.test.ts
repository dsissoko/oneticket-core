import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThoughts } from './useThoughts';
import type { Thought } from '../models/thoughtModel';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useThoughts', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty array when localStorage key is missing', () => {
      const { result } = renderHook(() => useThoughts());
      expect(result.current.thoughts).toEqual([]);
    });

    it('should load thoughts from localStorage on mount', () => {
      const mockThoughts: Thought[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Morning reflection',
          content: 'Woke up early, feeling productive.',
          createdAt: 1717459200000,
          tags: ['personal', 'morning'],
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Work deadline',
          content: 'Finished the project milestone on time.',
          createdAt: 1717545600000,
          tags: ['work'],
        },
      ];

      localStorage.setItem('monjournal_thoughts', JSON.stringify(mockThoughts));

      const { result } = renderHook(() => useThoughts());

      expect(result.current.thoughts).toEqual(mockThoughts);
    });

    it('should filter out invalid thoughts on load', () => {
      const validThought: Thought = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Valid thought',
        content: 'This is valid.',
        createdAt: 1717459200000,
        tags: [],
      };

      const invalidThought = {
        id: '', // Invalid: empty id
        title: 'Invalid thought',
        content: 'Missing id',
        createdAt: 1717459200000,
        tags: [],
      };

      const mixed = [validThought, invalidThought];
      localStorage.setItem('monjournal_thoughts', JSON.stringify(mixed));

      const { result } = renderHook(() => useThoughts());

      expect(result.current.thoughts).toEqual([validThought]);
    });
  });

  describe('Data Validation', () => {
    it('should reset to empty array if localStorage contains non-array JSON', () => {
      localStorage.setItem('monjournal_thoughts', JSON.stringify({ thoughts: [] }));

      const { result } = renderHook(() => useThoughts());

      expect(result.current.thoughts).toEqual([]);
    });

    it('should reset to empty array if localStorage contains corrupted JSON', () => {
      localStorage.setItem('monjournal_thoughts', 'invalid json{]');

      const { result } = renderHook(() => useThoughts());

      expect(result.current.thoughts).toEqual([]);
    });

    it('should validate thought fields on load', () => {
      const thoughtWithMissingField = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        // Missing content
        createdAt: 1717459200000,
        tags: [],
      };

      localStorage.setItem('monjournal_thoughts', JSON.stringify([thoughtWithMissingField]));

      const { result } = renderHook(() => useThoughts());

      expect(result.current.thoughts).toEqual([]);
    });

    it('should validate that createdAt is a number', () => {
      const thoughtWithInvalidTimestamp = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        content: 'Content',
        createdAt: '1717459200000', // Should be number
        tags: [],
      };

      localStorage.setItem('monjournal_thoughts', JSON.stringify([thoughtWithInvalidTimestamp]));

      const { result } = renderHook(() => useThoughts());

      expect(result.current.thoughts).toEqual([]);
    });

    it('should validate that tags is an array of strings', () => {
      const thoughtWithInvalidTags = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        content: 'Content',
        createdAt: 1717459200000,
        tags: ['valid', 123], // Second element is not a string
      };

      localStorage.setItem('monjournal_thoughts', JSON.stringify([thoughtWithInvalidTags]));

      const { result } = renderHook(() => useThoughts());

      expect(result.current.thoughts).toEqual([]);
    });
  });

  describe('addThought', () => {
    it('should add a thought and persist to localStorage', () => {
      const { result } = renderHook(() => useThoughts());

      const newThought: Thought = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'New thought',
        content: 'This is a new thought.',
        createdAt: 1717459200000,
        tags: ['personal'],
      };

      act(() => {
        result.current.addThought(newThought);
      });

      expect(result.current.thoughts).toContain(newThought);
      expect(result.current.thoughts).toHaveLength(1);

      // Verify it was persisted to localStorage
      const stored = localStorage.getItem('monjournal_thoughts');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).toContainEqual(newThought);
    });

    it('should add multiple thoughts and persist all of them', () => {
      const { result } = renderHook(() => useThoughts());

      const thought1: Thought = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Thought 1',
        content: 'Content 1',
        createdAt: 1717459200000,
        tags: [],
      };

      const thought2: Thought = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Thought 2',
        content: 'Content 2',
        createdAt: 1717459201000,
        tags: ['work'],
      };

      act(() => {
        result.current.addThought(thought1);
        result.current.addThought(thought2);
      });

      expect(result.current.thoughts).toHaveLength(2);
      expect(result.current.thoughts).toContainEqual(thought1);
      expect(result.current.thoughts).toContainEqual(thought2);

      // Verify persistence
      const stored = localStorage.getItem('monjournal_thoughts');
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(2);
    });

    it('should handle localStorage unavailability gracefully', () => {
      const { result } = renderHook(() => useThoughts());

      // Mock localStorage.setItem to throw an error
      const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const newThought: Thought = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        content: 'Content',
        createdAt: 1717459200000,
        tags: [],
      };

      // Should not throw, but log warning
      expect(() => {
        act(() => {
          result.current.addThought(newThought);
        });
      }).not.toThrow();

      // Verify warning was logged
      expect(consoleSpy).toHaveBeenCalled();

      // Thought should still be in memory
      expect(result.current.thoughts).toContainEqual(newThought);

      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle localStorage quota exceeded gracefully', () => {
      const { result } = renderHook(() => useThoughts());

      // Mock localStorage.setItem to throw QuotaExceededError
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';

      const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw error;
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const newThought: Thought = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        content: 'Content',
        createdAt: 1717459200000,
        tags: [],
      };

      act(() => {
        result.current.addThought(newThought);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[useThoughts] localStorage quota exceeded')
      );

      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('getTags', () => {
    it('should return empty array when no thoughts exist', () => {
      const { result } = renderHook(() => useThoughts());

      expect(result.current.getTags()).toEqual([]);
    });

    it('should derive tags from thoughts', () => {
      const { result } = renderHook(() => useThoughts());

      const thought1: Thought = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Thought 1',
        content: 'Content 1',
        createdAt: 1717459200000,
        tags: ['work', 'urgent'],
      };

      const thought2: Thought = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Thought 2',
        content: 'Content 2',
        createdAt: 1717459201000,
        tags: ['work', 'personal'],
      };

      act(() => {
        result.current.addThought(thought1);
        result.current.addThought(thought2);
      });

      const tags = result.current.getTags();
      expect(tags).toHaveLength(3);
      expect(tags.map((t: { name: string }) => t.name).sort()).toEqual(['personal', 'urgent', 'work']);
    });
  });

  describe('getThoughts', () => {
    it('should return the current thoughts array', () => {
      const { result } = renderHook(() => useThoughts());

      const thought: Thought = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
        content: 'Content',
        createdAt: 1717459200000,
        tags: [],
      };

      act(() => {
        result.current.addThought(thought);
      });

      const thoughts = result.current.getThoughts();
      expect(thoughts).toEqual([thought]);
    });

    it('should return the same reference as thoughts property', () => {
      const { result } = renderHook(() => useThoughts());

      expect(result.current.getThoughts()).toEqual(result.current.thoughts);
    });
  });

  describe('Integration', () => {
    it('should load persisted thoughts on new hook instance', () => {
      const { result: result1 } = renderHook(() => useThoughts());

      const thought: Thought = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Persistent thought',
        content: 'This should persist.',
        createdAt: 1717459200000,
        tags: ['important'],
      };

      act(() => {
        result1.current.addThought(thought);
      });

      // Verify it was added and persisted
      expect(result1.current.thoughts).toContainEqual(thought);

      // Verify it's in localStorage
      const stored = localStorage.getItem('monjournal_thoughts');
      expect(stored).not.toBeNull();

      // Create a new hook instance (simulating app reload)
      const { result: result2 } = renderHook(() => useThoughts());

      // Should automatically load the persisted thought on mount
      expect(result2.current.thoughts).toHaveLength(1);
      expect(result2.current.thoughts).toContainEqual(thought);
    });

    it('should handle complete workflow: add, persist, load, derive tags', () => {
      const { result: result1 } = renderHook(() => useThoughts());

      const thought1: Thought = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'First thought',
        content: 'Getting started',
        createdAt: 1717459200000,
        tags: ['start', 'important'],
      };

      const thought2: Thought = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Second thought',
        content: 'More progress',
        createdAt: 1717459201000,
        tags: ['start', 'progress'],
      };

      // Add thoughts
      act(() => {
        result1.current.addThought(thought1);
        result1.current.addThought(thought2);
      });

      // Verify thoughts
      expect(result1.current.getThoughts()).toHaveLength(2);

      // Derive and verify tags
      const tags = result1.current.getTags();
      expect(tags).toHaveLength(3);
      expect(tags.map((t: { name: string }) => t.name).sort()).toEqual(['important', 'progress', 'start']);

      // Simulate reload with new hook instance
      const { result: result2 } = renderHook(() => useThoughts());

      // Should load everything
      expect(result2.current.getThoughts()).toHaveLength(2);
      expect(result2.current.getTags()).toHaveLength(3);
    });
  });
});
