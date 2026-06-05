/**
 * Date formatting utilities
 * Provides both relative ("2 hours ago") and absolute ("June 4, 2026") formatting
 */

/**
 * Formats a timestamp as a relative or absolute date string
 * @param timestamp - Timestamp in milliseconds
 * @param format - 'relative' for "2 hours ago" style, 'absolute' for "June 4, 2026" style
 * @returns Formatted date string
 */
export const formatDate = (timestamp: number, format: 'relative' | 'absolute'): string => {
  const date = new Date(timestamp);

  if (format === 'relative') {
    return formatRelativeDate(timestamp);
  } else {
    return formatAbsoluteDate(date);
  }
};

/**
 * Formats a timestamp as a relative date (e.g., "2 hours ago", "yesterday")
 * @param timestamp - Timestamp in milliseconds
 * @returns Relative date string
 */
const formatRelativeDate = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  // Handle milliseconds
  const msInSecond = 1000;
  const msInMinute = 60 * msInSecond;
  const msInHour = 60 * msInMinute;
  const msInDay = 24 * msInHour;
  const msInWeek = 7 * msInDay;

  if (diff < msInMinute) {
    const seconds = Math.floor(diff / msInSecond);
    return seconds <= 0 ? 'now' : `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  }

  if (diff < msInHour) {
    const minutes = Math.floor(diff / msInMinute);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }

  if (diff < msInDay) {
    const hours = Math.floor(diff / msInHour);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  if (diff < msInDay * 2) {
    return 'yesterday';
  }

  if (diff < msInWeek) {
    const days = Math.floor(diff / msInDay);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  const weeks = Math.floor(diff / msInWeek);
  return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
};

/**
 * Formats a date as an absolute date string (e.g., "June 4, 2026")
 * Uses Intl.DateTimeFormat for locale-aware formatting
 * @param date - Date object
 * @returns Absolute date string
 */
const formatAbsoluteDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};
