import { groupThoughtsByDate } from './groupByDate';
import { describe, it, expect } from 'vitest';

interface Thought {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  tags: string[];
}

describe('groupThoughtsByDate', () => {
  describe('basic grouping', () => {
    it('should return empty map for empty array', () => {
      const result = groupThoughtsByDate([]);
      expect(result.size).toBe(0);
      expect(result instanceof Map).toBe(true);
    });

    it('should group single thought correctly', () => {
      const thought: Thought = {
        id: '1',
        title: 'Test thought',
        content: 'Test content',
        createdAt: 1780531200000, // June 4, 2026 00:00:00 UTC
        tags: [],
      };

      const result = groupThoughtsByDate([thought]);

      expect(result.size).toBe(1);
      expect(result.has('2026-06-04')).toBe(true);
      expect(result.get('2026-06-04')).toEqual([thought]);
    });

    it('should group multiple thoughts on same day', () => {
      const baseTime = new Date('2026-06-04T10:00:00Z').getTime();

      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'Morning thought',
          content: 'Early morning reflection',
          createdAt: baseTime,
          tags: ['morning'],
        },
        {
          id: '2',
          title: 'Afternoon thought',
          content: 'Afternoon reflection',
          createdAt: baseTime + 6 * 60 * 60 * 1000, // 6 hours later
          tags: ['afternoon'],
        },
        {
          id: '3',
          title: 'Evening thought',
          content: 'Evening reflection',
          createdAt: baseTime + 12 * 60 * 60 * 1000, // 12 hours later
          tags: ['evening'],
        },
      ];

      const result = groupThoughtsByDate(thoughts);

      expect(result.size).toBe(1);
      const dayThoughts = result.get('2026-06-04');
      expect(dayThoughts).toHaveLength(3);
    });

    it('should sort thoughts within same day by createdAt descending (newest first)', () => {
      const baseTime = new Date('2026-06-04T10:00:00Z').getTime();

      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'Morning thought',
          content: 'Early morning',
          createdAt: baseTime,
          tags: [],
        },
        {
          id: '3',
          title: 'Evening thought',
          content: 'Evening',
          createdAt: baseTime + 12 * 60 * 60 * 1000,
          tags: [],
        },
        {
          id: '2',
          title: 'Afternoon thought',
          content: 'Afternoon',
          createdAt: baseTime + 6 * 60 * 60 * 1000,
          tags: [],
        },
      ];

      const result = groupThoughtsByDate(thoughts);
      const dayThoughts = result.get('2026-06-04');

      expect(dayThoughts?.[0].id).toBe('3'); // Evening (newest)
      expect(dayThoughts?.[1].id).toBe('2'); // Afternoon
      expect(dayThoughts?.[2].id).toBe('1'); // Morning (oldest)
    });
  });

  describe('multiple days grouping', () => {
    it('should group thoughts across multiple days', () => {
      const june4 = new Date('2026-06-04T10:00:00Z').getTime();
      const june5 = new Date('2026-06-05T10:00:00Z').getTime();
      const june6 = new Date('2026-06-06T10:00:00Z').getTime();

      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'June 4 thought',
          content: 'Day 1',
          createdAt: june4,
          tags: [],
        },
        {
          id: '2',
          title: 'June 5 thought',
          content: 'Day 2',
          createdAt: june5,
          tags: [],
        },
        {
          id: '3',
          title: 'June 6 thought',
          content: 'Day 3',
          createdAt: june6,
          tags: [],
        },
      ];

      const result = groupThoughtsByDate(thoughts);

      expect(result.size).toBe(3);
      expect(result.has('2026-06-04')).toBe(true);
      expect(result.has('2026-06-05')).toBe(true);
      expect(result.has('2026-06-06')).toBe(true);
    });

    it('should return days in reverse chronological order (newest first)', () => {
      const june4 = new Date('2026-06-04T10:00:00Z').getTime();
      const june5 = new Date('2026-06-05T10:00:00Z').getTime();
      const june6 = new Date('2026-06-06T10:00:00Z').getTime();

      const thoughts: Thought[] = [
        { id: '1', title: 'June 4', content: 'Day 1', createdAt: june4, tags: [] },
        { id: '2', title: 'June 6', content: 'Day 3', createdAt: june6, tags: [] },
        { id: '3', title: 'June 5', content: 'Day 2', createdAt: june5, tags: [] },
      ];

      const result = groupThoughtsByDate(thoughts);
      const keys = Array.from(result.keys());

      expect(keys[0]).toBe('2026-06-06'); // Newest
      expect(keys[1]).toBe('2026-06-05');
      expect(keys[2]).toBe('2026-06-04'); // Oldest
    });

    it('should handle thoughts with same day but different times across groups', () => {
      const june4Morning = new Date('2026-06-04T08:00:00Z').getTime();
      const june4Evening = new Date('2026-06-04T18:00:00Z').getTime();
      const june5Morning = new Date('2026-06-05T08:00:00Z').getTime();

      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'June 4 Morning',
          content: 'Early',
          createdAt: june4Morning,
          tags: [],
        },
        {
          id: '2',
          title: 'June 5 Morning',
          content: 'Next day',
          createdAt: june5Morning,
          tags: [],
        },
        {
          id: '3',
          title: 'June 4 Evening',
          content: 'Late',
          createdAt: june4Evening,
          tags: [],
        },
      ];

      const result = groupThoughtsByDate(thoughts);

      expect(result.size).toBe(2);
      const june4Thoughts = result.get('2026-06-04');
      expect(june4Thoughts).toHaveLength(2);
      expect(june4Thoughts?.[0].id).toBe('3'); // Evening (newest on that day)
      expect(june4Thoughts?.[1].id).toBe('1'); // Morning (oldest on that day)
    });
  });

  describe('date key format stability', () => {
    it('should produce consistent YYYY-MM-DD format', () => {
      const thought: Thought = {
        id: '1',
        title: 'Test',
        content: 'Test',
        createdAt: new Date('2026-06-04T10:00:00Z').getTime(),
        tags: [],
      };

      const result = groupThoughtsByDate([thought]);
      const keys = Array.from(result.keys());

      expect(keys[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(keys[0]).toBe('2026-06-04');
    });

    it('should normalize time to date (ignore hours, minutes, seconds)', () => {
      const baseTime = new Date('2026-06-04T00:00:00Z').getTime();

      const thoughts: Thought[] = [
        {
          id: '1',
          title: 'Midnight',
          content: 'Test',
          createdAt: baseTime, // 00:00:00
          tags: [],
        },
        {
          id: '2',
          title: 'Noon',
          content: 'Test',
          createdAt: baseTime + 12 * 60 * 60 * 1000, // 12:00:00 same day
          tags: [],
        },
        {
          id: '3',
          title: 'Almost midnight',
          content: 'Test',
          createdAt: baseTime + 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000, // 23:59:59 same day
          tags: [],
        },
      ];

      const result = groupThoughtsByDate(thoughts);

      expect(result.size).toBe(1);
      expect(result.has('2026-06-04')).toBe(true);
    });

    it('should handle leap year dates correctly', () => {
      // 2024 is a leap year with Feb 29
      const leapDayTime = new Date('2024-02-29T10:00:00Z').getTime();

      const thought: Thought = {
        id: '1',
        title: 'Leap day thought',
        content: 'Test',
        createdAt: leapDayTime,
        tags: [],
      };

      const result = groupThoughtsByDate([thought]);

      expect(result.has('2024-02-29')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle year boundaries (Dec 31 to Jan 1)', () => {
      const dec31 = new Date('2025-12-31T23:00:00Z').getTime();
      const jan1 = new Date('2026-01-01T01:00:00Z').getTime();

      const thoughts: Thought[] = [
        { id: '1', title: 'Dec 31', content: 'Test', createdAt: dec31, tags: [] },
        { id: '2', title: 'Jan 1', content: 'Test', createdAt: jan1, tags: [] },
      ];

      const result = groupThoughtsByDate(thoughts);

      expect(result.size).toBe(2);
      expect(result.has('2025-12-31')).toBe(true);
      expect(result.has('2026-01-01')).toBe(true);
    });

    it('should handle month boundaries', () => {
      const may31 = new Date('2026-05-31T23:00:00Z').getTime();
      const june1 = new Date('2026-06-01T01:00:00Z').getTime();

      const thoughts: Thought[] = [
        { id: '1', title: 'May 31', content: 'Test', createdAt: may31, tags: [] },
        { id: '2', title: 'June 1', content: 'Test', createdAt: june1, tags: [] },
      ];

      const result = groupThoughtsByDate(thoughts);

      expect(result.size).toBe(2);
      expect(result.has('2026-05-31')).toBe(true);
      expect(result.has('2026-06-01')).toBe(true);
    });

    it('should preserve thought data in groups', () => {
      const thought: Thought = {
        id: 'unique-id-123',
        title: 'Complex thought',
        content: 'Long content with special chars: !@#$%',
        createdAt: new Date('2026-06-04T10:00:00Z').getTime(),
        tags: ['work', 'important', 'urgent'],
      };

      const result = groupThoughtsByDate([thought]);
      const groupedThought = result.get('2026-06-04')?.[0];

      expect(groupedThought?.id).toBe('unique-id-123');
      expect(groupedThought?.title).toBe('Complex thought');
      expect(groupedThought?.content).toBe('Long content with special chars: !@#$%');
      expect(groupedThought?.tags).toEqual(['work', 'important', 'urgent']);
    });

    it('should handle large number of thoughts', () => {
      const baseTime = new Date('2026-06-04T10:00:00Z').getTime();

      const thoughts: Thought[] = Array.from({ length: 100 }, (_, i) => ({
        id: `thought-${i}`,
        title: `Thought ${i}`,
        content: `Content ${i}`,
        createdAt: baseTime + i * 1000, // Stagger by 1 second each
        tags: [],
      }));

      const result = groupThoughtsByDate(thoughts);

      expect(result.size).toBe(1);
      const dayThoughts = result.get('2026-06-04');
      expect(dayThoughts).toHaveLength(100);
      // Verify sorting (should be descending by createdAt)
      expect(dayThoughts?.[0].id).toBe('thought-99'); // Latest
      expect(dayThoughts?.[99].id).toBe('thought-0'); // Oldest
    });
  });
});
