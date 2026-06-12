import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { User } from '@/api/types';
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/**
 * Custom hook for fetching all users from the API
 *
 * Uses React Query to manage server state with automatic caching,
 * background refetching, and stale-while-revalidate behavior.
 *
 * @returns {UseQueryResult<User[], Error>} React Query result with users list
 *   - data: Array of User objects
 *   - isLoading: True while initial fetch is in progress
 *   - isError: True if fetch failed
 *   - error: Error object if fetch failed
 *   - refetch: Function to manually refetch users
 *
 * @example
 * const { data: users, isLoading, error } = useUsers();
 * 
 * if (isLoading) return <div>Loading users...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * return <ul>{users?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
 *
 * @see {@link https://tanstack.com/query/latest/docs/react/overview React Query Docs}
 */
export function useUsers(): UseQueryResult<User[], Error> {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient<{ data: User[]; total: number }>(
        endpoints.users.list(),
      );
      return response.data;
    },
  });
}
