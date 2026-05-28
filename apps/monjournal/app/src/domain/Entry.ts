/**
 * Domain Layer: JournalEntry Entity
 * 
 * Defines the core data model for journal entries with full type safety
 * and invariant validation. This is the foundation for all CRUD operations
 * and business logic in the application.
 */

/**
 * JournalEntry - Core domain entity for a journal entry
 * 
 * Invariants:
 * - `id` must be a valid UUID v4
 * - `date` must be in YYYY-MM-DD format (valid date, past or present)
 * - `text` must be non-empty
 * - `createdAt` is immutable after creation (ISO 8601 timestamp with Z suffix)
 * - `updatedAt` updates on each modification (ISO 8601 timestamp with Z suffix)
 * - `index` is optional and only used for multiple entries on the same date
 */
export type JournalEntry = {
  id: string;                    // UUID v4
  date: string;                  // YYYY-MM-DD format
  text: string;                  // Free-form text, non-empty
  createdAt: string;            // ISO 8601 timestamp (immutable)
  updatedAt: string;            // ISO 8601 timestamp (mutable)
  index?: number;               // Position if multiple entries same date
};

/**
 * Custom error type for entry validation failures
 */
export class EntryValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'EntryValidationError';
  }
}

/**
 * Validates that a date string is in valid YYYY-MM-DD format
 * and represents a valid date (past or present)
 */
export function validateDateFormat(date: string): boolean {
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

  // Ensure it's not a future date (past or present only)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (parsedDate > today) {
    return false;
  }

  return true;
}

/**
 * Validates that text is non-empty and valid
 */
export function validateText(text: string): boolean {
  if (typeof text !== 'string') {
    return false;
  }
  // Text must be non-empty after trimming
  return text.trim().length > 0;
}

/**
 * Validates a UUID v4 format
 */
export function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validates an ISO 8601 timestamp format
 */
export function validateISO8601(timestamp: string): boolean {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  if (!iso8601Regex.test(timestamp)) {
    return false;
  }

  // Verify it's a valid date
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}

/**
 * Validates a complete JournalEntry object against all invariants
 * 
 * @throws EntryValidationError if any invariant is violated
 */
export function validateJournalEntry(entry: unknown): asserts entry is JournalEntry {
  if (!entry || typeof entry !== 'object') {
    throw new EntryValidationError(
      'Entry must be a non-null object',
      'entry',
      { received: typeof entry },
    );
  }

  const obj = entry as Record<string, unknown>;

  // Validate id
  if (typeof obj.id !== 'string') {
    throw new EntryValidationError(
      'Entry id must be a string',
      'id',
      { received: typeof obj.id },
    );
  }
  if (!validateUUID(obj.id)) {
    throw new EntryValidationError(
      'Entry id must be a valid UUID v4',
      'id',
      { received: obj.id },
    );
  }

  // Validate date
  if (typeof obj.date !== 'string') {
    throw new EntryValidationError(
      'Entry date must be a string',
      'date',
      { received: typeof obj.date },
    );
  }
  if (!validateDateFormat(obj.date)) {
    throw new EntryValidationError(
      'Entry date must be in YYYY-MM-DD format and not in the future',
      'date',
      { received: obj.date },
    );
  }

  // Validate text
  if (typeof obj.text !== 'string') {
    throw new EntryValidationError(
      'Entry text must be a string',
      'text',
      { received: typeof obj.text },
    );
  }
  if (!validateText(obj.text)) {
    throw new EntryValidationError(
      'Entry text must be non-empty',
      'text',
      { received: obj.text },
    );
  }

  // Validate createdAt
  if (typeof obj.createdAt !== 'string') {
    throw new EntryValidationError(
      'Entry createdAt must be a string',
      'createdAt',
      { received: typeof obj.createdAt },
    );
  }
  if (!validateISO8601(obj.createdAt)) {
    throw new EntryValidationError(
      'Entry createdAt must be in ISO 8601 format',
      'createdAt',
      { received: obj.createdAt },
    );
  }

  // Validate updatedAt
  if (typeof obj.updatedAt !== 'string') {
    throw new EntryValidationError(
      'Entry updatedAt must be a string',
      'updatedAt',
      { received: typeof obj.updatedAt },
    );
  }
  if (!validateISO8601(obj.updatedAt)) {
    throw new EntryValidationError(
      'Entry updatedAt must be in ISO 8601 format',
      'updatedAt',
      { received: obj.updatedAt },
    );
  }

  // Validate index is optional number
  if (obj.index !== undefined) {
    if (typeof obj.index !== 'number' || obj.index < 0) {
      throw new EntryValidationError(
        'Entry index must be a non-negative number or undefined',
        'index',
        { received: obj.index },
      );
    }
  }
}

/**
 * Type guard to check if a value is a JournalEntry
 */
export function isJournalEntry(value: unknown): value is JournalEntry {
  try {
    validateJournalEntry(value);
    return true;
  } catch {
    return false;
  }
}
