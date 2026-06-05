/**
 * Tests for useLocalStorage utility functions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getItem, setItem } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear console spies
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getItem', () => {
    it('should retrieve and parse a JSON value from localStorage', () => {
      const testData = { key: 'value', count: 42 };
      localStorage.setItem('testKey', JSON.stringify(testData));

      const result = getItem('testKey');

      expect(result).toEqual(testData);
    });

    it('should return null if key does not exist', () => {
      const result = getItem('nonexistentKey');

      expect(result).toBeNull();
    });

    it('should return null and log error if JSON is corrupted', () => {
      localStorage.setItem('corruptKey', 'not valid json {]');
      const consoleSpy = vi.spyOn(console, 'error');

      const result = getItem('corruptKey');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle parsing empty string', () => {
      localStorage.setItem('emptyKey', '');
      const consoleSpy = vi.spyOn(console, 'error');

      const result = getItem('emptyKey');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should parse arrays correctly', () => {
      const testArray = ['item1', 'item2', 'item3'];
      localStorage.setItem('arrayKey', JSON.stringify(testArray));

      const result = getItem('arrayKey');

      expect(result).toEqual(testArray);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should parse nested objects', () => {
      const testData = {
        user: { name: 'John', age: 30 },
        tags: ['tag1', 'tag2'],
      };
      localStorage.setItem('nestedKey', JSON.stringify(testData));

      const result = getItem('nestedKey');

      expect(result).toEqual(testData);
    });
  });

  describe('setItem', () => {
    it('should serialize and store a value in localStorage', () => {
      const testData = { key: 'value', count: 42 };

      setItem('testKey', testData);

      const stored = localStorage.getItem('testKey');
      expect(stored).toBe(JSON.stringify(testData));
    });

    it('should serialize arrays', () => {
      const testArray = ['item1', 'item2'];

      setItem('arrayKey', testArray);

      const stored = localStorage.getItem('arrayKey');
      expect(stored).toBe(JSON.stringify(testArray));
    });

    it('should serialize primitive values', () => {
      setItem('stringKey', 'test string');
      setItem('numberKey', 123);
      setItem('boolKey', true);

      expect(localStorage.getItem('stringKey')).toBe('"test string"');
      expect(localStorage.getItem('numberKey')).toBe('123');
      expect(localStorage.getItem('boolKey')).toBe('true');
    });

    it('should overwrite existing keys', () => {
      setItem('key', 'old value');
      setItem('key', 'new value');

      expect(getItem('key')).toBe('new value');
    });

    it('should log error on quota exceeded', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      // Mock localStorage to throw QuotaExceededError
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      setItem('key', 'value');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('quota exceeded')
      );
      Storage.prototype.setItem = originalSetItem;
    });

    it('should handle undefined and null values', () => {
      setItem('undefinedKey', undefined);
      setItem('nullKey', null);

      // JSON.stringify(undefined) returns undefined (not a string),
      // so localStorage.setItem('key', undefined) is effectively a no-op
      // The key won't be set, so getItem returns null
      expect(getItem('undefinedKey')).toBeNull();
      // JSON.stringify(null) returns 'null', which parses back to null
      expect(getItem('nullKey')).toBeNull();
    });

    it('should not throw on error', () => {
      // Mock localStorage to throw an error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        setItem('key', 'value');
      }).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('round-trip serialization', () => {
    it('should preserve complex data structures', () => {
      const complexData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Morning reflection',
        content: 'Woke up early today, feeling productive.',
        createdAt: 1717459200000,
        tags: ['personal', 'morning'],
      };

      setItem('thought', complexData);
      const retrieved = getItem('thought');

      expect(retrieved).toEqual(complexData);
    });

    it('should handle multiple items independently', () => {
      setItem('item1', { data: 'first' });
      setItem('item2', { data: 'second' });

      expect(getItem('item1')).toEqual({ data: 'first' });
      expect(getItem('item2')).toEqual({ data: 'second' });
    });
  });
});
