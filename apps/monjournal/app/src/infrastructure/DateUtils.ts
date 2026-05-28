/**
 * Utility functions for date and timestamp handling
 * 
 * Provides ISO 8601 timestamp generation, date formatting,
 * and validation functions for journal entries.
 */

/**
 * Gets the current UTC timestamp in ISO 8601 format
 * 
 * Format: YYYY-MM-DDTHH:mm:ssZ (e.g., 2026-05-28T14:30:00Z)
 * 
 * @returns ISO 8601 timestamp with Z suffix
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Gets today's date in YYYY-MM-DD format
 * 
 * @returns Today's date as string in format YYYY-MM-DD
 */
export function getTodayDate(): string {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = String(today.getUTCMonth() + 1).padStart(2, '0');
  const day = String(today.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts a date string in YYYY-MM-DD format to an ISO 8601 timestamp
 * 
 * The timestamp will represent the start of the day in UTC (00:00:00Z)
 * 
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns ISO 8601 timestamp with Z suffix
 * @throws Error if the date string is invalid
 */
export function dateToTimestamp(dateStr: string): string {
  // Validate format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
  }

  // Parse the date string
  const date = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  return date.toISOString();
}

/**
 * Extracts the date portion from an ISO 8601 timestamp
 * 
 * @param timestamp - ISO 8601 timestamp (e.g., 2026-05-28T14:30:00Z)
 * @returns Date in YYYY-MM-DD format
 * @throws Error if the timestamp is invalid
 */
export function timestampToDate(timestamp: string): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp: ${timestamp}`);
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a date string is in the past (before today) or is today
 * 
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns true if the date is today or in the past, false if in the future
 */
export function isDateNotInFuture(dateStr: string): boolean {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const parseDate = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(parseDate.getTime())) {
    return false;
  }

  return parseDate <= today;
}

/**
 * Formats an ISO 8601 timestamp for display
 * 
 * Returns a human-readable format (e.g., "May 28, 2026 at 2:30 PM")
 * 
 * @param timestamp - ISO 8601 timestamp
 * @param locale - Optional locale for formatting (defaults to en-US)
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: string, locale: string = 'en-US'): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

/**
 * Compares two ISO 8601 timestamps
 * 
 * @param timestamp1 - First ISO 8601 timestamp
 * @param timestamp2 - Second ISO 8601 timestamp
 * @returns Negative if timestamp1 < timestamp2, 0 if equal, positive if timestamp1 > timestamp2
 */
export function compareTimestamps(timestamp1: string, timestamp2: string): number {
  const date1 = new Date(timestamp1).getTime();
  const date2 = new Date(timestamp2).getTime();
  return date1 - date2;
}
