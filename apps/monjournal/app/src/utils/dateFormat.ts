/**
 * Date formatting utilities for MonJournal
 * Provides relative (humanized) and absolute date formats
 */

/**
 * Format a timestamp as either relative ("2 hours ago") or absolute ("June 4, 2026")
 * @param timestamp - milliseconds since epoch
 * @param format - 'relative' for humanized time, 'absolute' for formatted date
 * @returns formatted date string
 */
export function formatDate(
  timestamp: number,
  format: 'relative' | 'absolute'
): string {
  if (format === 'relative') {
    return formatRelativeDate(timestamp);
  }
  return formatAbsoluteDate(timestamp);
}

/**
 * Format a timestamp as relative time (e.g., "2 hours ago", "yesterday")
 * Uses humanized time units for recent dates, falls back to day-based formatting for older dates
 */
function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;

  // Negative or future dates
  if (diffMs < 0) {
    return 'in the future';
  }

  // Convert to various time units
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  // Recent times (less than 1 minute)
  if (seconds < 60) {
    return 'just now';
  }

  // Minutes ago
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  // Hours ago (same day within 24 hours)
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  // Yesterday (within 24-48 hours)
  if (days === 1) {
    return 'yesterday';
  }

  // Days ago (within past week)
  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  // Weeks ago (within 4 weeks)
  if (weeks < 4) {
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }

  // Fall back to absolute format for older dates
  return formatAbsoluteDate(timestamp);
}

/**
 * Format a timestamp as absolute date (e.g., "June 4, 2026")
 * Uses Intl.DateTimeFormat for locale-aware formatting
 */
function formatAbsoluteDate(timestamp: number): string {
  const date = new Date(timestamp);

  try {
    // Use Intl.DateTimeFormat for locale-aware formatting
    // Format: "June 4, 2026"
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return formatter.format(date);
  } catch {
    // Fallback for environments without Intl support (rare)
    return fallbackDateFormat(date);
  }
}

/**
 * Fallback date formatting for environments without Intl support
 * Returns simple format: "Mon Jun 04 2026"
 */
function fallbackDateFormat(date: Date): string {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const month = monthNames[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month} ${day} ${year}`;
}
