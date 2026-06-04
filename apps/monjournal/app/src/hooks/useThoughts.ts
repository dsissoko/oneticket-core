import { useState, useEffect } from 'react';
import { Thought, validateThought } from '../models/thoughtModel';
import { Tag, deriveTags } from '../models/tagModel';
import { getItem, setItem } from './useLocalStorage';

const STORAGE_KEY = 'monjournal_thoughts';

/**
 * useThoughts - React hook for managing thoughts with localStorage persistence
 * 
 * Loads thoughts from localStorage on mount, provides methods to add thoughts,
 * retrieve thoughts, and derive tags. Automatically persists changes.
 */
export function useThoughts() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);

  /**
   * Load thoughts from localStorage on component mount
   */
  useEffect(() => {
    const loadThoughts = () => {
      const storedData = getItem(STORAGE_KEY);

      // Handle missing key - initialize with empty array
      if (storedData === null) {
        setThoughts([]);
        return;
      }

      // Validate that storedData is an array
      if (!Array.isArray(storedData)) {
        console.warn(`[useThoughts] Stored data is not an array, resetting to empty array`);
        setThoughts([]);
        return;
      }

      // Validate each thought entry
      const validThoughts: Thought[] = [];
      for (const item of storedData) {
        if (validateThought(item)) {
          validThoughts.push(item);
        } else {
          console.warn(`[useThoughts] Invalid thought entry found, skipping:`, item);
        }
      }

      // If any entries were invalid, log a warning
      if (validThoughts.length !== storedData.length) {
        console.warn(
          `[useThoughts] Data validation failed for ${storedData.length - validThoughts.length} entries`
        );
      }

      setThoughts(validThoughts);
    };

    loadThoughts();
  }, []);

  /**
   * Adds a new thought and persists to localStorage
   * @param thought - The Thought object to add
   */
  const addThought = (thought: Thought): void => {
    setThoughts((prevThoughts) => {
      const updatedThoughts = [...prevThoughts, thought];
      // Persist to localStorage
      setItem(STORAGE_KEY, updatedThoughts);
      return updatedThoughts;
    });
  };

  /**
   * Returns the current array of thoughts
   * @returns Array of Thought objects
   */
  const getThoughts = (): Thought[] => {
    return thoughts;
  };

  /**
   * Derives unique tags from all thoughts with deterministically assigned colors
   * @returns Array of Tag objects
   */
  const getTags = (): Tag[] => {
    return deriveTags(thoughts);
  };

  return {
    thoughts,
    addThought,
    getThoughts,
    getTags,
  };
}
