/**
 * useLocalStorage utility functions
 * Provides safe, error-tolerant JSON serialization and deserialization
 * Never throws — always logs errors gracefully
 */

/**
 * Safely retrieve and parse an item from localStorage
 * Returns null if the key doesn't exist or JSON parsing fails
 *
 * @param key - The localStorage key to retrieve
 * @returns The parsed value, or null if missing/corrupted
 *
 * @example
 * const data = getItem("mydata");
 * // If localStorage has: {"key": "value"}, returns { key: "value" }
 * // If key missing or JSON corrupt, returns null
 */
export function getItem(key: string): any {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const item = window.localStorage.getItem(key);

    // Key doesn't exist
    if (item === null) {
      return null;
    }

    // Parse and return the JSON value
    return JSON.parse(item);
  } catch (error) {
    // Log the error for debugging but don't throw
    if (error instanceof Error) {
      console.error(`Error reading localStorage key "${key}":`, error.message);
    } else {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    return null;
  }
}

/**
 * Safely serialize and store a value in localStorage
 * Never throws — logs errors gracefully on quota exceeded or other failures
 *
 * @param key - The localStorage key to store under
 * @param value - The value to serialize and store
 *
 * @example
 * setItem("mydata", { key: "value" });
 * // Stores JSON stringified version in localStorage
 * // If storage full or unavailable, logs error but doesn't throw
 */
export function setItem(key: string, value: any): void {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('localStorage is not available');
      return;
    }

    // Serialize to JSON and write
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
  } catch (error) {
    // Handle quota exceeded, security restrictions, and other errors
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        console.error(`localStorage quota exceeded for key "${key}"`);
      } else {
        console.error(`Error writing localStorage key "${key}":`, error.message);
      }
    } else {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
    // Don't throw — let the app continue
  }
}
