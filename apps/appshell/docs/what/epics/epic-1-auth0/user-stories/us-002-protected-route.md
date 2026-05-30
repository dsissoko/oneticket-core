# US-002 — Protected Route

## Story

As a developer, I want a `ProtectedRoute` component so that I can restrict access to authenticated users only.

## Expected Behavior

- `ProtectedRoute` wraps any screen that requires authentication
- Unauthenticated users are redirected to login
- Authenticated users can access the protected screen
- Loading state shown while Auth0 checks session

## Acceptance Criteria

- [ ] `ProtectedRoute` component created in `src/components/`
- [ ] Unauthenticated access to a protected route redirects to login
- [ ] Loading indicator shown during Auth0 session check
- [ ] Protected route renders correctly after successful login
