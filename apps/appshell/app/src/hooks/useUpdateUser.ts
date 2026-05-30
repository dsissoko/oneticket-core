import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import type { User } from '@/api/types';
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export interface UpdateUserInput {
  id: string;
  data: Partial<User>;
}

export function useUpdateUser(): UseMutationResult<
  User,
  Error,
  UpdateUserInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateUserInput) => {
      const response = await apiClient<{ data: User }>(
        endpoints.users.detail(id),
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', data.id] });
    },
  });
}
