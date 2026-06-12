import type { User } from '@/api/types';

/**
 * Mock user data — used by MSW handlers to simulate a real backend.
 * Replace or extend this data when adapting AppShell Auth0 to your own project.
 */
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'alice@example.com',
    name: 'Alice Johnson',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'bob@example.com',
    name: 'Bob Smith',
    role: 'user',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'charlie@example.com',
    name: 'Charlie Brown',
    role: 'user',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    email: 'diana@example.com',
    name: 'Diana Prince',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    email: 'eve@example.com',
    name: 'Eve Wilson',
    role: 'user',
    createdAt: new Date().toISOString(),
  },
];
