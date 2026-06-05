/**
 * Retrieves an item from localStorage by key.
 * Returns parsed JSON value or null if key doesn't exist or parsing fails.
 */
export function getItem(key: string): any {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const value = window.localStorage.getItem(key);
    if (value === null) {
      return null;
    }
    return JSON.parse(value);
  } catch (error) {
    console.error(`Failed to read localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Stores a value in localStorage under the given key.
 * Serializes the value as JSON.
 * Silently fails if localStorage is unavailable.
 */
export function setItem(key: string, value: any): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write to localStorage key "${key}":`, error);
  }
}
