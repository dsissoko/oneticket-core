import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '@/types';
import worldCapitalsTheme from '@/data/themes/world-capitals.json';
import multiplicationTablesTheme from '@/data/themes/multiplication-tables.json';

const STORAGE_KEY = 'flashcards-selected-theme';

const themes: Theme[] = [worldCapitalsTheme as Theme, multiplicationTablesTheme as Theme];

interface UseThemeReturn {
  themes: Theme[];
  currentTheme: Theme | null;
  selectedThemeId: string | null;
  selectTheme: (themeId: string) => void;
}

/**
 * Hook for managing theme data and selection state.
 *
 * Loads theme data from JSON files, persists selected theme to localStorage,
 * and provides theme selection functionality.
 *
 * @returns {UseThemeReturn} Theme management interface
 *   - themes: Array of all available themes
 *   - currentTheme: The currently selected theme object
 *   - selectedThemeId: ID of the selected theme
 *   - selectTheme: Function to select a theme by ID
 *
 * @example
 * const { themes, currentTheme, selectTheme } = useTheme();
 * // Select a different theme
 * selectTheme('world-capitals');
 */
export function useTheme(): UseThemeReturn {
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY);
    }
    return null;
  });

  useEffect(() => {
    if (selectedThemeId && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, selectedThemeId);
    }
  }, [selectedThemeId]);

  const selectTheme = useCallback((themeId: string) => {
    setSelectedThemeId(themeId);
  }, []);

  const currentTheme = selectedThemeId
    ? themes.find((t) => t.id === selectedThemeId) ?? null
    : themes[0] ?? null;

  return {
    themes,
    currentTheme,
    selectedThemeId,
    selectTheme,
  };
}