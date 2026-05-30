import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { User } from '@/api/types';
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export function useProfile(): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: ['users', 'profile'],
    queryFn: async () => {
      const response = await apiClient<{ data: User }>(
        endpoints.users.profile(),
      );
      return response.data;
    },
  });
}
