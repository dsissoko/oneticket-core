/**
 * Unit Tests for SearchService
 * Tests filterByDateRange function with edge cases, validation, and performance
 */

import { describe, it, expect } from 'vitest';
import {
  filterByDateRange,
  SearchValidationError,
  validateSearchCriteria,
  SearchCriteria,
} from './SearchService';
import { JournalEntry } from './Entry';

/**
 * Helper function to create test entries
 */
function createEntry(date: string, text: string = 'Test entry'): JournalEntry {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    date,
    text,
    createdAt: '2026-05-28T12:00:00Z',
    updatedAt: '2026-05-28T12:00:00Z',
  };
}

describe('SearchService.filterByDateRange', () => {
  describe('Basic filtering', () => {
    it('should return entries within date range', () => {
      const entries = [
        createEntry('2026-05-20'),
        createEntry('2026-05-25'),
        createEntry('2026-05-30'),
      ];

      const result = filterByDateRange(entries, '2026-05-20', '2026-05-30');
      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2026-05-20');
      expect(result[2].date).toBe('2026-05-30');
    });

    it('should filter out entries before start date', () => {
      const entries = [
        createEntry('2026-05-15'),
        createEntry('2026-05-25'),
        createEntry('2026-05-30'),
      ];

      const result = filterByDateRange(entries, '2026-05-20', '2026-05-30');
      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2026-05-25');
    });

    it('should filter out entries after end date', () => {
      const entries = [
        createEntry('2026-05-20'),
        createEntry('2026-05-25'),
        createEntry('2026-06-05'),
      ];

      const result = filterByDateRange(entries, '2026-05-20', '2026-05-30');
      expect(result).toHaveLength(2);
      expect(result[1].date).toBe('2026-05-25');
    });

    it('should include both start and end dates (inclusive bounds)', () => {
      const entries = [
        createEntry('2026-05-20'),
        createEntry('2026-05-30'),
      ];

      const result = filterByDateRange(entries, '2026-05-20', '2026-05-30');
      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2026-05-20');
      expect(result[1].date).toBe('2026-05-30');
    });
  });

  describe('Edge cases: same date', () => {
    it('should return entry when search date equals entry date', () => {
      const entries = [createEntry('2026-05-25')];

      const result = filterByDateRange(entries, '2026-05-25', '2026-05-25');
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2026-05-25');
    });

    it('should handle single day range with multiple entries', () => {
      const entries = [
        createEntry('2026-05-25', 'Entry 1'),
        createEntry('2026-05-25', 'Entry 2'),
        createEntry('2026-05-25', 'Entry 3'),
      ];

      const result = filterByDateRange(entries, '2026-05-25', '2026-05-25');
      expect(result).toHaveLength(3);
    });
  });

  describe('Edge cases: empty results', () => {
    it('should return empty array when no entries match', () => {
      const entries = [
        createEntry('2026-05-10'),
        createEntry('2026-06-10'),
      ];

      const result = filterByDateRange(entries, '2026-05-20', '2026-05-30');
      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when entries array is empty', () => {
      const result = filterByDateRange([], '2026-05-20', '2026-05-30');
      expect(result).toHaveLength(0);
    });
  });

  describe('Edge cases: large date ranges', () => {
    it('should handle large date range efficiently', () => {
      const entries = [
        createEntry('2020-01-01'),
        createEntry('2023-06-15'),
        createEntry('2026-05-28'),
        createEntry('2030-12-31'),
      ];

      const result = filterByDateRange(entries, '2020-01-01', '2030-12-31');
      expect(result).toHaveLength(4);
    });

    it('should handle year boundaries correctly', () => {
      const entries = [
        createEntry('2025-12-31'),
        createEntry('2026-01-01'),
        createEntry('2026-12-31'),
        createEntry('2027-01-01'),
      ];

      const result = filterByDateRange(entries, '2026-01-01', '2026-12-31');
      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2026-01-01');
      expect(result[1].date).toBe('2026-12-31');
    });

    it('should handle month boundaries correctly', () => {
      const entries = [
        createEntry('2026-04-30'),
        createEntry('2026-05-01'),
        createEntry('2026-05-31'),
        createEntry('2026-06-01'),
      ];

      const result = filterByDateRange(entries, '2026-05-01', '2026-05-31');
      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2026-05-01');
      expect(result[1].date).toBe('2026-05-31');
    });
  });

  describe('Date format validation', () => {
    it('should throw error for invalid start date format (missing digits)', () => {
      const entries = [createEntry('2026-05-25')];

      expect(() => {
        filterByDateRange(entries, '2026-5-25', '2026-05-30');
      }).toThrow(SearchValidationError);
    });

    it('should throw error for invalid start date format (wrong separator)', () => {
      const entries = [createEntry('2026-05-25')];

      expect(() => {
        filterByDateRange(entries, '2026/05/25', '2026-05-30');
      }).toThrow(SearchValidationError);
    });

    it('should throw error for invalid end date format', () => {
      const entries = [createEntry('2026-05-25')];

      expect(() => {
        filterByDateRange(entries, '2026-05-20', '2026-05-3');
      }).toThrow(SearchValidationError);
    });

    it('should throw error for non-string start date', () => {
      const entries = [createEntry('2026-05-25')];

      expect(() => {
        // @ts-expect-error - intentionally passing wrong type
        filterByDateRange(entries, 20260525, '2026-05-30');
      }).toThrow(SearchValidationError);
    });

    it('should throw error for non-string end date', () => {
      const entries = [createEntry('2026-05-25')];

      expect(() => {
        // @ts-expect-error - intentionally passing wrong type
        filterByDateRange(entries, '2026-05-20', null);
      }).toThrow(SearchValidationError);
    });

    it('should throw error for invalid date (non-existent date)', () => {
      const entries = [createEntry('2026-05-25')];

      expect(() => {
        filterByDateRange(entries, '2026-02-30', '2026-05-30');
      }).toThrow(SearchValidationError);
    });
  });

  describe('Date range validation', () => {
    it('should throw error when start date is after end date', () => {
      const entries = [createEntry('2026-05-25')];

      expect(() => {
        filterByDateRange(entries, '2026-05-30', '2026-05-20');
      }).toThrow(SearchValidationError);
    });

    it('should allow start date equal to end date', () => {
      const entries = [createEntry('2026-05-25')];

      expect(() => {
        filterByDateRange(entries, '2026-05-25', '2026-05-25');
      }).not.toThrow();
    });

    it('should throw SearchValidationError with correct code', () => {
      const entries = [createEntry('2026-05-25')];

      try {
        filterByDateRange(entries, '2026-05-30', '2026-05-20');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(SearchValidationError);
        expect((error as SearchValidationError).code).toBe('INVALID_DATE_RANGE');
      }
    });
  });

  describe('Entries validation', () => {
    it('should throw error when entries is not an array', () => {
      expect(() => {
        // @ts-expect-error - intentionally passing wrong type
        filterByDateRange({ date: '2026-05-25' }, '2026-05-20', '2026-05-30');
      }).toThrow(SearchValidationError);
    });

    it('should throw error when entries is null', () => {
      expect(() => {
        // @ts-expect-error - intentionally passing wrong type
        filterByDateRange(null, '2026-05-20', '2026-05-30');
      }).toThrow(SearchValidationError);
    });

    it('should throw error when entries is undefined', () => {
      expect(() => {
        // @ts-expect-error - intentionally passing wrong type
        filterByDateRange(undefined, '2026-05-20', '2026-05-30');
      }).toThrow(SearchValidationError);
    });
  });

  describe('Error details', () => {
    it('should include details in error when start date format is invalid', () => {
      try {
        filterByDateRange([], 'invalid', '2026-05-30');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as SearchValidationError).details).toEqual({ startDate: 'invalid' });
      }
    });

    it('should include details in error when date range is invalid', () => {
      try {
        filterByDateRange([], '2026-05-30', '2026-05-20');
        expect.fail('Should have thrown an error');
      } catch (error) {
        const err = error as SearchValidationError;
        expect(err.details).toEqual({ startDate: '2026-05-30', endDate: '2026-05-20' });
      }
    });
  });

  describe('Performance characteristics', () => {
    it('should handle 1000 entries efficiently', () => {
      const entries: JournalEntry[] = [];
      // Create 1000 entries spread across 3 years
      for (let day = 1; day <= 1000; day++) {
        const year = 2024 + Math.floor((day - 1) / 365);
        const dayOfYear = ((day - 1) % 365) + 1;
        const date = new Date(year, 0, dayOfYear);
        const dateStr = date.toISOString().split('T')[0];
        entries.push(createEntry(dateStr, `Entry ${day}`));
      }

      const start = performance.now();
      const result = filterByDateRange(entries, '2025-01-01', '2026-05-28');
      const end = performance.now();

      // Should complete in reasonable time (< 100ms is typical for O(n))
      expect(end - start).toBeLessThan(1000);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have linear O(n) complexity', () => {
      // Create different sizes and verify results grow linearly
      const sizes = [10, 100, 500];
      const times: number[] = [];

      sizes.forEach((size) => {
        const entries: JournalEntry[] = [];
        for (let i = 1; i <= size; i++) {
          const date = `2026-0${Math.ceil(i / 10)}-${String((i % 10) + 1).padStart(2, '0')}`;
          entries.push(createEntry(date));
        }

        const start = performance.now();
        filterByDateRange(entries, '2026-01-01', '2026-05-30');
        const end = performance.now();
        times.push(end - start);
      });

      // Rough check: time should roughly scale with size
      // 500 elements should not take significantly longer than 100
      expect(times[2]).toBeLessThan(times[1] * 10);
    });
  });

  describe('Lexicographic date comparison', () => {
    it('should handle leap years correctly', () => {
      const entries = [
        createEntry('2024-02-28'),
        createEntry('2024-02-29'),
        createEntry('2024-03-01'),
      ];

      const result = filterByDateRange(entries, '2024-02-28', '2024-03-01');
      expect(result).toHaveLength(3);
    });

    it('should handle non-leap years correctly', () => {
      const entries = [
        createEntry('2025-02-27'),
        createEntry('2025-02-28'),
        createEntry('2025-03-01'),
      ];

      const result = filterByDateRange(entries, '2025-02-27', '2025-03-01');
      expect(result).toHaveLength(3);
    });

    it('should preserve entry order in results', () => {
      const entries = [
        createEntry('2026-05-30', 'Entry 3'),
        createEntry('2026-05-20', 'Entry 1'),
        createEntry('2026-05-25', 'Entry 2'),
      ];

      const result = filterByDateRange(entries, '2026-05-20', '2026-05-30');
      expect(result).toHaveLength(3);
      expect(result[0].text).toBe('Entry 3');
      expect(result[1].text).toBe('Entry 1');
      expect(result[2].text).toBe('Entry 2');
    });
  });
});

describe('validateSearchCriteria', () => {
  it('should not throw for valid criteria', () => {
    const criteria: SearchCriteria = {
      startDate: '2026-05-20',
      endDate: '2026-05-30',
    };

    expect(() => {
      validateSearchCriteria(criteria);
    }).not.toThrow();
  });

  it('should throw for invalid start date format', () => {
    const criteria: SearchCriteria = {
      startDate: '2026-5-20',
      endDate: '2026-05-30',
    };

    expect(() => {
      validateSearchCriteria(criteria);
    }).toThrow(SearchValidationError);
  });

  it('should throw when start date is after end date', () => {
    const criteria: SearchCriteria = {
      startDate: '2026-05-30',
      endDate: '2026-05-20',
    };

    expect(() => {
      validateSearchCriteria(criteria);
    }).toThrow(SearchValidationError);
  });

  it('should throw when criteria is not an object', () => {
    expect(() => {
      // @ts-expect-error - intentionally passing wrong type
      validateSearchCriteria(null);
    }).toThrow(SearchValidationError);
  });

  it('should throw when criteria is undefined', () => {
    expect(() => {
      // @ts-expect-error - intentionally passing wrong type
      validateSearchCriteria(undefined);
    }).toThrow(SearchValidationError);
  });
});
