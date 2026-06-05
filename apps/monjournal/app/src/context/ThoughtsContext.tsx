import React, { createContext, useContext } from 'react';
import { useThoughts, UseThoughtsReturn } from '@/hooks/useThoughts';

/**
 * ThoughtsContext
 *
 * Provides a shared instance of the useThoughts hook to all components.
 * This ensures that all components read and write to the same state,
 * so changes in one component (e.g., InlineAddThoughtForm) immediately
 * update in another (e.g., HomeScreen).
 */
const ThoughtsContext = createContext<UseThoughtsReturn | undefined>(undefined);

/**
 * ThoughtsProvider Component
 *
 * Wraps the application to provide shared thoughts state.
 * Should be placed near the root of the app (in main.tsx after BrowserRouter).
 */
export function ThoughtsProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const thoughtsData = useThoughts();

  return (
    <ThoughtsContext.Provider value={thoughtsData}>
      {children}
    </ThoughtsContext.Provider>
  );
}

/**
 * useThoughtsContext Hook
 *
 * Returns the shared thoughts state from the ThoughtsContext.
 * Must be used within a ThoughtsProvider.
 */
export function useThoughtsContext(): UseThoughtsReturn {
  const context = useContext(ThoughtsContext);
  if (!context) {
    throw new Error('useThoughtsContext must be used within a ThoughtsProvider');
  }
  return context;
}
