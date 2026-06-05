import { describe, it, expect } from 'vitest';
import {
  FilterState,
  applyFilters,
  matchesTextSearch,
  matchesDateRange,
  matchesTags,
} from './filterLogic';
import { Thought } from '../models/thoughtModel';

// Helper function to create test thoughts
function createTestThought(overrides: Partial<Thought> = {}): Thought {
  return {
    id: 'test-id',
    title: 'Test Title',
    content: 'Test Content',
    createdAt: 1717459200000,
    tags: [],
    ...overrides,
  };
}

describe('filterLogic', () => {
  describe('matchesTextSearch', () => {
    it('returns true for empty query', () => {
      const thought = createTestThought();
      expect(matchesTextSearch(thought, '')).toBe(true);
    });

    it('returns true for whitespace-only query', () => {
      const thought = createTestThought();
      expect(matchesTextSearch(thought, '   ')).toBe(true);
    });

    it('matches query in title (exact case)', () => {
      const thought = createTestThought({ title: 'Morning Run' });
      expect(matchesTextSearch(thought, 'Morning')).toBe(true);
    });

    it('matches query in content (exact case)', () => {
      const thought = createTestThought({ content: 'I went running today' });
      expect(matchesTextSearch(thought, 'running')).toBe(true);
    });

    it('performs case-insensitive matching in title', () => {
      const thought = createTestThought({ title: 'Morning Run' });
      expect(matchesTextSearch(thought, 'morning')).toBe(true);
      expect(matchesTextSearch(thought, 'MORNING')).toBe(true);
      expect(matchesTextSearch(thought, 'MoRnInG')).toBe(true);
    });

    it('performs case-insensitive matching in content', () => {
      const thought = createTestThought({ content: 'Had a GREAT day' });
      expect(matchesTextSearch(thought, 'great')).toBe(true);
      expect(matchesTextSearch(thought, 'GREAT')).toBe(true);
    });

    it('matches substring in title', () => {
      const thought = createTestThought({ title: 'Morning Reflection' });
      expect(matchesTextSearch(thought, 'Mor')).toBe(true);
      expect(matchesTextSearch(thought, 'ing')).toBe(true);
    });

    it('matches substring in content', () => {
      const thought = createTestThought({ content: 'Thinking about life' });
      expect(matchesTextSearch(thought, 'inking')).toBe(true);
    });

    it('returns false if query not in title or content', () => {
      const thought = createTestThought({
        title: 'Morning Run',
        content: 'Had a great run',
      });
      expect(matchesTextSearch(thought, 'swimming')).toBe(false);
    });

    it('matches in either title or content', () => {
      const thought1 = createTestThought({
        title: 'Work deadline',
        content: 'Regular content',
      });
      const thought2 = createTestThought({
        title: 'Regular title',
        content: 'Work-related thoughts',
      });
      expect(matchesTextSearch(thought1, 'work')).toBe(true);
      expect(matchesTextSearch(thought2, 'work')).toBe(true);
    });

    it('handles special characters in query', () => {
      const thought = createTestThought({
        title: 'Meeting @10am',
        content: 'Email: test@example.com',
      });
      expect(matchesTextSearch(thought, '@10am')).toBe(true);
      expect(matchesTextSearch(thought, '@example')).toBe(true);
    });

    it('handles numbers in query', () => {
      const thought = createTestThought({
        title: 'Project 2024',
        content: 'Release v1.2.3',
      });
      expect(matchesTextSearch(thought, '2024')).toBe(true);
      expect(matchesTextSearch(thought, '1.2.3')).toBe(true);
    });
  });

  describe('matchesDateRange', () => {
    const targetTime = 1717459200000;

    it('returns true when both start and end are null', () => {
      const thought = createTestThought({ createdAt: targetTime });
      expect(matchesDateRange(thought, null, null)).toBe(true);
    });

    it('returns true when createdAt equals start', () => {
      const thought = createTestThought({ createdAt: targetTime });
      expect(matchesDateRange(thought, targetTime, null)).toBe(true);
    });

    it('returns true when createdAt equals end', () => {
      const thought = createTestThought({ createdAt: targetTime });
      expect(matchesDateRange(thought, null, targetTime)).toBe(true);
    });

    it('returns true when createdAt is between start and end', () => {
      const thought = createTestThought({ createdAt: targetTime });
      const startTime = targetTime - 1000;
      const endTime = targetTime + 1000;
      expect(matchesDateRange(thought, startTime, endTime)).toBe(true);
    });

    it('returns false when createdAt is before start', () => {
      const thought = createTestThought({ createdAt: targetTime });
      const startTime = targetTime + 1000;
      expect(matchesDateRange(thought, startTime, null)).toBe(false);
    });

    it('returns false when createdAt is after end', () => {
      const thought = createTestThought({ createdAt: targetTime });
      const endTime = targetTime - 1000;
      expect(matchesDateRange(thought, null, endTime)).toBe(false);
    });

    it('returns false when createdAt is outside range', () => {
      const thought = createTestThought({ createdAt: targetTime });
      const startTime = targetTime + 1000;
      const endTime = targetTime + 2000;
      expect(matchesDateRange(thought, startTime, endTime)).toBe(false);
    });

    it('uses inclusive bounds', () => {
      const thought = createTestThought({ createdAt: targetTime });
      // At the exact boundaries
      expect(matchesDateRange(thought, targetTime, targetTime)).toBe(true);
      expect(matchesDateRange(thought, targetTime - 1, targetTime + 1)).toBe(true);
    });

    it('returns true when only start is set and createdAt >= start', () => {
      const thought = createTestThought({ createdAt: targetTime });
      expect(matchesDateRange(thought, targetTime - 1000, null)).toBe(true);
      expect(matchesDateRange(thought, targetTime, null)).toBe(true);
    });

    it('returns false when only start is set and createdAt < start', () => {
      const thought = createTestThought({ createdAt: targetTime });
      expect(matchesDateRange(thought, targetTime + 1000, null)).toBe(false);
    });

    it('returns true when only end is set and createdAt <= end', () => {
      const thought = createTestThought({ createdAt: targetTime });
      expect(matchesDateRange(thought, null, targetTime + 1000)).toBe(true);
      expect(matchesDateRange(thought, null, targetTime)).toBe(true);
    });

    it('returns false when only end is set and createdAt > end', () => {
      const thought = createTestThought({ createdAt: targetTime });
      expect(matchesDateRange(thought, null, targetTime - 1000)).toBe(false);
    });

    it('handles zero and negative timestamps correctly', () => {
      const epoch = 0;
      const thought = createTestThought({ createdAt: epoch });
      expect(matchesDateRange(thought, null, epoch)).toBe(true);
      expect(matchesDateRange(thought, epoch, null)).toBe(true);
      expect(matchesDateRange(thought, epoch + 1, null)).toBe(false);
    });

    it('handles large timestamps', () => {
      const futureTime = 9999999999999;
      const thought = createTestThought({ createdAt: futureTime });
      expect(matchesDateRange(thought, futureTime, null)).toBe(true);
      expect(matchesDateRange(thought, futureTime - 1, null)).toBe(true);
      expect(matchesDateRange(thought, futureTime + 1, null)).toBe(false);
    });
  });

  describe('matchesTags', () => {
    it('returns false for empty selectedTags', () => {
      const thought = createTestThought({ tags: ['work', 'urgent'] });
      expect(matchesTags(thought, [])).toBe(false);
    });

    it('returns true when thought has one of the selected tags', () => {
      const thought = createTestThought({ tags: ['work', 'urgent'] });
      expect(matchesTags(thought, ['work'])).toBe(true);
    });

    it('returns true when thought has multiple selected tags', () => {
      const thought = createTestThought({ tags: ['work', 'urgent'] });
      expect(matchesTags(thought, ['work', 'personal'])).toBe(true);
    });

    it('returns false when thought has none of the selected tags', () => {
      const thought = createTestThought({ tags: ['work'] });
      expect(matchesTags(thought, ['personal', 'hobby'])).toBe(false);
    });

    it('returns false when thought has no tags', () => {
      const thought = createTestThought({ tags: [] });
      expect(matchesTags(thought, ['work'])).toBe(false);
    });

    it('uses OR logic (at least one match required)', () => {
      const thought = createTestThought({ tags: ['work'] });
      // At least one tag matches
      expect(matchesTags(thought, ['work', 'personal', 'hobby'])).toBe(true);
      // No tags match
      expect(matchesTags(thought, ['personal', 'hobby'])).toBe(false);
    });

    it('performs case-sensitive matching', () => {
      const thought = createTestThought({ tags: ['Work'] });
      expect(matchesTags(thought, ['Work'])).toBe(true);
      expect(matchesTags(thought, ['work'])).toBe(false);
    });

    it('matches exact tag names', () => {
      const thought = createTestThought({ tags: ['work', 'working-late'] });
      expect(matchesTags(thought, ['work'])).toBe(true);
      expect(matchesTags(thought, ['wor'])).toBe(false); // partial match should fail
    });

    it('handles duplicate selectedTags', () => {
      const thought = createTestThought({ tags: ['work'] });
      expect(matchesTags(thought, ['work', 'work'])).toBe(true);
    });

    it('handles special characters in tags', () => {
      const thought = createTestThought({ tags: ['c++', 'node.js', '@important'] });
      expect(matchesTags(thought, ['c++'])).toBe(true);
      expect(matchesTags(thought, ['node.js'])).toBe(true);
      expect(matchesTags(thought, ['@important'])).toBe(true);
    });

    it('handles multiple tags on thought with matching subset', () => {
      const thought = createTestThought({
        tags: ['work', 'urgent', 'meeting', 'client'],
      });
      expect(matchesTags(thought, ['meeting'])).toBe(true);
      expect(matchesTags(thought, ['client', 'meeting'])).toBe(true);
      expect(matchesTags(thought, ['personal', 'hobby'])).toBe(false);
    });
  });

  describe('applyFilters', () => {
    const thoughtA = createTestThought({
      id: 'a',
      title: 'Work Meeting',
      content: 'Discussed project milestones',
      createdAt: 1717459200000,
      tags: ['work', 'meeting'],
    });

    const thoughtB = createTestThought({
      id: 'b',
      title: 'Personal Reflection',
      content: 'Feeling great about progress',
      createdAt: 1717545600000,
      tags: ['personal'],
    });

    const thoughtC = createTestThought({
      id: 'c',
      title: 'Project Deadline',
      content: 'Work on final deliverables',
      createdAt: 1717632000000,
      tags: ['work', 'urgent'],
    });

    it('returns all thoughts when no filters are set', () => {
      const thoughts = [thoughtA, thoughtB, thoughtC];
      const result = applyFilters(thoughts, {});
      expect(result).toEqual(thoughts);
    });

    it('returns all thoughts when filter object is empty', () => {
      const thoughts = [thoughtA, thoughtB, thoughtC];
      const result = applyFilters(thoughts, {});
      expect(result).toEqual(thoughts);
    });

    it('returns empty array when filtering empty array', () => {
      const result = applyFilters([], { text: 'work' });
      expect(result).toEqual([]);
    });

    it('filters by text only', () => {
      const thoughts = [thoughtA, thoughtB, thoughtC];
      const result = applyFilters(thoughts, { text: 'work' });
      expect(result).toEqual([thoughtA, thoughtC]);
    });

    it('filters by date range only', () => {
      const thoughts = [thoughtA, thoughtB, thoughtC];
      const result = applyFilters(thoughts, {
        dateStart: 1717459200000,
        dateEnd: 1717545600000,
      });
      expect(result).toEqual([thoughtA, thoughtB]);
    });

    it('filters by tags only', () => {
      const thoughts = [thoughtA, thoughtB, thoughtC];
      const result = applyFilters(thoughts, { selectedTags: ['work'] });
      expect(result).toEqual([thoughtA, thoughtC]);
    });

    it('combines filters with AND logic (text AND date)', () => {
      const thoughts = [thoughtA, thoughtB, thoughtC];
      const result = applyFilters(thoughts, {
        text: 'work',
        dateStart: 1717632000000,
      });
      // Only thoughtC has 'work' AND createdAt >= 1717632000000
      expect(result).toEqual([thoughtC]);
    });

    it('combines filters with AND logic (text AND tags)', () => {
      const thoughts = [thoughtA, thoughtB, thoughtC];
      const result = applyFilters(thoughts, {
        text: 'work',
        selectedTags: ['urgent'],
      });
      // Only thoughtC has 'work' in title AND 'urgent' tag
      expect(result).toEqual([thoughtC]);
    });

    it('combines all three filters with AND logic', () => {
      const thoughts = [thoughtA, thoughtB, thoughtC];
      const result = applyFilters(thoughts, {
        text: 'work',
        dateStart: 1717545600000,
        selectedTags: ['urgent'],
      });
      // Only thoughtC matches: has 'work', createdAt >= 1717545600000, and 'urgent' tag
      expect(result).toEqual([thoughtC]);
    });

    it('returns empty array when no thoughts match all filters', () => {
      const thoughts = [thoughtA, thoughtB, thoughtC];
      const result = applyFilters(thoughts, {
        text: 'swimming',
        selectedTags: ['work'],
      });
      expect(result).toEqual([]);
    });

    it('ignores empty text filter', () => {
      const thoughts = [thoughtA, thoughtB, thoughtC];
      const result = applyFilters(thoughts, { text: '' });
      expect(result).toEqual(thoughts);
    });

    it('ignores empty selectedTags array', () => {
      const thoughts = [thoughtA, thoughtB, thoughtC];
      const result = applyFilters(thoughts, { selectedTags: [] });
      expect(result).toEqual(thoughts);
    });

    it('handles undefined optional filter properties', () => {
      const thoughts = [thoughtA, thoughtB, thoughtC];
      const filters: FilterState = {
        text: undefined,
        dateStart: undefined,
        dateEnd: undefined,
        selectedTags: undefined,
      };
      const result = applyFilters(thoughts, filters);
      expect(result).toEqual(thoughts);
    });

    it('handles null date range properties', () => {
      const thoughts = [thoughtA, thoughtB, thoughtC];
      const result = applyFilters(thoughts, {
        dateStart: null,
        dateEnd: null,
      });
      expect(result).toEqual(thoughts);
    });

    it('maintains original array order', () => {
      const thoughts = [thoughtC, thoughtA, thoughtB];
      const result = applyFilters(thoughts, { selectedTags: ['work'] });
      expect(result).toEqual([thoughtC, thoughtA]);
    });

    it('returns new array (not mutating input)', () => {
      const thoughts = [thoughtA, thoughtB, thoughtC];
      const originalLength = thoughts.length;
      applyFilters(thoughts, { text: 'work' });
      expect(thoughts.length).toBe(originalLength);
    });

    it('case-insensitive text search in combined filters', () => {
      const thoughts = [thoughtA, thoughtB, thoughtC];
      const result = applyFilters(thoughts, { text: 'WORK' });
      expect(result).toEqual([thoughtA, thoughtC]);
    });

    it('handles thought with no tags in tag filter', () => {
      const noTagThought = createTestThought({
        id: 'd',
        tags: [],
      });
      const thoughts = [thoughtA, noTagThought];
      const result = applyFilters(thoughts, { selectedTags: ['work'] });
      expect(result).toEqual([thoughtA]);
    });

    it('handles OR logic in tag selection (multiple tags)', () => {
      const thoughts = [thoughtA, thoughtB, thoughtC];
      // A thought matches if it has ANY of the selected tags
      const result = applyFilters(thoughts, { selectedTags: ['personal', 'urgent'] });
      expect(result).toEqual([thoughtB, thoughtC]);
    });

    it('edge case: date range on single day', () => {
      const dayStart = 1717459200000;
      const dayEnd = dayStart + 86400000 - 1;
      const thoughts = [thoughtA, thoughtB, thoughtC];
      const result = applyFilters(thoughts, { dateStart: dayStart, dateEnd: dayEnd });
      expect(result).toEqual([thoughtA]);
    });

    it('edge case: very old date boundary', () => {
      const oldThought = createTestThought({
        id: 'old',
        createdAt: 1000000000000,
        tags: [],
      });
      const thoughts = [oldThought, thoughtA];
      const result = applyFilters(thoughts, { dateStart: 1000000000001 });
      expect(result).toEqual([thoughtA]);
    });
  });

  describe('FilterState type definition', () => {
    it('allows creation of FilterState with all properties', () => {
      const filters: FilterState = {
        text: 'work',
        dateStart: 1717459200000,
        dateEnd: 1717545600000,
        selectedTags: ['work', 'urgent'],
      };
      expect(filters.text).toBe('work');
      expect(filters.dateStart).toBe(1717459200000);
      expect(filters.dateEnd).toBe(1717545600000);
      expect(filters.selectedTags).toEqual(['work', 'urgent']);
    });

    it('allows creation of FilterState with partial properties', () => {
      const filters: FilterState = {
        text: 'work',
      };
      expect(filters.text).toBe('work');
      expect(filters.dateStart).toBeUndefined();
      expect(filters.selectedTags).toBeUndefined();
    });

    it('allows creation of empty FilterState', () => {
      const filters: FilterState = {};
      expect(Object.keys(filters).length).toBe(0);
    });

    it('allows null values for date properties', () => {
      const filters: FilterState = {
        dateStart: null,
        dateEnd: null,
      };
      expect(filters.dateStart).toBeNull();
      expect(filters.dateEnd).toBeNull();
    });
  });

  describe('Integration edge cases', () => {
    it('handles special characters in all filters', () => {
      const thought = createTestThought({
        title: 'C++ & Python Meeting',
        content: 'Discussed @production deployment',
        tags: ['c++', '@urgent'],
        createdAt: 1717459200000,
      });

      expect(
        applyFilters([thought], {
          text: 'C++',
          selectedTags: ['c++'],
        })
      ).toEqual([thought]);
    });

    it('handles Unicode characters in filters', () => {
      const thought = createTestThought({
        title: '早晨漫步',
        content: 'Walked through the park 🌳',
        tags: ['morning', '🏃'],
        createdAt: 1717459200000,
      });

      expect(
        applyFilters([thought], {
          text: '早晨',
        })
      ).toEqual([thought]);

      expect(
        applyFilters([thought], {
          selectedTags: ['🏃'],
        })
      ).toEqual([thought]);
    });

    it('handles very long strings in filters', () => {
      const longText = 'a'.repeat(1000);
      const thought = createTestThought({
        title: longText,
        content: 'short',
        tags: [longText],
        createdAt: 1717459200000,
      });

      expect(applyFilters([thought], { text: longText })).toEqual([thought]);
      expect(applyFilters([thought], { selectedTags: [longText] })).toEqual([thought]);
    });

    it('performance: handles large arrays', () => {
      const thoughts: Thought[] = [];
      for (let i = 0; i < 1000; i++) {
        thoughts.push(
          createTestThought({
            id: `thought-${i}`,
            title: `Thought ${i}`,
            createdAt: 1717459200000 + i * 1000,
            tags: i % 3 === 0 ? ['work'] : i % 2 === 0 ? ['personal'] : [],
          })
        );
      }

      const start = performance.now();
      const result = applyFilters(thoughts, {
        text: 'Thought',
        selectedTags: ['work'],
      });
      const end = performance.now();

      // Should complete in reasonable time (< 100ms for 1000 items)
      expect(end - start).toBeLessThan(100);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
