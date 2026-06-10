import React, { createContext, useContext } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/types';

interface ThemeContextValue {
  themes: Theme[];
  currentTheme: Theme | null;
  selectedThemeId: string | null;
  selectTheme: (themeId: string) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeDataProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const theme = useTheme();
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used inside ThemeDataProvider');
  return ctx;
}
