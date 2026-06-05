import { formatDate } from './dateFormat';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('dateFormat', () => {
  let mockNow: number;

  beforeEach(() => {
    // Mock current time as June 5, 2026, 12:00 PM UTC
    mockNow = new Date('2026-06-05T12:00:00Z').getTime();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockNow));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('relative format', () => {
    it('should format "just now" for times less than 1 minute ago', () => {
      const thirtySecondsAgo = mockNow - 30 * 1000;
      expect(formatDate(thirtySecondsAgo, 'relative')).toBe('just now');
    });

    it('should format minutes ago', () => {
      const fiveMinutesAgo = mockNow - 5 * 60 * 1000;
      expect(formatDate(fiveMinutesAgo, 'relative')).toBe('5 minutes ago');
    });

    it('should format singular minute ago', () => {
      const oneMinuteAgo = mockNow - 60 * 1000;
      expect(formatDate(oneMinuteAgo, 'relative')).toBe('1 minute ago');
    });

    it('should format hours ago', () => {
      const twoHoursAgo = mockNow - 2 * 60 * 60 * 1000;
      expect(formatDate(twoHoursAgo, 'relative')).toBe('2 hours ago');
    });

    it('should format singular hour ago', () => {
      const oneHourAgo = mockNow - 60 * 60 * 1000;
      expect(formatDate(oneHourAgo, 'relative')).toBe('1 hour ago');
    });

    it('should format "yesterday" for times 24-48 hours ago', () => {
      const yesterdayTime = mockNow - 24 * 60 * 60 * 1000 - 60 * 1000; // 24+ hours ago
      expect(formatDate(yesterdayTime, 'relative')).toBe('yesterday');
    });

    it('should format days ago', () => {
      const threeDaysAgo = mockNow - 3 * 24 * 60 * 60 * 1000;
      expect(formatDate(threeDaysAgo, 'relative')).toBe('3 days ago');
    });

    it('should format singular day ago', () => {
      const twoDaysAgo = mockNow - 2 * 24 * 60 * 60 * 1000;
      expect(formatDate(twoDaysAgo, 'relative')).toBe('2 days ago');
    });

    it('should format weeks ago', () => {
      const twoWeeksAgo = mockNow - 2 * 7 * 24 * 60 * 60 * 1000;
      expect(formatDate(twoWeeksAgo, 'relative')).toBe('2 weeks ago');
    });

    it('should format singular week ago', () => {
      const oneWeekAgo = mockNow - 7 * 24 * 60 * 60 * 1000;
      expect(formatDate(oneWeekAgo, 'relative')).toBe('1 week ago');
    });

    it('should fall back to absolute format for very old dates', () => {
      const twoMonthsAgo = mockNow - 60 * 24 * 60 * 60 * 1000; // 60 days ago
      const result = formatDate(twoMonthsAgo, 'relative');
      // Should return absolute format like "April 06, 2026"
      expect(result).toMatch(/\w+ \d{1,2}, \d{4}/);
      expect(result).not.toContain('ago');
    });

    it('should handle future timestamps', () => {
      const futureTime = mockNow + 60 * 1000; // 1 minute in future
      const result = formatDate(futureTime, 'relative');
      expect(result).toBe('in the future');
    });
  });

  describe('absolute format', () => {
    it('should format as "Month Day, Year"', () => {
      // June 5, 2026 12:00 PM
      const result = formatDate(mockNow, 'absolute');
      expect(result).toBe('June 5, 2026');
    });

    it('should format past dates correctly', () => {
      // January 15, 2026
      const jan15 = new Date('2026-01-15T10:00:00Z').getTime();
      const result = formatDate(jan15, 'absolute');
      expect(result).toBe('January 15, 2026');
    });

    it('should format with single-digit day', () => {
      // June 1, 2026
      const june1 = new Date('2026-06-01T10:00:00Z').getTime();
      const result = formatDate(june1, 'absolute');
      expect(result).toBe('June 1, 2026');
    });

    it('should format with double-digit day', () => {
      // June 25, 2026
      const june25 = new Date('2026-06-25T10:00:00Z').getTime();
      const result = formatDate(june25, 'absolute');
      expect(result).toBe('June 25, 2026');
    });

    it('should handle December dates', () => {
      // December 31, 2025
      const dec31 = new Date('2025-12-31T10:00:00Z').getTime();
      const result = formatDate(dec31, 'absolute');
      expect(result).toBe('December 31, 2025');
    });

    it('should be locale-aware', () => {
      const result = formatDate(mockNow, 'absolute');
      // Result should be formatted in a standard way, not as numbers
      expect(result).toContain('June');
      expect(result).toContain('2026');
    });
  });

  describe('edge cases', () => {
    it('should handle zero timestamp', () => {
      // Jan 1, 1970 00:00:00 UTC
      const result = formatDate(0, 'absolute');
      expect(result).toContain('1970');
    });

    it('should handle very recent timestamp (< 1 second)', () => {
      const veryRecent = mockNow - 100; // 100ms ago
      expect(formatDate(veryRecent, 'relative')).toBe('just now');
    });

    it('should handle exactly 24 hours ago as yesterday', () => {
      const exactlyOneDayAgo = mockNow - 24 * 60 * 60 * 1000;
      expect(formatDate(exactlyOneDayAgo, 'relative')).toBe('yesterday');
    });

    it('should handle exactly 7 days ago as 1 week ago', () => {
      const exactlySevenDaysAgo = mockNow - 7 * 24 * 60 * 60 * 1000;
      expect(formatDate(exactlySevenDaysAgo, 'relative')).toBe('1 week ago');
    });
  });
});
