/**
 * useThoughts React hook
 * Manages thought data lifecycle with localStorage persistence
 * Automatically loads on mount, persists on addThought
 */

import { useState, useEffect } from 'react';
import { Thought, Tag } from '../models/types';
import { validateThought } from '../models/thoughtModel';
import { deriveTags } from '../models/tagModel';
import { getItem, setItem } from './useLocalStorage';

/**
 * localStorage key for persisting thoughts
 */
const THOUGHTS_STORAGE_KEY = 'monjournal_thoughts';

/**
 * Hook that manages thought state with localStorage persistence
 *
 * @returns Object with thought list and mutation methods
 * @example
 * const { thoughts, addThought, getTags, getThoughts } = useThoughts();
 */
export function useThoughts() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);

  /**
   * Load thoughts from localStorage on component mount
   * Validates all loaded thoughts, resets to empty array if corrupted
   */
  useEffect(() => {
    const loadedData = getItem(THOUGHTS_STORAGE_KEY);

    // If key doesn't exist or parsing failed, initialize to empty array
    if (loadedData === null) {
      setThoughts([]);
      return;
    }

    // Ensure we have an array
    if (!Array.isArray(loadedData)) {
      console.warn('localStorage data is not an array, resetting to empty');
      setThoughts([]);
      return;
    }

    // Validate each thought, filter out invalid ones
    const validatedThoughts = loadedData.filter((item: any) => {
      if (!validateThought(item)) {
        console.warn('Skipping invalid thought:', item);
        return false;
      }
      return true;
    });

    setThoughts(validatedThoughts);
  }, []);

  /**
   * Add a new thought and persist to localStorage
   * @param thought - The thought to add
   */
  const addThought = (thought: Thought): void => {
    // Create new array for immutability
    const updatedThoughts = [...thoughts, thought];
    setThoughts(updatedThoughts);
    // Persist to localStorage
    setItem(THOUGHTS_STORAGE_KEY, updatedThoughts);
  };

  /**
   * Get all unique tags derived from current thoughts
   * @returns Array of Tag objects with computed colors
   */
  const getTags = (): Tag[] => {
    return deriveTags(thoughts);
  };

  /**
   * Get the current thoughts array
   * @returns Array of thoughts
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
