# Slice 3 — Data Fetching Pattern

## Goal

Implement React Query for server state management and MSW (Mock Service Worker) for API mocking, demonstrating complete CRUD patterns.

## Related Epics

[Epic 0 — AppShell MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

[US-004 — Data Fetching Pattern](../../what/epics/epic-0-mvp/user-stories/us-004-data-fetching.md)

## Impacted Components

- `src/lib/queryClient.ts` — React Query configuration with QueryClient
- `src/api/client.ts` — centralized fetch/axios HTTP wrapper
- `src/api/endpoints.ts` — API URL definitions and request/response shapes
- `src/api/types.ts` — TypeScript DTOs for User and API responses
- `src/api/mocks.ts` — MSW handlers for GET/POST/PUT/DELETE
- `src/hooks/useUsers.ts` — custom hook for fetching users list
- `src/hooks/useUser.ts` — custom hook for fetching single user
- `src/hooks/useProfile.ts` — custom hook for authenticated profile
- `src/hooks/useCreateUser.ts` — mutation hook for creating user
- `src/hooks/useUpdateUser.ts` — mutation hook for updating user
- `src/hooks/useDeleteUser.ts` — mutation hook for deleting user
- `src/pages/UsersPage.tsx` — page displaying users with CRUD operations
- `src/index.tsx` — wrap app with QueryClientProvider

## Interfaces

**API Types**:
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface GetUsersResponse {
  data: User[];
  total: number;
}

interface CreateUserRequest {
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface CreateUserResponse {
  data: User;
}
```

**Query Hooks**:
```typescript
useUsers(): UseQueryResult<User[]>
useUser(id: string): UseQueryResult<User>
useProfile(): UseQueryResult<User>
```

**Mutation Hooks**:
```typescript
useCreateUser(): UseMutationResult<User, Error, CreateUserRequest>
useUpdateUser(): UseMutationResult<User, Error, { id: string; data: Partial<User> }>
useDeleteUser(): UseMutationResult<void, Error, string>
```

## Data Changes

**Mock Data** (in MSW handlers):
- Pre-seeded 3-5 example users with realistic names, emails, roles
- Users persisted in MSW server state during session
- CRUD operations modify in-memory user list

## Sequence Flow

1. Create `src/lib/queryClient.ts` with QueryClient configuration
2. Create `src/api/types.ts` with User and Response DTOs
3. Create `src/api/endpoints.ts` with API URL constants
4. Create `src/api/client.ts` with fetch/axios wrapper
5. Create `src/api/mocks.ts` with MSW handlers (GET, POST, PUT, DELETE)
6. Create custom hooks: `useUsers`, `useUser`, `useProfile`
7. Create mutation hooks: `useCreateUser`, `useUpdateUser`, `useDeleteUser`
8. Create `src/pages/UsersPage.tsx` to display users with loading/error states
9. Wrap app with `QueryClientProvider` in `src/index.tsx`
10. Test MSW interception in browser Network tab

## Observability Impact

- MSW handlers visible in browser Network tab (intercepted requests)
- React Query DevTools panel shows queries and mutations (if installed)
- Loading spinners appear while fetching
- Error messages display gracefully if API call fails
- Cache invalidation works after mutations (lists refresh automatically)

## Acceptance Criteria

- [x] QueryClient created and configured with sensible defaults
- [x] MSW handlers configured for `/api/users` GET, POST, PUT, DELETE
- [x] `useUsers()` hook fetches list with loading/error states
- [x] `useUser(id)` hook fetches single user
- [x] `useProfile()` hook demonstrates authenticated query (requires token)
- [x] Mutation hooks exist: `useCreateUser()`, `useUpdateUser()`, `useDeleteUser()`
- [x] UsersPage displays list with create/edit/delete buttons
- [x] Loading spinner shown while fetching
- [x] Error messages displayed on API failure
- [x] Cache invalidation works (list refreshes after mutation)
- [x] Mock data includes realistic users (5-10 examples)
- [x] No real API calls made (all intercepted by MSW)
