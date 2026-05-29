import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton QueryClient instance for the application.
 * 
 * Configuration:
 * - staleTime: 5 minutes — data is considered fresh for 5 minutes
 * - gcTime: 10 minutes — garbage collection after 10 minutes of inactivity
 * - retry: 1 — retry once on network failure
 * - refetchOnWindowFocus: true — refetch when window regains focus
 * 
 * This instance is provided to the entire app via QueryClientProvider in main.tsx.
 * Multiple instances would cause cache collisions and memory leaks.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});
