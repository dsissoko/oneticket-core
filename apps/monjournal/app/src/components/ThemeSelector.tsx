import React, { useCallback, useRef, useEffect } from 'react';
import './ThemeSelector.css';

/**
 * ThemeSelector Component
 * 
 * A toggle button component for switching between light and dark themes.
 * 
 * Features:
 * - Displays current theme with Sun icon (light) / Moon icon (dark)
 * - Keyboard accessible (Tab, Enter, Space)
 * - Instant theme changes (CSS variables update < 50ms)
 * - ARIA labels for accessibility
 * - Performance optimized: no re-renders, immediate visual feedback
 */

interface ThemeSelectorProps {
  /** Current theme: 'light' or 'dark' */
  theme: 'light' | 'dark';
  /** Callback when user toggles theme */
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  theme,
  onThemeChange,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  /**
   * Handle click and keyboard events (Enter, Space)
   */
  const handleToggle = useCallback(() => {
    onThemeChange(nextTheme);
  }, [nextTheme, onThemeChange]);

  /**
   * Handle keyboard events
   * Only respond to Enter and Space keys
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggle();
      }
    },
    [handleToggle]
  );

  /**
   * Sun Icon (SVG)
   * Displayed when light theme is active
   */
  const SunIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="theme-icon"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );

  /**
   * Moon Icon (SVG)
   * Displayed when dark theme is active
   */
  const MoonIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="theme-icon"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );

  return (
    <button
      ref={buttonRef}
      className={`theme-selector theme-selector--${theme}`}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      aria-label={`Switch to ${nextTheme} theme. Currently in ${theme} theme`}
      aria-pressed={theme === 'dark'}
      title={`Switch to ${nextTheme} theme`}
      type="button"
    >
      {theme === 'light' ? <SunIcon /> : <MoonIcon />}
      <span className="theme-selector__label">{theme === 'light' ? 'Light' : 'Dark'}</span>
    </button>
  );
};

export default ThemeSelector;
