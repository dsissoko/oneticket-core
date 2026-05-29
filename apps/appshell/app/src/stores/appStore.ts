import { create } from 'zustand';

export type Theme = 'system' | 'light' | 'dark';

export interface AppStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const STORAGE_KEY = 'app:theme';

/**
 * Get system theme preference
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get resolved theme based on current setting and system preference
 */
function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme as 'light' | 'dark';
}

/**
 * Apply theme to DOM and update CSS variables
 */
function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const resolved = getResolvedTheme(theme);
  const html = document.documentElement;

  // Update data-theme attribute
  html.setAttribute('data-theme', resolved);

  // Store preference in localStorage
  if (theme !== 'system') {
    localStorage.setItem(STORAGE_KEY, theme);
  } else {
    localStorage.setItem(STORAGE_KEY, 'system');
  }
}

/**
 * Get persisted theme from localStorage or system preference
 */
function getInitialTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'system';

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

export const useAppStore = create<AppStore>((set) => {
  const initialTheme = getInitialTheme();

  // Apply initial theme on creation
  applyTheme(initialTheme);

  return {
    theme: initialTheme,
    resolvedTheme: getResolvedTheme(initialTheme),
    setTheme: (theme: Theme) => {
      applyTheme(theme);
      set({
        theme,
        resolvedTheme: getResolvedTheme(theme),
      });
    },
  };
});

/**
 * Listen to system theme changes
 */
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = () => {
    const state = useAppStore.getState();
    if (state.theme === 'system') {
      state.setTheme('system');
    }
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
  } else if (mediaQuery.addListener) {
    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
  }
}
