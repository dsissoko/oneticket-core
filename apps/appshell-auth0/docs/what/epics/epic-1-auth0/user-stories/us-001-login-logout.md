# US-001 — Auth0 Login/Logout

## Story

As a user, I want to log in and log out with Auth0 so that my identity is verified and my session is secure.

## Expected Behavior

- `Auth0Provider` wraps the entire app in `main.tsx`
- Login redirects to Auth0 Universal Login page
- After successful login, user is redirected back to the app
- Logout clears the session and redirects to home
- Auth state available throughout the app

## Acceptance Criteria

- [ ] `@auth0/auth0-react` installed and configured
- [ ] `Auth0Provider` present in `main.tsx` with `domain` and `clientId` from env vars
- [ ] Login button triggers Auth0 redirect
- [ ] Logout clears session and returns to `/`
- [ ] `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID` documented in `.env.example`
