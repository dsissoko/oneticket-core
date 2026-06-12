# Epic 1 — Auth0 Authentication

## Goal

Integrate Auth0 into AppShell so that derived projects have a production-ready authentication pattern available out of the box.

## Status

✅ Delivered — Sprint 1

## Business Value

- **Zero auth setup** for derived projects — copy AppShell and get Auth0 integration ready to configure
- **Industry standard** — Auth0 is a proven, secure identity platform used by thousands of production apps
- **Developer experience** — `useAuth()` hook provides a simple, consistent API for accessing user identity

## Scope

- Auth0 SDK integration (`@auth0/auth0-react`)
- `Auth0Provider` wrapped in `main.tsx`
- `useAuth()` hook exposing login, logout, user profile, token
- `ProtectedRoute` component for securing screens
- MSW optional handler to simulate authenticated user in dev without a real Auth0 account
- Environment variables: `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`

## Out of Scope

- Role-based access control (RBAC) — deferred to a future epic
- Social login providers beyond Auth0 defaults
- Backend token validation

## Related User Stories

- [US-001 — Auth0 Login/Logout](user-stories/us-001-login-logout.md)
- [US-002 — Protected Route](user-stories/us-002-protected-route.md)
- [US-003 — useAuth Hook](user-stories/us-003-useauth-hook.md)

## Related Sprints

- [Sprint 1 — Auth0 Foundation](../../how/sprints/sprint-1-auth0/sprint.md)
