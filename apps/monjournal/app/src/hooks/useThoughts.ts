import { useState, useEffect } from 'react';
import { Thought, validateThought } from '../models/thoughtModel';
import { Tag, deriveTags } from '../models/tagModel';
import { getItem, setItem } from './useLocalStorage';
import { generateSampleThoughts } from '../utils/sampleThoughts';

const STORAGE_KEY = 'monjournal_thoughts';
const SEED_KEY = 'monjournal_seeded';

export interface UseThoughtsReturn {
  thoughts: Thought[];
  addThought(thought: Thought): void;
  getTags(): Tag[];
  getThoughts(): Thought[];
}

/**
 * Hook for managing thoughts with localStorage persistence.
 * Loads from localStorage on mount and persists on every addThought call.
 */
export function useThoughts(): UseThoughtsReturn {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to load thoughts from localStorage
  const loadThoughtsFromStorage = (): Thought[] => {
    try {
      // Check if this is the first visit
      const hasBeenSeeded = getItem(SEED_KEY);
      let stored = getItem(STORAGE_KEY);

      // If no data exists and never seeded, generate sample data
      if (!stored && !hasBeenSeeded) {
        const sampleThoughts = generateSampleThoughts();
        setItem(STORAGE_KEY, sampleThoughts);
        setItem(SEED_KEY, true);
        return sampleThoughts;
      } else if (!stored) {
        // Key doesn't exist or couldn't be read
        return [];
      } else if (Array.isArray(stored)) {
        // Validate all thoughts, filter out invalid ones
        return stored.filter((t: any) => validateThought(t));
      } else {
        // Corrupted data, reset to empty
        console.warn('Corrupted localStorage data, resetting to empty');
        return [];
      }
    } catch (error) {
      console.error('Failed to load thoughts from localStorage:', error);
      return [];
    }
  };

  // Load from localStorage on component mount
  useEffect(() => {
    if (isInitialized) return;

    const loaded = loadThoughtsFromStorage();
    setThoughts(loaded);
    setIsInitialized(true);
  }, [isInitialized]);

  /**
   * Adds a new thought and persists to localStorage.
   * Reloads from localStorage to sync with other instances of the hook.
   */
  const addThought = (thought: Thought): void => {
    setThoughts((prev) => {
      const updated = [...prev, thought];
      // Persist to localStorage
      setItem(STORAGE_KEY, updated);
      return updated;
    });
  };

  /**
   * Gets all unique tags from current thoughts.
   */
  const getTags = (): Tag[] => {
    return deriveTags(thoughts);
  };

  /**
   * Returns current thoughts array.
   */
  const getThoughts = (): Thought[] => {
    return [...thoughts];
  };

  return {
    thoughts,
    addThought,
    getTags,
    getThoughts,
  };
}
