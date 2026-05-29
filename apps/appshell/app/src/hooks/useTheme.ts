import { useAppStore } from '../stores/appStore';

/**
 * Custom hook for theme state management
 *
 * Provides access to current theme preference and a setter function.
 * Theme can be 'system', 'light', or 'dark'.
 *
 * @returns {Object} Theme state and setter
 * @returns {Theme} theme - Current theme preference ('system', 'light', or 'dark')
 * @returns {Function} setTheme - Function to update theme preference
 * @returns {'light' | 'dark'} resolvedTheme - Computed theme based on system preference
 *
 * @example
 * const { theme, setTheme, resolvedTheme } = useTheme();
 * return (
 *   <button onClick={() => setTheme('dark')}>
 *     Current theme: {resolvedTheme}
 *   </button>
 * );
 */
export function useTheme() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const resolvedTheme = useAppStore((state) => state.resolvedTheme);

  return { theme, setTheme, resolvedTheme };
}
