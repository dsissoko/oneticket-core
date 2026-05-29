import { http, HttpResponse } from 'msw';
import { mockUsers } from './data/users';
export const handlers = [
    http.get('/api/users', () => {
        return HttpResponse.json(mockUsers);
    }),
];
