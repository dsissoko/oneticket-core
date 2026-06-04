/**
 * Date formatting utility for MonJournal
 * Supports both relative (humanized) and absolute date formatting
 */

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_WEEK = 7 * ONE_DAY;
const ONE_MONTH = 30 * ONE_DAY;
const ONE_YEAR = 365 * ONE_DAY;

/**
 * Formats a timestamp as a relative date string using natural language
 * Examples: "2 hours ago", "yesterday", "3 days ago", "last week"
 *
 * @param timestamp - The time in milliseconds since epoch
 * @returns A human-readable relative date string
 */
function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  // Handle future dates
  if (diff < 0) {
    const futureDiff = Math.abs(diff);
    if (futureDiff < ONE_HOUR) {
      return "in a few moments";
    } else if (futureDiff < ONE_DAY) {
      const hours = Math.floor(futureDiff / ONE_HOUR);
      return `in ${hours} hour${hours > 1 ? "s" : ""}`;
    } else if (futureDiff < ONE_WEEK) {
      const days = Math.floor(futureDiff / ONE_DAY);
      return `in ${days} day${days > 1 ? "s" : ""}`;
    } else if (futureDiff < ONE_MONTH) {
      const weeks = Math.floor(futureDiff / ONE_WEEK);
      return `in ${weeks} week${weeks > 1 ? "s" : ""}`;
    }
  }

  // Handle recent dates
  if (diff < ONE_MINUTE) {
    return "just now";
  }

  if (diff < ONE_HOUR) {
    const minutes = Math.floor(diff / ONE_MINUTE);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  if (diff < ONE_DAY) {
    const hours = Math.floor(diff / ONE_HOUR);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  // Handle day-based intervals
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if it's yesterday
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return "yesterday";
  }

  // Check if it's today
  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return "today";
  }

  if (diff < ONE_WEEK) {
    const days = Math.floor(diff / ONE_DAY);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  if (diff < ONE_MONTH) {
    const weeks = Math.floor(diff / ONE_WEEK);
    if (weeks === 1) {
      return "last week";
    }
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  if (diff < ONE_YEAR) {
    const months = Math.floor(diff / ONE_MONTH);
    if (months === 1) {
      return "last month";
    }
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  // Very old dates
  const years = Math.floor(diff / ONE_YEAR);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

/**
 * Formats a timestamp as an absolute date string
 * Format: "June 4, 2026" using locale-aware formatting
 *
 * @param timestamp - The time in milliseconds since epoch
 * @returns A formatted date string in the format "Month DD, YYYY"
 */
function formatAbsoluteDate(timestamp: number): string {
  const date = new Date(timestamp);
  
  // Use Intl.DateTimeFormat for locale-aware formatting
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return formatter.format(date);
}

/**
 * Formats a timestamp according to the specified format type
 *
 * @param timestamp - The time in milliseconds since epoch
 * @param format - Format type: 'relative' for humanized dates (e.g., "2 hours ago")
 *                            or 'absolute' for formatted dates (e.g., "June 4, 2026")
 * @returns A formatted date string
 *
 * @example
 * // Relative format
 * formatDate(Date.now() - 2 * 60 * 60 * 1000, 'relative')
 * // => "2 hours ago"
 *
 * @example
 * // Absolute format
 * formatDate(new Date("2026-06-04").getTime(), 'absolute')
 * // => "June 4, 2026"
 */
export function formatDate(
  timestamp: number,
  format: "relative" | "absolute"
): string {
  if (format === "relative") {
    return formatRelativeDate(timestamp);
  } else {
    return formatAbsoluteDate(timestamp);
  }
}
