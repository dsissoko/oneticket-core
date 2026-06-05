/**
 * Date grouping utilities
 * Groups thoughts by creation date for timeline view
 */

import { Thought } from '../models/types';

/**
 * Gets the date key (YYYY-MM-DD) from a timestamp
 * Normalizes to midnight UTC for consistent grouping
 * @param timestamp - Timestamp in milliseconds
 * @returns Date key in YYYY-MM-DD format
 */
const getDateKey = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Groups thoughts by creation date (normalized to day) in reverse chronological order
 * @param thoughts - Array of thoughts to group
 * @returns Map where keys are YYYY-MM-DD dates and values are arrays of thoughts
 */
export const groupThoughtsByDate = (thoughts: Thought[]): Map<string, Thought[]> => {
  const grouped = new Map<string, Thought[]>();

  // Group thoughts by date key
  for (const thought of thoughts) {
    const dateKey = getDateKey(thought.createdAt);
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(thought);
  }

  // Sort thoughts within each group by createdAt descending (newest first)
  for (const [, groupThoughts] of grouped) {
    groupThoughts.sort((a, b) => b.createdAt - a.createdAt);
  }

  // Convert to Map with sorted keys (newest dates first)
  const sortedGroups = new Map<string, Thought[]>();
  const sortedKeys = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a));
  
  for (const key of sortedKeys) {
    sortedGroups.set(key, grouped.get(key)!);
  }

  return sortedGroups;
};

/**
 * Converts a YYYY-MM-DD date key back to a timestamp at midnight
 * @param dateKey - Date key in YYYY-MM-DD format
 * @returns Timestamp in milliseconds at midnight UTC
 */
export const dateKeyToTimestamp = (dateKey: string): number => {
  return new Date(dateKey).getTime();
};
