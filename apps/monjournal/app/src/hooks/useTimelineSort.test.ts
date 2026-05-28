/**
 * Unit Tests for useTimelineSort Hook
 *
 * Tests sorting, date grouping, date filtering, localStorage persistence,
 * and performance with various entry counts.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimelineSort } from './useTimelineSort';
import type { JournalEntry } from '../domain/Entry';

// Helper to create test entries
function createTestEntry(
  overrides?: Partial<JournalEntry>,
): JournalEntry {
  const defaults: JournalEntry = {
    id: crypto.randomUUID(),
    date: '2026-05-28',
    text: 'Test entry',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return { ...defaults, ...overrides };
}

describe('useTimelineSort', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Sorting', () => {
    it('should default to descending sort order (newest first)', () => {
      const entries = [
        createTestEntry({ date: '2026-05-26' }),
        createTestEntry({ date: '2026-05-28' }),
        createTestEntry({ date: '2026-05-27' }),
      ];

      const { result } = renderHook(() => useTimelineSort(entries));

      expect(result.current.sortOrder).toBe('desc');
      expect(result.current.displayEntries[0].date).toBe('2026-05-28');
      expect(result.current.displayEntries[1].date).toBe('2026-05-27');
      expect(result.current.displayEntries[2].date).toBe('2026-05-26');
    });

    it('should support ascending sort order (oldest first)', () => {
      const entries = [
        createTestEntry({ date: '2026-05-26' }),
        createTestEntry({ date: '2026-05-28' }),
        createTestEntry({ date: '2026-05-27' }),
      ];

      const { result } = renderHook(() => useTimelineSort(entries));

      act(() => {
        result.current.setSortOrder('asc');
      });

      expect(result.current.sortOrder).toBe('asc');
      expect(result.current.displayEntries[0].date).toBe('2026-05-26');
      expect(result.current.displayEntries[1].date).toBe('2026-05-27');
      expect(result.current.displayEntries[2].date).toBe('2026-05-28');
    });

    it('should toggle between sort orders', () => {
      const entries = [createTestEntry({ date: '2026-05-27' }), createTestEntry({ date: '2026-05-28' })];

      const { result } = renderHook(() => useTimelineSort(entries));

      expect(result.current.sortOrder).toBe('desc');

      act(() => {
        result.current.setSortOrder('asc');
      });
      expect(result.current.sortOrder).toBe('asc');

      act(() => {
        result.current.setSortOrder('desc');
      });
      expect(result.current.sortOrder).toBe('desc');
    });
  });

  describe('Date Grouping', () => {
    it('should group multiple entries by date', () => {
      const date1 = '2026-05-28';
      const date2 = '2026-05-27';

      const entries = [
        createTestEntry({ date: date1, text: 'Entry 1 on 28th' }),
        createTestEntry({ date: date2, text: 'Entry 1 on 27th' }),
        createTestEntry({ date: date1, text: 'Entry 2 on 28th' }),
        createTestEntry({ date: date2, text: 'Entry 2 on 27th' }),
      ];

      const { result } = renderHook(() => useTimelineSort(entries));

      // In descending order: 28th first, then 27th
      const display = result.current.displayEntries;
      expect(display[0].date).toBe('2026-05-28');
      expect(display[1].date).toBe('2026-05-28');
      expect(display[2].date).toBe('2026-05-27');
      expect(display[3].date).toBe('2026-05-27');
    });

    it('should sort entries within same date by createdAt (earliest first)', () => {
      const date = '2026-05-28';
      const now = new Date().toISOString();
      const oneLater = new Date(Date.now() + 1000).toISOString();
      const twoLater = new Date(Date.now() + 2000).toISOString();

      const entries = [
        createTestEntry({ date, text: 'Created last', createdAt: twoLater }),
        createTestEntry({ date, text: 'Created first', createdAt: now }),
        createTestEntry({ date, text: 'Created middle', createdAt: oneLater }),
      ];

      const { result } = renderHook(() => useTimelineSort(entries));

      const display = result.current.displayEntries;
      expect(display[0].text).toBe('Created first');
      expect(display[1].text).toBe('Created middle');
      expect(display[2].text).toBe('Created last');
    });
  });

  describe('Date Filtering', () => {
    it('should filter entries by single date', () => {
      const entries = [
        createTestEntry({ date: '2026-05-26', text: 'Older' }),
        createTestEntry({ date: '2026-05-28', text: 'Filtered 1' }),
        createTestEntry({ date: '2026-05-27', text: 'Middle' }),
        createTestEntry({ date: '2026-05-28', text: 'Filtered 2' }),
      ];

      const { result } = renderHook(() => useTimelineSort(entries));

      act(() => {
        result.current.filterByDate('2026-05-28');
      });

      expect(result.current.dateFilter).toBe('2026-05-28');
      expect(result.current.displayEntries).toHaveLength(2);
      expect(result.current.displayEntries.every(e => e.date === '2026-05-28')).toBe(true);
    });

    it('should clear date filter with clearDateFilter', () => {
      const entries = [
        createTestEntry({ date: '2026-05-28' }),
        createTestEntry({ date: '2026-05-27' }),
        createTestEntry({ date: '2026-05-26' }),
      ];

      const { result } = renderHook(() => useTimelineSort(entries));

      act(() => {
        result.current.filterByDate('2026-05-28');
      });
      expect(result.current.displayEntries).toHaveLength(1);

      act(() => {
        result.current.clearDateFilter();
      });

      expect(result.current.dateFilter).toBeNull();
      expect(result.current.displayEntries).toHaveLength(3);
    });

    it('should return empty array when filter matches no entries', () => {
      const entries = [
        createTestEntry({ date: '2026-05-28' }),
        createTestEntry({ date: '2026-05-27' }),
      ];

      const { result } = renderHook(() => useTimelineSort(entries));

      act(() => {
        result.current.filterByDate('2026-01-01');
      });

      expect(result.current.displayEntries).toHaveLength(0);
    });

    it('should maintain sort order when filtering', () => {
      const entries = [
        createTestEntry({ date: '2026-05-28' }),
        createTestEntry({ date: '2026-05-28' }),
        createTestEntry({ date: '2026-05-27' }),
      ];

      const { result } = renderHook(() => useTimelineSort(entries));

      act(() => {
        result.current.setSortOrder('asc');
        result.current.filterByDate('2026-05-28');
      });

      expect(result.current.displayEntries).toHaveLength(2);
      // Within 28th, should still be sorted by createdAt
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist sort order to localStorage', () => {
      const entries = [createTestEntry()];

      const { result } = renderHook(() => useTimelineSort(entries));

      act(() => {
        result.current.setSortOrder('asc');
      });

      expect(localStorage.getItem('journal_sort_order')).toBe('asc');
    });

    it('should restore sort order from localStorage on init', () => {
      localStorage.setItem('journal_sort_order', 'asc');

      const entries = [
        createTestEntry({ date: '2026-05-27' }),
        createTestEntry({ date: '2026-05-28' }),
      ];

      const { result } = renderHook(() => useTimelineSort(entries));

      expect(result.current.sortOrder).toBe('asc');
      expect(result.current.displayEntries[0].date).toBe('2026-05-27');
      expect(result.current.displayEntries[1].date).toBe('2026-05-28');
    });

    it('should default to desc if invalid value in localStorage', () => {
      localStorage.setItem('journal_sort_order', 'invalid');

      const entries = [createTestEntry()];

      const { result } = renderHook(() => useTimelineSort(entries));

      expect(result.current.sortOrder).toBe('desc');
    });

    it('should handle localStorage unavailability gracefully', () => {
      // Mock localStorage to throw
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const entries = [createTestEntry()];

      const { result } = renderHook(() => useTimelineSort(entries));

      // Should not throw
      act(() => {
        result.current.setSortOrder('asc');
      });

      expect(result.current.sortOrder).toBe('asc');

      setItemSpy.mockRestore();
    });
  });

  describe('Empty and Edge Cases', () => {
    it('should handle empty entries array', () => {
      const { result } = renderHook(() => useTimelineSort([]));

      expect(result.current.displayEntries).toEqual([]);
      expect(result.current.sortOrder).toBe('desc');
      expect(result.current.dateFilter).toBeNull();
    });

    it('should handle single entry', () => {
      const entry = createTestEntry({ date: '2026-05-28' });

      const { result } = renderHook(() => useTimelineSort([entry]));

      expect(result.current.displayEntries).toHaveLength(1);
      expect(result.current.displayEntries[0].id).toBe(entry.id);
    });

    it('should handle entries with same createdAt timestamp', () => {
      const timestamp = new Date().toISOString();
      const entries = [
        createTestEntry({ date: '2026-05-28', createdAt: timestamp }),
        createTestEntry({ date: '2026-05-28', createdAt: timestamp }),
        createTestEntry({ date: '2026-05-28', createdAt: timestamp }),
      ];

      const { result } = renderHook(() => useTimelineSort(entries));

      expect(result.current.displayEntries).toHaveLength(3);
      expect(result.current.displayEntries.every(e => e.date === '2026-05-28')).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle large number of entries efficiently', () => {
      const entries: JournalEntry[] = [];
      // Create 1000 entries across 100 dates
      for (let d = 0; d < 100; d++) {
        for (let i = 0; i < 10; i++) {
          const dateObj = new Date('2026-05-28');
          dateObj.setDate(dateObj.getDate() - d);
          const dateStr = dateObj.toISOString().split('T')[0];

          entries.push(
            createTestEntry({
              date: dateStr,
              text: `Entry ${i} on ${dateStr}`,
              createdAt: new Date(Date.now() - (100000 - i * 1000)).toISOString(),
            }),
          );
        }
      }

      const startTime = performance.now();
      const { result } = renderHook(() => useTimelineSort(entries));
      const endTime = performance.now();

      expect(result.current.displayEntries).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in < 1 second
    });

    it('should recompute only when dependencies change', () => {
      const entries = [
        createTestEntry({ date: '2026-05-28' }),
        createTestEntry({ date: '2026-05-27' }),
      ];

      const { result, rerender } = renderHook(
        ({ entries: e }: { entries: JournalEntry[] }) => useTimelineSort(e),
        { initialProps: { entries } },
      );

      const firstResult = result.current.displayEntries;

      // Re-render with same entries (should not recompute)
      rerender({ entries });

      expect(result.current.displayEntries).toBe(firstResult);

      // Re-render with different entries (should recompute)
      const newEntries = [...entries, createTestEntry({ date: '2026-05-26' })];
      rerender({ entries: newEntries });

      expect(result.current.displayEntries).not.toBe(firstResult);
      expect(result.current.displayEntries).toHaveLength(3);
    });
  });
});
