/**
 * Utility for generating UUIDs
 * 
 * Uses the native crypto.randomUUID() API when available,
 * with a fallback to a deterministic implementation for testing.
 */

/**
 * Generates a UUID v4 string
 * 
 * @returns A valid UUID v4 in the format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateUUID(): string {
  // Use native crypto.randomUUID() if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID()
  return generateUUIDFallback();
}

/**
 * Fallback UUID v4 generator using Math.random()
 * This is deterministic and suitable for testing.
 */
function generateUUIDFallback(): string {
  const chars = '0123456789abcdef';
  let uuid = '';

  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-';
    } else if (i === 14) {
      // Version 4 identifier
      uuid += '4';
    } else if (i === 19) {
      // Variant 1 identifier (8, 9, a, or b)
      uuid += chars[Math.floor(Math.random() * 4) + 8];
    } else {
      uuid += chars[Math.floor(Math.random() * 16)];
    }
  }

  return uuid;
}
