/**
 * useLocalStorage Hook
 * Provides a thin wrapper around window.localStorage with JSON serialization
 * Gracefully handles errors if storage is unavailable
 */

/**
 * Retrieves an item from localStorage with JSON deserialization
 * @param key - Storage key
 * @returns Parsed value or null if not found or invalid
 */
export const useLocalStorageGetItem = (key: string): any => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Failed to read localStorage key "${key}":`, error);
    return null;
  }
};

/**
 * Sets an item in localStorage with JSON serialization
 * @param key - Storage key
 * @param value - Value to store (will be JSON serialized)
 */
export const useLocalStorageSetItem = (key: string, value: any): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('localStorage is not available');
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write localStorage key "${key}":`, error);
    if (error instanceof Error) {
      // Check for quota exceeded
      if (
        error.name === 'QuotaExceededError' ||
        error.message.includes('quota')
      ) {
        console.error('localStorage quota exceeded');
      }
    }
  }
};

/**
 * Removes an item from localStorage
 * @param key - Storage key
 */
export const useLocalStorageRemoveItem = (key: string): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove localStorage key "${key}":`, error);
  }
};

/**
 * Clears all items from localStorage
 */
export const useLocalStorageClear = (): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.clear();
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};
