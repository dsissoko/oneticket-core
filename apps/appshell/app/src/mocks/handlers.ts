import { http, HttpResponse } from 'msw';
import type { CreateUserRequest, GetUsersResponse, User } from '@/api/types';
import { mockUsers as initialUsers } from './data/users';

/**
 * MSW request handlers — simulate a real REST API for /api/users.
 * Adapt these handlers to match your own backend API when connecting a real server.
 */

// In-memory store — resets on page reload (MSW runs in the browser)
let users: User[] = [...initialUsers];

export const handlers = [
  // GET /api/users
  http.get('/api/users', () => {
    const response: GetUsersResponse = { data: users, total: users.length };
    return HttpResponse.json(response);
  }),

  // GET /api/users/profile
  http.get('/api/users/profile', () => {
    const user = users[0];
    return HttpResponse.json({ data: user });
  }),

  // GET /api/users/:id
  http.get('/api/users/:id', ({ params }) => {
    const user = users.find((u) => u.id === params.id);
    if (!user) return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    return HttpResponse.json({ data: user });
  }),

  // POST /api/users
  http.post('/api/users', async ({ request }) => {
    const body = await request.json() as CreateUserRequest;
    const newUser: User = {
      id: String(users.length + 1),
      ...body,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    return HttpResponse.json({ data: newUser }, { status: 201 });
  }),

  // PUT /api/users/:id
  http.put('/api/users/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<User>;
    const index = users.findIndex((u) => u.id === params.id);
    if (index === -1) return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    users[index] = { ...users[index], ...body };
    return HttpResponse.json({ data: users[index] });
  }),

  // DELETE /api/users/:id
  http.delete('/api/users/:id', ({ params }) => {
    const index = users.findIndex((u) => u.id === params.id);
    if (index === -1) return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    users.splice(index, 1);
    return HttpResponse.json({}, { status: 204 });
  }),
];
