import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '@/types';
import africaTheme from '@/data/themes/africa.json';
import antarcticaTheme from '@/data/themes/antarctica.json';
import asiaTheme from '@/data/themes/asia.json';
import europeEastTheme from '@/data/themes/europe-east.json';
import europeWestTheme from '@/data/themes/europe-west.json';
import northAmericaTheme from '@/data/themes/north-america.json';
import southAmericaTheme from '@/data/themes/south-america.json';
import australiaTheme from '@/data/themes/australia.json';
import bricsAllianceTheme from '@/data/themes/brics-alliance.json';
import natoAllianceTheme from '@/data/themes/nato-alliance.json';
import gdpBiggest20Theme from '@/data/themes/gdp-biggest-20.json';
import gdpLowest20Theme from '@/data/themes/gdp-lowest-20.json';
import multiplicationTablesTheme from '@/data/themes/multiplication-tables.json';
import conjugaisonsFrTheme from '@/data/themes/conjugaisons-fr.json';

const STORAGE_KEY = 'flashcards-selected-theme';

const themes: Theme[] = [
  africaTheme as Theme,
  antarcticaTheme as Theme,
  asiaTheme as Theme,
  europeEastTheme as Theme,
  europeWestTheme as Theme,
  northAmericaTheme as Theme,
  southAmericaTheme as Theme,
  australiaTheme as Theme,
  bricsAllianceTheme as Theme,
  natoAllianceTheme as Theme,
  gdpBiggest20Theme as Theme,
  gdpLowest20Theme as Theme,
  multiplicationTablesTheme as Theme,
  conjugaisonsFrTheme as Theme,
];

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
 * selectTheme('africa');
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