import { useState, useEffect } from 'react';
import type { Thought } from '../models/thoughtModel';
import { validateThought } from '../models/thoughtModel';
import { deriveTags } from '../models/tagModel';
import type { Tag } from '../models/tagModel';

const STORAGE_KEY = 'monjournal_thoughts';

/**
 * Custom React hook for managing thoughts with localStorage persistence.
 *
 * Lifecycle:
 * 1. On mount, loads thoughts from localStorage key 'monjournal_thoughts'
 * 2. Validates loaded data via validateThought()
 * 3. Returns object with thoughts, addThought, getTags, getThoughts methods
 * 4. Persists to localStorage whenever addThought is called
 * 5. Handles localStorage unavailability gracefully (log warning, continue with in-memory state)
 * 6. Handles corrupted JSON (reset to empty array)
 *
 * @returns Object with:
 *   - thoughts: Thought[] — current thoughts array
 *   - addThought: (t: Thought) => void — add new thought and persist
 *   - getTags: () => Tag[] — get all unique tags with colors
 *   - getThoughts: () => Thought[] — get current thoughts
 *
 * @example
 * const { thoughts, addThought, getTags } = useThoughts();
 * addThought({ id: '1', title: 'Test', content: 'Content', createdAt: Date.now(), tags: [] });
 * const tags = getTags(); // Derived tags with colors
 */
export function useThoughts(): {
  thoughts: Thought[];
  addThought: (t: Thought) => void;
  getTags: () => Tag[];
  getThoughts: () => Thought[];
} {
  const [thoughts, setThoughts] = useState<Thought[]>([]);

  // Load thoughts from localStorage on mount
  useEffect(() => {
    const loadThoughts = (): void => {
      try {
        const item = localStorage.getItem(STORAGE_KEY);

        if (item === null) {
          // Key doesn't exist, initialize with empty array
          setThoughts([]);
          return;
        }

        // Parse JSON
        const parsed = JSON.parse(item);

        // Ensure it's an array
        if (!Array.isArray(parsed)) {
          console.warn(
            `[useThoughts] Expected array from localStorage, got ${typeof parsed}. Resetting to empty array.`
          );
          setThoughts([]);
          return;
        }

        // Validate each item in the array
        const validatedThoughts: Thought[] = [];
        for (const item of parsed) {
          if (validateThought(item)) {
            validatedThoughts.push(item);
          } else {
            console.warn(
              `[useThoughts] Invalid thought in localStorage, skipping:`,
              item
            );
          }
        }

        setThoughts(validatedThoughts);
      } catch (error) {
        // Handle JSON.parse failure or other errors
        if (error instanceof SyntaxError) {
          console.error(
            '[useThoughts] Failed to parse localStorage JSON. Resetting to empty array.',
            error
          );
        } else {
          console.error('[useThoughts] Error loading thoughts from localStorage:', error);
        }
        setThoughts([]);
      }
    };

    loadThoughts();
  }, []);

  /**
   * Persists thoughts array to localStorage.
   * Called whenever the thoughts state changes.
   * Logs warnings if localStorage is unavailable.
   */
  const persistToStorage = (newThoughts: Thought[]): void => {
    try {
      const serialized = JSON.stringify(newThoughts);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('[useThoughts] localStorage quota exceeded. Data not persisted.');
      } else if (error instanceof Error && error.name === 'NS_ERROR_FILE_CORRUPTED') {
        console.warn('[useThoughts] localStorage is unavailable. Data not persisted.');
      } else {
        console.warn('[useThoughts] Failed to persist thoughts to localStorage:', error);
      }
      // Continue with in-memory state; do not crash
    }
  };

  /**
   * Adds a new thought and persists to localStorage.
   *
   * @param thought - The Thought object to add
   */
  const addThought = (thought: Thought): void => {
    setThoughts((prevThoughts: Thought[]) => {
      const newThoughts = [...prevThoughts, thought];
      persistToStorage(newThoughts);
      return newThoughts;
    });
  };

  /**
   * Gets all unique tags from current thoughts, with deterministic colors.
   *
   * @returns Array of Tag objects with name and color
   */
  const getTags = (): Tag[] => {
    return deriveTags(thoughts);
  };

  /**
   * Gets the current thoughts array.
   *
   * @returns Array of Thought objects
   */
  const getThoughts = (): Thought[] => {
    return thoughts;
  };

  return {
    thoughts,
    addThought,
    getTags,
    getThoughts,
  };
}
