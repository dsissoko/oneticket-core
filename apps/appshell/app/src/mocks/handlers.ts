import { http, HttpResponse } from 'msw';
import type { User, CreateUserRequest, GetUsersResponse } from '../api/types';

// Mock user data
let mockUsers: User[] = [
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

export default [
  // GET /api/users
  http.get('/api/users', () => {
    const response: GetUsersResponse = {
      data: mockUsers,
      total: mockUsers.length,
    };
    return HttpResponse.json(response);
  }),

  // GET /api/users/:id
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ data: user });
  }),

  // GET /api/users/profile
  http.get('/api/users/profile', () => {
    // Return first admin as the authenticated user profile
    const user = mockUsers[0];
    return HttpResponse.json({ data: user });
  }),

  // POST /api/users
  http.post('/api/users', async (req) => {
    const body = await req.request.json() as CreateUserRequest;
    const newUser: User = {
      id: String(mockUsers.length + 1),
      ...body,
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return HttpResponse.json({ data: newUser }, { status: 201 });
  }),

  // PUT /api/users/:id
  http.put('/api/users/:id', async (req) => {
    const { id } = req.params;
    const body = await req.request.json() as Partial<User>;
    const userIndex = mockUsers.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...body,
    };
    return HttpResponse.json({ data: mockUsers[userIndex] });
  }),

  // DELETE /api/users/:id
  http.delete('/api/users/:id', ({ params }) => {
    const { id } = params;
    const userIndex = mockUsers.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }
    mockUsers.splice(userIndex, 1);
    return HttpResponse.json({}, { status: 204 });
  }),
];
