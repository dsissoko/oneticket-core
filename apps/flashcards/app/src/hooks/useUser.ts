import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { User } from '@/api/types';
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export function useUser(id: string): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await apiClient<{ data: User }>(
        endpoints.users.detail(id),
      );
      return response.data;
    },
    enabled: !!id,
  });
}
