import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { logger } from '@/lib/logger';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      logger.error('[query] fetch error', { queryKey: query.queryKey, error });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      logger.error('[mutation] error', error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
