import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThoughts } from './useThoughts';
import { createThought } from '../models/thoughtModel';
import { useLocalStorageGetItem, useLocalStorageSetItem } from './useLocalStorage';

// Mock localStorage
vi.mock('./useLocalStorage');

describe('useThoughts', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Mock empty localStorage by default
    (useLocalStorageGetItem as any).mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('initializes with empty thoughts when localStorage is empty', () => {
      (useLocalStorageGetItem as any).mockReturnValue(null);
      const { result } = renderHook(() => useThoughts());
      expect(result.current.thoughts).toEqual([]);
    });

    it('loads thoughts from localStorage on mount', () => {
      const storedThought = createThought('Stored Title', 'Stored Content', [
        'tag1',
      ]);
      (useLocalStorageGetItem as any).mockReturnValue([storedThought]);

      const { result } = renderHook(() => useThoughts());
      expect(result.current.thoughts).toHaveLength(1);
      expect(result.current.thoughts[0].title).toBe('Stored Title');
    });

    it('handles invalid localStorage data gracefully', () => {
      (useLocalStorageGetItem as any).mockReturnValue(null);
      const { result } = renderHook(() => useThoughts());
      expect(result.current.thoughts).toEqual([]);
    });
  });

  describe('addThought', () => {
    it('adds a thought to the array', () => {
      (useLocalStorageGetItem as any).mockReturnValue(null);
      const { result } = renderHook(() => useThoughts());

      const newThought = createThought('New Title', 'New Content');
      act(() => {
        result.current.addThought(newThought);
      });

      expect(result.current.thoughts).toHaveLength(1);
      expect(result.current.thoughts[0]).toEqual(newThought);
    });

    it('adds new thought to the front (newest first)', () => {
      const firstThought = createThought('First', 'Content 1');
      (useLocalStorageGetItem as any).mockReturnValue([firstThought]);

      const { result } = renderHook(() => useThoughts());

      const secondThought = createThought('Second', 'Content 2');
      act(() => {
        result.current.addThought(secondThought);
      });

      expect(result.current.thoughts).toHaveLength(2);
      expect(result.current.thoughts[0]).toEqual(secondThought);
      expect(result.current.thoughts[1]).toEqual(firstThought);
    });

    it('persists thought to localStorage', () => {
      (useLocalStorageGetItem as any).mockReturnValue(null);
      const { result } = renderHook(() => useThoughts());

      const newThought = createThought('Title', 'Content');
      act(() => {
        result.current.addThought(newThought);
      });

      expect(useLocalStorageSetItem).toHaveBeenCalled();
      const callArgs = (useLocalStorageSetItem as any).mock.calls[1]; // First call is from effect
      expect(callArgs[0]).toBe('monjournal_thoughts');
      expect(callArgs[1]).toHaveLength(1);
    });
  });

  describe('getThoughts', () => {
    it('returns current thoughts', () => {
      const storedThought = createThought('Stored', 'Content', ['tag1']);
      (useLocalStorageGetItem as any).mockReturnValue([storedThought]);

      const { result } = renderHook(() => useThoughts());
      const thoughts = result.current.getThoughts();

      expect(thoughts).toHaveLength(1);
      expect(thoughts[0]).toEqual(storedThought);
    });

    it('returns empty array initially', () => {
      (useLocalStorageGetItem as any).mockReturnValue(null);
      const { result } = renderHook(() => useThoughts());
      expect(result.current.getThoughts()).toEqual([]);
    });
  });

  describe('getTags', () => {
    it('returns empty array when no thoughts', () => {
      (useLocalStorageGetItem as any).mockReturnValue(null);
      const { result } = renderHook(() => useThoughts());
      const tags = result.current.getTags();
      expect(tags).toEqual([]);
    });

    it('derives unique tags from thoughts', () => {
      const thoughts = [
        createThought('T1', 'C1', ['work', 'urgent']),
        createThought('T2', 'C2', ['personal']),
        createThought('T3', 'C3', ['work']),
      ];
      (useLocalStorageGetItem as any).mockReturnValue(thoughts);

      const { result } = renderHook(() => useThoughts());
      const tags = result.current.getTags();

      expect(tags).toHaveLength(3);
      expect(tags.map((t) => t.name).sort()).toEqual([
        'personal',
        'urgent',
        'work',
      ]);
    });

    it('includes color for each tag', () => {
      const thoughts = [createThought('T1', 'C1', ['work'])];
      (useLocalStorageGetItem as any).mockReturnValue(thoughts);

      const { result } = renderHook(() => useThoughts());
      const tags = result.current.getTags();

      expect(tags[0].color).toBeDefined();
      expect(typeof tags[0].color).toBe('string');
    });
  });

  describe('filterThoughts', () => {
    beforeEach(() => {
      const thoughts = [
        createThought('Work Meeting', 'Discussed deadlines', ['work', 'urgent']),
        createThought('Personal Note', 'Vacation plans', ['personal']),
        createThought('Shopping', 'Milk, eggs', []),
      ];
      (useLocalStorageGetItem as any).mockReturnValue(thoughts);
    });

    it('returns all thoughts with empty filters', () => {
      const { result } = renderHook(() => useThoughts());
      const filtered = result.current.filterThoughts({});
      expect(filtered).toHaveLength(3);
    });

    it('filters by text search', () => {
      const { result } = renderHook(() => useThoughts());
      const filtered = result.current.filterThoughts({ text: 'work' });
      expect(filtered.length).toBeGreaterThan(0);
      expect(
        filtered.some(
          (t) =>
            t.title.toLowerCase().includes('work') ||
            t.content.toLowerCase().includes('work')
        )
      ).toBe(true);
    });

    it('filters by tags', () => {
      const { result } = renderHook(() => useThoughts());
      const filtered = result.current.filterThoughts({
        selectedTags: ['work'],
      });
      expect(filtered.every((t) => t.tags.includes('work'))).toBe(true);
    });

    it('filters by date range', () => {
      const { result } = renderHook(() => useThoughts());
      const now = Date.now();
      const filtered = result.current.filterThoughts({
        dateStart: now - 1000,
        dateEnd: now + 1000,
      });
      // All thoughts created "now" should be in range
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('combines filters with AND logic', () => {
      const { result } = renderHook(() => useThoughts());
      const filtered = result.current.filterThoughts({
        text: 'work',
        selectedTags: ['urgent'],
      });
      // Only "Work Meeting" has both "work" text and "urgent" tag
      expect(filtered.length).toBeLessThanOrEqual(1);
    });
  });

  describe('localStorage persistence', () => {
    it('persists to localStorage after adding thought', () => {
      (useLocalStorageGetItem as any).mockReturnValue(null);
      const { result } = renderHook(() => useThoughts());

      const thought = createThought('Title', 'Content');
      act(() => {
        result.current.addThought(thought);
      });

      expect(useLocalStorageSetItem).toHaveBeenCalledWith(
        'monjournal_thoughts',
        expect.any(Array)
      );
    });

    it('uses monjournal_thoughts as storage key', () => {
      (useLocalStorageGetItem as any).mockReturnValue(null);
      renderHook(() => useThoughts());
      expect(useLocalStorageGetItem).toHaveBeenCalledWith(
        'monjournal_thoughts'
      );
    });
  });
});
