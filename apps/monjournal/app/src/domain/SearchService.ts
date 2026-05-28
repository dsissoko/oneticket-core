/**
 * Domain Layer: Search Service
 * 
 * Pure functional domain logic for filtering journal entries by date range.
 * Implements O(n) linear scanning with lexicographic date comparison.
 * All dates are treated as local (no timezone conversion).
 */

import { JournalEntry } from './Entry';

/**
 * Custom error type for search-related validation failures
 */
export class SearchValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'SearchValidationError';
  }
}

/**
 * Validates that a date string is in YYYY-MM-DD format
 * Does not check if date is valid or in past (that's done by filterByDateRange)
 * 
 * @param date - Date string to validate
 * @returns true if format is valid YYYY-MM-DD
 */
function isValidDateFormat(date: string): boolean {
  if (typeof date !== 'string') {
    return false;
  }

  // Check format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }

  // Parse and validate it's a real date
  const parsedDate = new Date(date + 'T00:00:00Z');
  if (isNaN(parsedDate.getTime())) {
    return false;
  }

  // Validate that the date components match what was parsed
  // This catches invalid dates like 2026-02-30
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  const isValidDate =
    dateObj.getUTCFullYear() === year &&
    dateObj.getUTCMonth() === month - 1 &&
    dateObj.getUTCDate() === day;

  return isValidDate;
}

/**
 * Validates date range: startDate and endDate must be valid and startDate <= endDate
 * 
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @throws SearchValidationError if validation fails
 */
function validateDateRange(startDate: string, endDate: string): void {
  // Validate startDate format
  if (!isValidDateFormat(startDate)) {
    throw new SearchValidationError(
      `La date de début doit être au format YYYY-MM-DD`,
      'INVALID_START_DATE_FORMAT',
      { startDate },
    );
  }

  // Validate endDate format
  if (!isValidDateFormat(endDate)) {
    throw new SearchValidationError(
      `La date de fin doit être au format YYYY-MM-DD`,
      'INVALID_END_DATE_FORMAT',
      { endDate },
    );
  }

  // Validate startDate <= endDate (lexicographic comparison works for YYYY-MM-DD)
  if (startDate > endDate) {
    throw new SearchValidationError(
      `La date de début doit être avant ou égale à la date de fin`,
      'INVALID_DATE_RANGE',
      { startDate, endDate },
    );
  }
}

/**
 * Filters journal entries by date range (inclusive on both bounds)
 * 
 * O(n) linear scan: iterates through all entries once
 * Lexicographic date comparison is valid for YYYY-MM-DD format
 * 
 * @param entries - Array of journal entries to filter
 * @param startDate - Start date in YYYY-MM-DD format (inclusive)
 * @param endDate - End date in YYYY-MM-DD format (inclusive)
 * @returns Array of entries where date >= startDate AND date <= endDate
 * @throws SearchValidationError if date format or range is invalid
 */
export function filterByDateRange(
  entries: JournalEntry[],
  startDate: string,
  endDate: string,
): JournalEntry[] {
  // Validate inputs
  validateDateRange(startDate, endDate);

  if (!Array.isArray(entries)) {
    throw new SearchValidationError(
      'Les entrées doivent être un tableau',
      'INVALID_ENTRIES_TYPE',
      { entriesType: typeof entries },
    );
  }

  // O(n) linear filter: compare dates lexicographically
  // YYYY-MM-DD format allows direct string comparison
  return entries.filter((entry) => entry.date >= startDate && entry.date <= endDate);
}

/**
 * Search criteria interface for type-safe search operations
 */
export interface SearchCriteria {
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
}

/**
 * Validates search criteria without filtering
 * Useful for early validation in hooks or components
 * 
 * @param criteria - Search criteria to validate
 * @throws SearchValidationError if criteria is invalid
 */
export function validateSearchCriteria(criteria: SearchCriteria): void {
  if (!criteria || typeof criteria !== 'object') {
    throw new SearchValidationError(
      'Les critères de recherche doivent être un objet',
      'INVALID_CRITERIA_TYPE',
      { criteriaType: typeof criteria },
    );
  }

  validateDateRange(criteria.startDate, criteria.endDate);
}
