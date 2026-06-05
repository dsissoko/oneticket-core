import { useState, useEffect } from 'react';
import { Thought, validateThought } from '../models/thoughtModel';
import { Tag, deriveTags } from '../models/tagModel';
import { getItem, setItem } from './useLocalStorage';

const STORAGE_KEY = 'monjournal_thoughts';

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

  // Load from localStorage on component mount
  useEffect(() => {
    if (isInitialized) return;

    try {
      const stored = getItem(STORAGE_KEY);

      if (!stored) {
        // Key doesn't exist or couldn't be read
        setThoughts([]);
      } else if (Array.isArray(stored)) {
        // Validate all thoughts, filter out invalid ones
        const validThoughts = stored.filter((t: any) => validateThought(t));
        setThoughts(validThoughts);
      } else {
        // Corrupted data, reset to empty
        console.warn('Corrupted localStorage data, resetting to empty');
        setThoughts([]);
      }
    } catch (error) {
      console.error('Failed to load thoughts from localStorage:', error);
      setThoughts([]);
    }

    setIsInitialized(true);
  }, [isInitialized]);

  /**
   * Adds a new thought and persists to localStorage.
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
