import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import type { CreateUserRequest, User } from '@/api/types';
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export function useCreateUser(): UseMutationResult<
  User,
  Error,
  CreateUserRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      const response = await apiClient<{ data: User }>(
        endpoints.users.list(),
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
