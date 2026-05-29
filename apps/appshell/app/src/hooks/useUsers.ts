import { useQuery } from '@tanstack/react-query';
import { usersSchema } from '@/lib/schemas/users';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      return usersSchema.parse(data);
    },
  });
}
