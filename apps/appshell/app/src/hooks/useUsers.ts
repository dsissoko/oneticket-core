import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { User } from '../api/types';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

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
