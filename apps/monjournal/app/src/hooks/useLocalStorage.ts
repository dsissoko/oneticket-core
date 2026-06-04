/**
 * useLocalStorage - React hook for localStorage access
 * Provides getItem and setItem functions with graceful error handling
 */

/**
 * Reads a value from window.localStorage and parses it as JSON
 * @param key The localStorage key to read
 * @returns Parsed JSON value, or null if key doesn't exist or error occurs
 */
export function getItem(key: string): any {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn(`[useLocalStorage] localStorage is unavailable`);
      return null;
    }

    const item = window.localStorage.getItem(key);
    if (item === null) {
      return null;
    }

    return JSON.parse(item);
  } catch (error) {
    console.warn(`[useLocalStorage] Failed to read or parse item from localStorage with key "${key}":`, error);
    return null;
  }
}

/**
 * Writes a value to window.localStorage after serializing to JSON
 * @param key The localStorage key to write to
 * @param value The value to serialize and store
 */
export function setItem(key: string, value: any): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn(`[useLocalStorage] localStorage is unavailable`);
      return;
    }

    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
  } catch (error) {
    console.warn(`[useLocalStorage] Failed to write item to localStorage with key "${key}":`, error);
  }
}
