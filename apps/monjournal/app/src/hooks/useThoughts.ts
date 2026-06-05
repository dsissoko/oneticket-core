/**
 * useThoughts Hook
 * Core data hook for MonJournal
 * Manages thought state, localStorage persistence, and tag derivation
 */

import { useState, useCallback, useEffect } from 'react';
import { Thought, Tag, FilterState } from '../models/types';
import { validateThoughts } from '../models/thoughtModel';
import { deriveTags } from '../models/tagModel';
import {
  useLocalStorageGetItem,
  useLocalStorageSetItem,
} from './useLocalStorage';

const STORAGE_KEY = 'monjournal_thoughts';

/**
 * Custom hook for managing thoughts and persistence
 * @returns Object with thoughts array and action methods
 */
export const useThoughts = () => {
  const [thoughts, setThoughts] = useState<Thought[]>(() => {
    // Initialize from localStorage on mount
    try {
      const stored = useLocalStorageGetItem(STORAGE_KEY);
      if (validateThoughts(stored)) {
        return stored;
      }
    } catch (error) {
      console.error('Failed to load thoughts from localStorage:', error);
    }
    return [];
  });

  // Persist to localStorage whenever thoughts change
  useEffect(() => {
    useLocalStorageSetItem(STORAGE_KEY, thoughts);
  }, [thoughts]);

  /**
   * Adds a new thought to the collection
   * @param thought - The thought to add
   */
  const addThought = useCallback((thought: Thought) => {
    setThoughts((prev) => [thought, ...prev]); // Add to front for newest first
  }, []);

  /**
   * Gets the current list of thoughts
   * @returns Array of all thoughts
   */
  const getThoughts = useCallback(() => {
    return thoughts;
  }, [thoughts]);

  /**
   * Gets all unique tags derived from thoughts
   * @returns Array of Tag objects with colors
   */
  const getTags = useCallback(() => {
    return deriveTags(thoughts);
  }, [thoughts]);

  /**
   * Applies filters to thoughts
   * Combines text search, date range, and tag filters with AND logic
   * @param filters - Filter criteria
   * @returns Filtered array of thoughts
   */
  const filterThoughts = useCallback(
    (filters: FilterState): Thought[] => {
      return thoughts.filter((thought) => {
        // Text search (case-insensitive)
        if (filters.text && filters.text.trim().length > 0) {
          const query = filters.text.toLowerCase();
          const titleMatch = thought.title.toLowerCase().includes(query);
          const contentMatch = thought.content.toLowerCase().includes(query);
          if (!titleMatch && !contentMatch) {
            return false;
          }
        }

        // Date range filter (inclusive)
        if (filters.dateStart !== null && filters.dateStart !== undefined) {
          if (thought.createdAt < filters.dateStart) {
            return false;
          }
        }
        if (filters.dateEnd !== null && filters.dateEnd !== undefined) {
          if (thought.createdAt > filters.dateEnd) {
            return false;
          }
        }

        // Tag filter (any selected tag must match)
        if (
          filters.selectedTags &&
          filters.selectedTags.length > 0
        ) {
          const hasMatchingTag = filters.selectedTags.some((selectedTag) =>
            thought.tags.includes(selectedTag)
          );
          if (!hasMatchingTag) {
            return false;
          }
        }

        return true;
      });
    },
    [thoughts]
  );

  return {
    thoughts,
    addThought,
    getThoughts,
    getTags,
    filterThoughts,
  };
};
