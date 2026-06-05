/**
 * Tests for useThoughts React hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThoughts } from './useThoughts';
import { createThought } from '../models/thoughtModel';
import { getItem, setItem } from './useLocalStorage';

// Mock useLocalStorage
vi.mock('./useLocalStorage', () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
}));

describe('useThoughts', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with empty array when localStorage is empty', () => {
      vi.mocked(getItem).mockReturnValueOnce(null);

      const { result } = renderHook(() => useThoughts());

      expect(result.current.thoughts).toEqual([]);
      expect(result.current.getThoughts()).toEqual([]);
    });

    it('should load thoughts from localStorage on mount', () => {
      const mockThoughts = [
        {
          id: '1',
          title: 'First thought',
          content: 'Content 1',
          createdAt: 1000,
          tags: ['tag1'],
        },
        {
          id: '2',
          title: 'Second thought',
          content: 'Content 2',
          createdAt: 2000,
          tags: ['tag2'],
        },
      ];

      vi.mocked(getItem).mockReturnValueOnce(mockThoughts);

      const { result } = renderHook(() => useThoughts());

      expect(result.current.thoughts).toEqual(mockThoughts);
    });

    it('should initialize to empty array if localStorage data is not an array', () => {
      vi.mocked(getItem).mockReturnValueOnce({ notAnArray: true });
      const consoleSpy = vi.spyOn(console, 'warn');

      const { result } = renderHook(() => useThoughts());

      expect(result.current.thoughts).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'localStorage data is not an array, resetting to empty'
      );
    });

    it('should filter out invalid thoughts on load', () => {
      const mockData = [
        {
          id: '1',
          title: 'Valid',
          content: 'Content',
          createdAt: 1000,
          tags: [],
        },
        {
          id: '',
          title: 'Invalid - empty id',
          content: 'Content',
          createdAt: 1000,
          tags: [],
        },
        {
          id: '3',
          title: 'Valid 2',
          content: 'Content 2',
          createdAt: 2000,
          tags: ['tag'],
        },
      ];

      vi.mocked(getItem).mockReturnValueOnce(mockData);
      const consoleSpy = vi.spyOn(console, 'warn');

      const { result } = renderHook(() => useThoughts());

      expect(result.current.thoughts).toHaveLength(2);
      expect(result.current.thoughts[0].id).toBe('1');
      expect(result.current.thoughts[1].id).toBe('3');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('addThought', () => {
    it('should add a thought and persist to localStorage', () => {
      vi.mocked(getItem).mockReturnValueOnce(null);

      const { result } = renderHook(() => useThoughts());

      const newThought = {
        id: 'new-id',
        title: 'New thought',
        content: 'New content',
        createdAt: Date.now(),
        tags: ['new'],
      };

      act(() => {
        result.current.addThought(newThought);
      });

      expect(result.current.thoughts).toContain(newThought);
      expect(vi.mocked(setItem)).toHaveBeenCalledWith(
        'monjournal_thoughts',
        [newThought]
      );
    });

    it('should append to existing thoughts', () => {
      const existingThought = {
        id: '1',
        title: 'Existing',
        content: 'Content',
        createdAt: 1000,
        tags: [],
      };

      vi.mocked(getItem).mockReturnValueOnce([existingThought]);

      const { result } = renderHook(() => useThoughts());

      const newThought = {
        id: '2',
        title: 'New',
        content: 'Content',
        createdAt: 2000,
        tags: [],
      };

      act(() => {
        result.current.addThought(newThought);
      });

      expect(result.current.thoughts).toHaveLength(2);
      expect(result.current.thoughts[0]).toEqual(existingThought);
      expect(result.current.thoughts[1]).toEqual(newThought);
    });

    it('should persist multiple additions', () => {
      vi.mocked(getItem).mockReturnValueOnce(null);

      const { result } = renderHook(() => useThoughts());

      const thought1 = {
        id: '1',
        title: 'First',
        content: 'Content 1',
        createdAt: 1000,
        tags: [],
      };

      const thought2 = {
        id: '2',
        title: 'Second',
        content: 'Content 2',
        createdAt: 2000,
        tags: [],
      };

      act(() => {
        result.current.addThought(thought1);
      });

      act(() => {
        result.current.addThought(thought2);
      });

      expect(result.current.thoughts).toHaveLength(2);
      expect(vi.mocked(setItem)).toHaveBeenCalledTimes(2);
    });

    it('should maintain immutability when adding thoughts', () => {
      vi.mocked(getItem).mockReturnValueOnce(null);

      const { result } = renderHook(() => useThoughts());

      const newThought = createThought('Title', 'Content', ['tag']);

      act(() => {
        result.current.addThought(newThought);
      });

      // Try to mutate the original
      expect(() => {
        (newThought as any).title = 'Changed';
      }).toThrow();
    });
  });

  describe('getTags', () => {
    it('should return empty array for no thoughts', () => {
      vi.mocked(getItem).mockReturnValueOnce(null);

      const { result } = renderHook(() => useThoughts());

      const tags = result.current.getTags();

      expect(tags).toEqual([]);
    });

    it('should derive unique tags from thoughts', () => {
      const mockThoughts = [
        {
          id: '1',
          title: 'Thought 1',
          content: 'Content',
          createdAt: 1000,
          tags: ['personal', 'morning'],
        },
        {
          id: '2',
          title: 'Thought 2',
          content: 'Content',
          createdAt: 2000,
          tags: ['personal', 'evening'],
        },
      ];

      vi.mocked(getItem).mockReturnValueOnce(mockThoughts);

      const { result } = renderHook(() => useThoughts());

      const tags = result.current.getTags();

      expect(tags).toHaveLength(3);
      const tagNames = tags.map((t) => t.name).sort();
      expect(tagNames).toEqual(['evening', 'morning', 'personal']);
    });

    it('should assign consistent colors to tags', () => {
      const mockThoughts = [
        {
          id: '1',
          title: 'Thought 1',
          content: 'Content',
          createdAt: 1000,
          tags: ['work', 'productivity'],
        },
      ];

      vi.mocked(getItem).mockReturnValueOnce(mockThoughts);

      const { result } = renderHook(() => useThoughts());

      const tags1 = result.current.getTags();
      const workTag1 = tags1.find((t) => t.name === 'work');

      // Call getTags again, should get same color
      const tags2 = result.current.getTags();
      const workTag2 = tags2.find((t) => t.name === 'work');

      expect(workTag1?.color).toBe(workTag2?.color);
    });

    it('should return tags with hex color strings', () => {
      const mockThoughts = [
        {
          id: '1',
          title: 'Thought 1',
          content: 'Content',
          createdAt: 1000,
          tags: ['test'],
        },
      ];

      vi.mocked(getItem).mockReturnValueOnce(mockThoughts);

      const { result } = renderHook(() => useThoughts());

      const tags = result.current.getTags();

      expect(tags).toHaveLength(1);
      expect(tags[0].color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should return tags sorted alphabetically', () => {
      const mockThoughts = [
        {
          id: '1',
          title: 'Thought 1',
          content: 'Content',
          createdAt: 1000,
          tags: ['zebra', 'apple', 'banana'],
        },
      ];

      vi.mocked(getItem).mockReturnValueOnce(mockThoughts);

      const { result } = renderHook(() => useThoughts());

      const tags = result.current.getTags();
      const tagNames = tags.map((t) => t.name);

      expect(tagNames).toEqual(['apple', 'banana', 'zebra']);
    });
  });

  describe('getThoughts', () => {
    it('should return current thoughts array', () => {
      const mockThoughts = [
        {
          id: '1',
          title: 'Thought 1',
          content: 'Content',
          createdAt: 1000,
          tags: [],
        },
      ];

      vi.mocked(getItem).mockReturnValueOnce(mockThoughts);

      const { result } = renderHook(() => useThoughts());

      expect(result.current.getThoughts()).toEqual(mockThoughts);
    });

    it('should reflect changes after addThought', () => {
      vi.mocked(getItem).mockReturnValueOnce(null);

      const { result } = renderHook(() => useThoughts());

      const newThought = {
        id: '1',
        title: 'New thought',
        content: 'Content',
        createdAt: 1000,
        tags: [],
      };

      act(() => {
        result.current.addThought(newThought);
      });

      expect(result.current.getThoughts()).toEqual([newThought]);
    });
  });

  describe('edge cases', () => {
    it('should handle corrupted JSON in localStorage', () => {
      vi.mocked(getItem).mockReturnValueOnce(null);
      const consoleSpy = vi.spyOn(console, 'warn');

      const { result } = renderHook(() => useThoughts());

      expect(result.current.thoughts).toEqual([]);
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should handle thoughts with empty tags array', () => {
      const mockThoughts = [
        {
          id: '1',
          title: 'Thought with no tags',
          content: 'Content',
          createdAt: 1000,
          tags: [],
        },
      ];

      vi.mocked(getItem).mockReturnValueOnce(mockThoughts);

      const { result } = renderHook(() => useThoughts());

      expect(result.current.getTags()).toEqual([]);
    });

    it('should handle duplicate tags correctly', () => {
      const mockThoughts = [
        {
          id: '1',
          title: 'Thought 1',
          content: 'Content',
          createdAt: 1000,
          tags: ['work', 'work', 'coding'],
        },
      ];

      vi.mocked(getItem).mockReturnValueOnce(mockThoughts);

      const { result } = renderHook(() => useThoughts());

      const tags = result.current.getTags();
      const tagNames = tags.map((t) => t.name);

      // Should have unique tags only
      expect(tagNames).toEqual(['coding', 'work']);
    });

    it('should handle very long content', () => {
      const longContent = 'x'.repeat(10000);
      const thought = {
        id: '1',
        title: 'Long thought',
        content: longContent,
        createdAt: 1000,
        tags: [],
      };

      vi.mocked(getItem).mockReturnValueOnce([thought]);

      const { result } = renderHook(() => useThoughts());

      expect(result.current.thoughts[0].content).toBe(longContent);
    });
  });
});
