# US-003 — useAuth Hook

## Story

As a developer, I want a `useAuth()` hook so that I can access the current user's profile and token from any component.

## Expected Behavior

- `useAuth()` wraps `useAuth0()` from `@auth0/auth0-react`
- Returns: `{ user, isAuthenticated, isLoading, login, logout, token }`
- Consistent API regardless of underlying Auth0 SDK changes
- MSW handler available to simulate authenticated user in dev without a real Auth0 account

## Acceptance Criteria

- [ ] `useAuth()` hook created in `src/hooks/useAuth.ts`
- [ ] Returns `user` object with profile (name, email, picture)
- [ ] Returns `isAuthenticated` boolean
- [ ] Returns `login()` and `logout()` functions
- [ ] Optional MSW handler simulates authenticated session in dev
