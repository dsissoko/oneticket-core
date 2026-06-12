# US-004 — Data Fetching Pattern

## Story

As a developer, I want to see React Query + MSW working together so that I understand the data fetching pattern for derived projects.

## Expected Behavior

- `QueryClient` configured with `QueryCache.onError` and `MutationCache.onError` logging errors via `logger.error`
- MSW intercepts all `/api/users` calls — no real backend needed
- Six hooks available: `useUsers`, `useUser`, `useProfile`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`
- Hooks use `@/api/` imports (never relative `../`)
- Mock data: 5 realistic users (Alice, Bob, Charlie, Diana, Eve) in `mocks/data/users.ts`
- MSW always active via `__ENABLE_MSW__: true` — works in dev, preview, and GitHub Pages

## Acceptance Criteria

- [x] `QueryClient` created in `lib/query-client.ts` with error logging
- [x] MSW worker starts with `onUnhandledRequest: 'bypass'`
- [x] `GET /api/users` returns list of 5 mock users
- [x] `GET /api/users/:id` returns single user or 404
- [x] `GET /api/users/profile` returns first admin user
- [x] `POST /api/users` creates user and invalidates cache
- [x] `PUT /api/users/:id` updates user and invalidates cache
- [x] `DELETE /api/users/:id` removes user and invalidates cache
- [x] MSW active on GitHub Pages preview — no console errors about unhandled requests
