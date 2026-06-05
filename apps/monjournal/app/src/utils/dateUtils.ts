import { Thought } from '../models/thoughtModel';

/**
 * Formats a timestamp into either relative or absolute date representation.
 *
 * Relative format:
 * - "a few seconds ago" (0-59 seconds)
 * - "X minutes ago" (1-59 minutes)
 * - "X hours ago" (1-23 hours)
 * - "yesterday" (24-47 hours)
 * - "X days ago" (2+ days, up to 30 days)
 * - Date in absolute format for dates older than 30 days
 *
 * Absolute format:
 * - Uses Intl.DateTimeFormat to produce locale-aware output
 * - Example: "June 4, 2026" (en-US)
 *
 * @param timestamp - Milliseconds since epoch
 * @param format - Either 'relative' or 'absolute'
 * @returns Formatted date string
 *
 * @example
 * formatDate(Date.now() - 3600000, 'relative') // "an hour ago"
 * formatDate(1717459200000, 'absolute') // "June 4, 2026"
 */
export function formatDate(timestamp: number, format: 'relative' | 'absolute'): string {
  if (format === 'absolute') {
    return formatAbsoluteDate(timestamp);
  }
  return formatRelativeDate(timestamp);
}

/**
 * Formats a timestamp as a relative date (e.g., "2 hours ago").
 *
 * @param timestamp - Milliseconds since epoch
 * @returns Formatted relative date string
 */
function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Less than a minute
  if (diffSeconds < 60) {
    return 'a few seconds ago';
  }

  // Minutes
  if (diffMinutes < 60) {
    if (diffMinutes === 1) {
      return 'a minute ago';
    }
    return `${diffMinutes} minutes ago`;
  }

  // Hours
  if (diffHours < 24) {
    if (diffHours === 1) {
      return 'an hour ago';
    }
    return `${diffHours} hours ago`;
  }

  // Yesterday
  if (diffDays === 1) {
    return 'yesterday';
  }

  // Days
  if (diffDays < 30) {
    return `${diffDays} days ago`;
  }

  // Fallback to absolute format for older dates
  return formatAbsoluteDate(timestamp);
}

/**
 * Formats a timestamp as an absolute date (e.g., "June 4, 2026").
 * Uses Intl.DateTimeFormat for locale-aware formatting.
 *
 * @param timestamp - Milliseconds since epoch
 * @returns Formatted absolute date string
 */
function formatAbsoluteDate(timestamp: number): string {
  const date = new Date(timestamp);
  const formatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return formatter.format(date);
}

/**
 * Groups an array of thoughts by their creation date (normalized to midnight).
 *
 * Returns a Map where each key is a date string in YYYY-MM-DD format and
 * each value is an array of thoughts created on that date, sorted by
 * createdAt in descending order (newest first).
 *
 * The Map maintains insertion order (oldest date first) to support
 * reverse chronological display.
 *
 * @param thoughts - Array of thoughts to group
 * @returns Map with date keys (YYYY-MM-DD) and grouped/sorted thoughts
 *
 * @example
 * const thoughts = [
 *   { id: '1', createdAt: 1717459200000, ... }, // June 4, 2026
 *   { id: '2', createdAt: 1717459300000, ... }, // June 4, 2026
 *   { id: '3', createdAt: 1717545600000, ... }, // June 5, 2026
 * ];
 * const grouped = groupThoughtsByDate(thoughts);
 * // Map {
 * //   '2026-06-04' => [thought2, thought1],  // sorted descending
 * //   '2026-06-05' => [thought3]
 * // }
 */
export function groupThoughtsByDate(thoughts: Thought[]): Map<string, Thought[]> {
  const groups = new Map<string, Thought[]>();

  for (const thought of thoughts) {
    const dateKey = getDateKey(thought.createdAt);

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }

    groups.get(dateKey)!.push(thought);
  }

  // Sort thoughts within each group by createdAt descending (newest first)
  for (const groupThoughts of groups.values()) {
    groupThoughts.sort((a, b) => b.createdAt - a.createdAt);
  }

  return groups;
}

/**
 * Converts a timestamp to a normalized date key (YYYY-MM-DD format).
 *
 * The date is normalized to midnight (start of day) in the local timezone
 * to ensure consistent grouping for all timestamps within the same calendar day.
 *
 * @param timestamp - Milliseconds since epoch
 * @returns Date key in YYYY-MM-DD format
 *
 * @example
 * getDateKey(1717459200000) // "2026-06-04"
 */
function getDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
