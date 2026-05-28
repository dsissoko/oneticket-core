import { useState, useEffect } from 'react';

/**
 * Theme type definition
 */
type Theme = 'light' | 'dark';

/**
 * useTheme hook
 * 
 * Manages light/dark theme state with the following behavior:
 * 1. On mount: Check localStorage['journal_theme']
 * 2. If found: Use stored preference
 * 3. If not found: Detect system preference via matchMedia('(prefers-color-scheme: dark)')
 * 4. Apply theme: Set document.documentElement.setAttribute('data-theme', theme)
 * 5. Save to localStorage: Store user's preference for next visit
 * 
 * Returns { theme, setTheme }
 * - theme: Current theme ('light' | 'dark')
 * - setTheme: Function to change theme and persist to localStorage
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>('light');

  // Initialize theme on component mount
  useEffect(() => {
    // 1. Check localStorage for stored preference
    const storedTheme = localStorage.getItem('journal_theme') as Theme | null;

    let initialTheme: Theme;

    if (storedTheme) {
      // Use stored preference if available
      initialTheme = storedTheme;
    } else {
      // Detect system preference on first visit
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      initialTheme = prefersDark ? 'dark' : 'light';
    }

    // 2. Set React state
    setThemeState(initialTheme);

    // 3. Apply theme to root element
    applyThemeToRoot(initialTheme);

    // 4. Save to localStorage if not already stored
    if (!storedTheme) {
      localStorage.setItem('journal_theme', initialTheme);
    }
  }, []);

  /**
   * setTheme function
   * Changes theme and persists to localStorage
   * 
   * @param newTheme - 'light' or 'dark'
   */
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyThemeToRoot(newTheme);
    localStorage.setItem('journal_theme', newTheme);
  };

  return { theme, setTheme };
};

/**
 * Helper function to apply theme to root element
 * Sets data-theme attribute which triggers CSS variable changes
 * 
 * @param theme - 'light' or 'dark'
 */
function applyThemeToRoot(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}
