import { describe, it, expect } from 'vitest';
import {
  matchesTextSearch,
  matchesDateRange,
  matchesTags,
  applyFilters,
} from './filterLogic';
import { createThought } from '../models/thoughtModel';
import { Thought, FilterState } from '../models/types';

describe('filterLogic', () => {
  const baseThought = createThought(
    'Meeting Notes',
    'Discussed project deadlines and team updates'
  );

  describe('matchesTextSearch', () => {
    it('matches empty query (returns true)', () => {
      expect(matchesTextSearch(baseThought, '')).toBe(true);
      expect(matchesTextSearch(baseThought, '   ')).toBe(true);
    });

    it('matches case-insensitive title', () => {
      expect(matchesTextSearch(baseThought, 'MEETING')).toBe(true);
      expect(matchesTextSearch(baseThought, 'meeting')).toBe(true);
      expect(matchesTextSearch(baseThought, 'Meeting')).toBe(true);
    });

    it('matches case-insensitive content', () => {
      expect(matchesTextSearch(baseThought, 'PROJECT')).toBe(true);
      expect(matchesTextSearch(baseThought, 'deadlines')).toBe(true);
    });

    it('matches substring in title or content', () => {
      expect(matchesTextSearch(baseThought, 'Mee')).toBe(true);
      expect(matchesTextSearch(baseThought, 'project')).toBe(true);
    });

    it('returns false for non-matching query', () => {
      expect(matchesTextSearch(baseThought, 'nonexistent')).toBe(false);
      expect(matchesTextSearch(baseThought, 'xyz123')).toBe(false);
    });
  });

  describe('matchesDateRange', () => {
    const now = Date.now();
    const yesterday = now - 24 * 60 * 60 * 1000;
    const tomorrow = now + 24 * 60 * 60 * 1000;

    it('returns true when no range specified', () => {
      expect(matchesDateRange(baseThought, null, null)).toBe(true);
      expect(matchesDateRange(baseThought, undefined, undefined)).toBe(true);
    });

    it('matches dates within range (inclusive)', () => {
      // Create thoughts at specific times
      const oldThought = createThought('Old', 'Content');
      // Mock createdAt for testing (in practice, this is auto-generated)
      const thoughtAtYesterday = {
        ...baseThought,
        createdAt: yesterday,
      };
      const thoughtAtNow = {
        ...baseThought,
        createdAt: now,
      };

      // Should match if within range
      expect(matchesDateRange(thoughtAtYesterday, yesterday, now)).toBe(true);
      expect(matchesDateRange(thoughtAtNow, yesterday, tomorrow)).toBe(true);
    });

    it('rejects dates before start', () => {
      const oldThought = { ...baseThought, createdAt: yesterday };
      expect(matchesDateRange(oldThought, now, tomorrow)).toBe(false);
    });

    it('rejects dates after end', () => {
      const futureThought = { ...baseThought, createdAt: tomorrow };
      expect(matchesDateRange(futureThought, yesterday, now)).toBe(false);
    });

    it('handles null/undefined start separately', () => {
      expect(matchesDateRange(baseThought, null, now)).toBe(true);
      expect(matchesDateRange(baseThought, undefined, now)).toBe(true);
    });

    it('handles null/undefined end separately', () => {
      expect(matchesDateRange(baseThought, yesterday, null)).toBe(true);
      expect(matchesDateRange(baseThought, yesterday, undefined)).toBe(true);
    });
  });

  describe('matchesTags', () => {
    const thoughtWithTags = createThought('Title', 'Content', [
      'work',
      'urgent',
    ]);
    const thoughtNoTags = createThought('Title', 'Content', []);

    it('returns true for empty selected tags', () => {
      expect(matchesTags(thoughtWithTags, [])).toBe(true);
      expect(matchesTags(thoughtWithTags, undefined)).toBe(true);
    });

    it('matches if thought has any selected tag', () => {
      expect(matchesTags(thoughtWithTags, ['work'])).toBe(true);
      expect(matchesTags(thoughtWithTags, ['urgent'])).toBe(true);
      expect(matchesTags(thoughtWithTags, ['work', 'personal'])).toBe(true);
    });

    it('rejects if thought has no selected tags', () => {
      expect(matchesTags(thoughtNoTags, ['work'])).toBe(false);
      expect(matchesTags(thoughtNoTags, ['work', 'personal'])).toBe(false);
    });

    it('rejects if no tag match (OR logic)', () => {
      expect(matchesTags(thoughtWithTags, ['personal', 'home'])).toBe(false);
    });

    it('handles case-sensitive tag matching', () => {
      // Tags are case-sensitive strings
      expect(matchesTags(thoughtWithTags, ['Work'])).toBe(false);
      expect(matchesTags(thoughtWithTags, ['WORK'])).toBe(false);
      expect(matchesTags(thoughtWithTags, ['work'])).toBe(true);
    });
  });

  describe('applyFilters', () => {
    const thoughts: Thought[] = [
      createThought('Work Meeting', 'Discussed Q4 goals', ['work', 'urgent']),
      createThought('Personal Note', 'Vacation ideas', ['personal']),
      createThought('Shopping List', 'Milk, eggs, bread', []),
      createThought('Project Update', 'Completed feature X', ['work']),
    ];

    it('returns all thoughts with no filters', () => {
      const filters: FilterState = {};
      expect(applyFilters(thoughts, filters)).toEqual(thoughts);
    });

    it('filters by text search', () => {
      const filters: FilterState = { text: 'work' };
      const result = applyFilters(thoughts, filters);
      expect(result.length).toBe(1);
      expect(result.some((t) => t.title.includes('Work'))).toBe(true);
    });

    it('filters by tags', () => {
      const filters: FilterState = { selectedTags: ['work'] };
      const result = applyFilters(thoughts, filters);
      expect(result.length).toBe(2);
      expect(result.every((t) => t.tags.includes('work'))).toBe(true);
    });

    it('filters by multiple tags (OR within tags, AND across filters)', () => {
      const filters: FilterState = { selectedTags: ['work', 'personal'] };
      const result = applyFilters(thoughts, filters);
      expect(result.length).toBe(3); // work, work+urgent, personal
    });

    it('combines text and tag filters with AND logic', () => {
      const filters: FilterState = {
        text: 'work',
        selectedTags: ['urgent'],
      };
      const result = applyFilters(thoughts, filters);
      expect(result.length).toBe(1); // Only "Work Meeting" matches both
      expect(result[0].title).toBe('Work Meeting');
    });

    it('applies date range filter', () => {
      const now = Date.now();
      const yesterday = now - 24 * 60 * 60 * 1000;
      const thoughtAtYesterday = {
        ...thoughts[0],
        createdAt: yesterday,
      };
      const thoughtAtNow = {
        ...thoughts[1],
        createdAt: now,
      };

      const filters: FilterState = {
        dateStart: now - 1000,
        dateEnd: now + 1000,
      };
      const result = applyFilters([thoughtAtYesterday, thoughtAtNow], filters);
      expect(result.length).toBe(1);
      expect(result[0].createdAt).toBe(thoughtAtNow.createdAt);
    });

    it('combines all filters with AND logic', () => {
      const filters: FilterState = {
        text: 'work',
        selectedTags: ['urgent'],
        dateStart: thoughts[0].createdAt - 1000,
        dateEnd: thoughts[0].createdAt + 1000,
      };
      const result = applyFilters(thoughts, filters);
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Work Meeting');
    });

    it('returns empty array when no thoughts match', () => {
      const filters: FilterState = {
        text: 'nonexistent',
      };
      const result = applyFilters(thoughts, filters);
      expect(result).toEqual([]);
    });

    it('handles empty thoughts array', () => {
      const filters: FilterState = { text: 'search' };
      const result = applyFilters([], filters);
      expect(result).toEqual([]);
    });
  });
});
