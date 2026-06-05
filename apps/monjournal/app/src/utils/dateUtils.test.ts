import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatDate, groupThoughtsByDate } from './dateUtils';
import type { Thought } from '../models/thoughtModel';

// Helper to create a thought for testing
function createTestThought(
  title: string,
  content: string,
  tags: string[] = [],
  createdAt?: number
): Thought {
  return {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: createdAt ?? Date.now(),
    tags,
  };
}

describe('dateUtils', () => {
  describe('formatDate', () => {
    describe('relative format', () => {
      let now: number;

      beforeEach(() => {
        // Mock current time to June 5, 2026, 12:00 PM UTC
        // This is 1717598400000 milliseconds since epoch
        now = 1717598400000;
        vi.useFakeTimers();
        vi.setSystemTime(new Date(now));
      });

      afterEach(() => {
        vi.restoreAllMocks();
      });

      it('returns "a few seconds ago" for timestamps less than 1 minute old', () => {
        const timestamp = now - 30000; // 30 seconds ago
        expect(formatDate(timestamp, 'relative')).toBe('a few seconds ago');
      });

      it('returns "a minute ago" for timestamps 1 minute old', () => {
        const timestamp = now - 60000; // 1 minute ago
        expect(formatDate(timestamp, 'relative')).toBe('a minute ago');
      });

      it('returns "X minutes ago" for timestamps 2-59 minutes old', () => {
        const timestamp5min = now - 300000; // 5 minutes
        expect(formatDate(timestamp5min, 'relative')).toBe('5 minutes ago');

        const timestamp30min = now - 1800000; // 30 minutes
        expect(formatDate(timestamp30min, 'relative')).toBe('30 minutes ago');

        const timestamp59min = now - 3540000; // 59 minutes
        expect(formatDate(timestamp59min, 'relative')).toBe('59 minutes ago');
      });

      it('returns "an hour ago" for timestamps 1 hour old', () => {
        const timestamp = now - 3600000; // 1 hour ago
        expect(formatDate(timestamp, 'relative')).toBe('an hour ago');
      });

      it('returns "X hours ago" for timestamps 2-23 hours old', () => {
        const timestamp2hr = now - 7200000; // 2 hours
        expect(formatDate(timestamp2hr, 'relative')).toBe('2 hours ago');

        const timestamp12hr = now - 43200000; // 12 hours
        expect(formatDate(timestamp12hr, 'relative')).toBe('12 hours ago');

        const timestamp23hr = now - 82800000; // 23 hours
        expect(formatDate(timestamp23hr, 'relative')).toBe('23 hours ago');
      });

      it('returns "yesterday" for timestamps 24-47 hours old', () => {
        const timestamp1day = now - 86400000; // 24 hours (1 day)
        expect(formatDate(timestamp1day, 'relative')).toBe('yesterday');

        const timestamp36hr = now - 129600000; // 36 hours
        expect(formatDate(timestamp36hr, 'relative')).toBe('yesterday');

        const timestamp47hr = now - 169200000; // 47 hours
        expect(formatDate(timestamp47hr, 'relative')).toBe('yesterday');
      });

      it('returns "X days ago" for timestamps 2-29 days old', () => {
        const timestamp2days = now - 172800000; // 2 days
        expect(formatDate(timestamp2days, 'relative')).toBe('2 days ago');

        const timestamp7days = now - 604800000; // 7 days
        expect(formatDate(timestamp7days, 'relative')).toBe('7 days ago');

        const timestamp29days = now - 2505600000; // 29 days
        expect(formatDate(timestamp29days, 'relative')).toBe('29 days ago');
      });

      it('returns absolute format for timestamps 30+ days old', () => {
        const timestamp30days = now - 2592000000; // 30 days
        const result = formatDate(timestamp30days, 'relative');
        // Should be formatted as absolute date, not "30 days ago"
        expect(result).not.toContain('days ago');
        // Should look like a date
        expect(result).toMatch(/\d+,\s+\d+/);
      });

      it('handles current timestamp (0 milliseconds ago)', () => {
        expect(formatDate(now, 'relative')).toBe('a few seconds ago');
      });
    });

    describe('absolute format', () => {
      it('formats timestamp as "Month Day, Year" in en-US locale', () => {
        // June 4, 2024, 00:00:00 UTC = 1717459200000
        const timestamp = 1717459200000;
        const result = formatDate(timestamp, 'absolute');
        expect(result).toBe('June 4, 2024');
      });

      it('formats different dates correctly', () => {
        // January 1, 2024, 00:00:00 UTC = 1704067200000
        const jan1 = 1704067200000;
        const result1 = formatDate(jan1, 'absolute');
        expect(result1).toContain('January');
        expect(result1).toContain('1');
        expect(result1).toContain('2024');

        // December 31, 2024, 23:59:59 UTC = 1735689599000
        const dec31 = 1735689599000;
        const result2 = formatDate(dec31, 'absolute');
        expect(result2).toContain('December');
        expect(result2).toContain('31');
        expect(result2).toContain('2024');
      });

      it('uses locale-aware month names', () => {
        // All months
        const dates = [
          { ts: 1704067200000, month: 'January' },   // 2024-01-01
          { ts: 1706745600000, month: 'February' },  // 2024-02-01
          { ts: 1709251200000, month: 'March' },     // 2024-03-01
          { ts: 1711929600000, month: 'April' },     // 2024-04-01
          { ts: 1714521600000, month: 'May' },       // 2024-05-01
          { ts: 1717200000000, month: 'June' },      // 2024-06-01
        ];

        for (const { ts, month } of dates) {
          const result = formatDate(ts, 'absolute');
          expect(result).toContain(month);
        }
      });

      it('handles leap years correctly', () => {
        // February 29, 2024 (leap year)
        const leapDate = 1709169600000;
        const result = formatDate(leapDate, 'absolute');
        expect(result).toContain('February');
        expect(result).toContain('29');
        expect(result).toContain('2024');
      });

      it('formats end of year correctly', () => {
        // December 31, 2024
        const eoyDate = 1735689599000; // Approximate
        const result = formatDate(eoyDate, 'absolute');
        expect(result).toBeTruthy();
        expect(result).toContain('2024');
      });
    });

    describe('format parameter', () => {
      it('respects explicit relative format', () => {
        const timestamp = Date.now() - 1800000; // 30 minutes ago
        const result = formatDate(timestamp, 'relative');
        expect(result).toContain('ago');
      });

      it('respects explicit absolute format', () => {
        const timestamp = 1717459200000;
        const result = formatDate(timestamp, 'absolute');
        expect(result).toMatch(/\d{4}/); // Contains year
        expect(result).not.toContain('ago');
      });
    });

    describe('edge cases', () => {
      beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(1717598400000));
      });

      afterEach(() => {
        vi.restoreAllMocks();
      });

      it('handles epoch timestamp (Jan 1, 1970)', () => {
        const result = formatDate(0, 'absolute');
        expect(result).toBeTruthy();
        expect(result).toContain('1970');
      });

      it('handles very recent timestamps (milliseconds)', () => {
        const now = Date.now();
        const result = formatDate(now - 1, 'relative');
        expect(result).toBe('a few seconds ago');
      });

      it('handles very old timestamps (before 2000)', () => {
        const ts = 946684800000; // January 1, 2000
        const result = formatDate(ts, 'absolute');
        expect(result).toContain('2000');
      });
    });
  });

  describe('groupThoughtsByDate', () => {
    it('returns empty map for empty thoughts array', () => {
      const result = groupThoughtsByDate([]);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('groups thoughts by creation date (YYYY-MM-DD)', () => {
      // All on June 4, 2024
      const date1 = 1717459200000; // June 4, 2024, 00:00:00 UTC
      const date2 = 1717545600000; // June 5, 2024, 00:00:00 UTC

      const t1 = createTestThought('Thought 1', 'Content 1', [], date1);
      const t2 = createTestThought('Thought 2', 'Content 2', [], date1);
      const t3 = createTestThought('Thought 3', 'Content 3', [], date2);

      const thoughts: Thought[] = [t1, t2, t3];

      const result = groupThoughtsByDate(thoughts);
      expect(result.size).toBe(2);
      expect(result.has('2024-06-04')).toBe(true);
      expect(result.has('2024-06-05')).toBe(true);
    });

    it('normalizes timestamps to midnight for consistent grouping', () => {
      // Same day, different times
      const date1Midnight = 1717459200000;  // June 4, 2024, 00:00:00 UTC
      const date1Afternoon = 1717473600000; // June 4, 2024, 12:00:00 UTC
      const date1Evening = 1717516800000;   // June 4, 2024, 23:00:00 UTC

      const t1 = createTestThought('Morning', 'Content', [], date1Midnight);
      const t2 = createTestThought('Afternoon', 'Content', [], date1Afternoon);
      const t3 = createTestThought('Evening', 'Content', [], date1Evening);

      const thoughts: Thought[] = [t1, t2, t3];

      const result = groupThoughtsByDate(thoughts);
      expect(result.size).toBe(1);
      expect(result.get('2024-06-04')).toHaveLength(3);
    });

    it('sorts thoughts within each group by createdAt descending (newest first)', () => {
      const date = 1717459200000; // June 4, 2024, 00:00:00 UTC
      const t1 = createTestThought('First', 'Content', [], date + 0);
      const t2 = createTestThought('Second', 'Content', [], date + 3600000);
      const t3 = createTestThought('Third', 'Content', [], date + 7200000);

      const thoughts = [t1, t2, t3];
      const result = groupThoughtsByDate(thoughts);
      const groupedThoughts = result.get('2024-06-04');

      expect(groupedThoughts).toBeDefined();
      expect(groupedThoughts![0].title).toBe('Third'); // Most recent first
      expect(groupedThoughts![1].title).toBe('Second');
      expect(groupedThoughts![2].title).toBe('First');
    });

    it('maintains insertion order of date keys (oldest date first)', () => {
      const dateJune5 = 1717545600000; // June 5, 2024
      const dateJune4 = 1717459200000; // June 4, 2024
      const dateJune3 = 1717372800000; // June 3, 2024

      // Insert in reverse order (newest first)
      const t5 = createTestThought('T5', 'Content', [], dateJune5);
      const t4 = createTestThought('T4', 'Content', [], dateJune4);
      const t3 = createTestThought('T3', 'Content', [], dateJune3);

      const thoughts: Thought[] = [t5, t4, t3];

      const result = groupThoughtsByDate(thoughts);
      const keys = Array.from(result.keys());

      // Map maintains insertion order, so we should get the dates in the order they were first seen
      expect(keys[0]).toBe('2024-06-05');
      expect(keys[1]).toBe('2024-06-04');
      expect(keys[2]).toBe('2024-06-03');
    });

    it('handles single thought', () => {
      const thought = createTestThought('Thought', 'Content', []);
      const result = groupThoughtsByDate([thought]);

      expect(result.size).toBe(1);
      const entries = Array.from(result.entries());
      expect(entries[0][1]).toEqual([thought]);
    });

    it('handles multiple thoughts on same day with same timestamp', () => {
      const timestamp = 1717459200000;
      const t1 = createTestThought('T1', 'C1', [], timestamp);
      const t2 = createTestThought('T2', 'C2', [], timestamp);

      const result = groupThoughtsByDate([t1, t2]);
      expect(result.get('2024-06-04')).toHaveLength(2);
    });

    it('correctly formats date keys in YYYY-MM-DD format', () => {
      const dates = [
        { ts: 1704067200000, expected: '2024-01-01' }, // Jan 1, 2024
        { ts: 1704153600000, expected: '2024-01-02' }, // Jan 2, 2024
        { ts: 1717459200000, expected: '2024-06-04' }, // June 4, 2024
      ];

      for (const { ts, expected } of dates) {
        const thought = createTestThought('T', 'C', [], ts);
        const result = groupThoughtsByDate([thought]);
        expect(result.has(expected)).toBe(true);
      }
    });

    it('handles thoughts spanning multiple months', () => {
      const january = 1704067200000;   // 2024-01-01
      const february = 1706745600000;  // 2024-02-01
      const march = 1709251200000;     // 2024-03-01

      const t1 = createTestThought('Jan', 'Content', [], january);
      const t2 = createTestThought('Feb', 'Content', [], february);
      const t3 = createTestThought('Mar', 'Content', [], march);

      const thoughts: Thought[] = [t1, t2, t3];

      const result = groupThoughtsByDate(thoughts);
      expect(result.size).toBe(3);
      expect(result.has('2024-01-01')).toBe(true);
      expect(result.has('2024-02-01')).toBe(true);
      expect(result.has('2024-03-01')).toBe(true);
    });

    it('handles leap year dates correctly', () => {
      const feb28_2024 = 1709155200000; // 2024-02-28
      const feb29_2024 = 1709241600000; // 2024-02-29 (leap year)
      const mar1_2024 = 1709328000000;  // 2024-03-01

      const t1 = createTestThought('T28', 'C', [], feb28_2024);
      const t2 = createTestThought('T29', 'C', [], feb29_2024);
      const t3 = createTestThought('T1', 'C', [], mar1_2024);

      const thoughts: Thought[] = [t1, t2, t3];

      const result = groupThoughtsByDate(thoughts);
      expect(result.size).toBe(3);
      expect(result.has('2024-02-28')).toBe(true);
      expect(result.has('2024-02-29')).toBe(true);
      expect(result.has('2024-03-01')).toBe(true);
    });

    it('handles end-of-month transitions', () => {
      // April 30, 2024 and May 1, 2024
      const apr30 = new Date('2024-04-30').getTime();
      const may1 = new Date('2024-05-01').getTime();

      const t1 = createTestThought('Apr30', 'C', [], apr30);
      const t2 = createTestThought('May1', 'C', [], may1);

      const thoughts: Thought[] = [t1, t2];

      const result = groupThoughtsByDate(thoughts);
      expect(result.size).toBe(2);
      expect(result.has('2024-04-30')).toBe(true);
      expect(result.has('2024-05-01')).toBe(true);
    });

    it('handles year boundary transitions', () => {
      const dec31_2024 = new Date('2024-12-31').getTime();
      const jan1_2025 = new Date('2025-01-01').getTime();

      const t1 = createTestThought('Dec31', 'C', [], dec31_2024);
      const t2 = createTestThought('Jan1', 'C', [], jan1_2025);

      const thoughts: Thought[] = [t1, t2];

      const result = groupThoughtsByDate(thoughts);
      expect(result.size).toBe(2);
      expect(result.has('2024-12-31')).toBe(true);
      expect(result.has('2025-01-01')).toBe(true);
    });

    it('handles many thoughts efficiently', () => {
      const thoughts: Thought[] = [];
      const baseDate = new Date('2024-06-04').getTime();

      // Create 100 thoughts over 10 days
      for (let i = 0; i < 100; i++) {
        const timestamp = baseDate + (i % 10) * 86400000 + (i * 1000);
        const thought = createTestThought(`T${i}`, `C${i}`, [], timestamp);
        thoughts.push(thought);
      }

      const result = groupThoughtsByDate(thoughts);
      expect(result.size).toBe(10);

      // Verify all groups are populated
      let totalThoughts = 0;
      for (const group of result.values()) {
        expect(group.length).toBeGreaterThan(0);
        totalThoughts += group.length;
      }
      expect(totalThoughts).toBe(100);
    });

    it('preserves all thought data during grouping', () => {
      const thought = createTestThought('Title', 'Content', ['tag1', 'tag2']);
      const result = groupThoughtsByDate([thought]);
      const dateKey = formatDateToKey(thought.createdAt);
      const grouped = result.get(dateKey);

      expect(grouped).toBeDefined();
      expect(grouped![0]).toEqual(thought);
      expect(grouped![0].id).toBe(thought.id);
      expect(grouped![0].tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('integration: formatDate and groupThoughtsByDate', () => {
    it('works together for timeline display', () => {
      const date1 = 1717459200000; // June 4, 2024
      const date2 = 1717545600000; // June 5, 2024

      const t1 = createTestThought('T1', 'C1', [], date1);
      const t2 = createTestThought('T2', 'C2', [], date1);
      const t3 = createTestThought('T3', 'C3', [], date2);

      const thoughts: Thought[] = [t1, t2, t3];

      const grouped = groupThoughtsByDate(thoughts);

      // Verify grouping
      expect(grouped.size).toBe(2);

      // Verify date formatting for each group
      for (const [dateKey, groupedThoughts] of grouped) {
        // dateKey is YYYY-MM-DD
        expect(dateKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        // Thoughts are sorted descending
        for (let i = 1; i < groupedThoughts.length; i++) {
          expect(groupedThoughts[i - 1].createdAt).toBeGreaterThanOrEqual(
            groupedThoughts[i].createdAt
          );
        }
      }
    });
  });

  // Helper function for tests
  function formatDateToKey(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});
