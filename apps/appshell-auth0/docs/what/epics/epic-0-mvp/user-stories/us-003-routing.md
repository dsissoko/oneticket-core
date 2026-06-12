# US-003 — Routing Setup

## Story

As a developer, I want pre-configured routes so that I can see how React Router v6 is set up with lazy loading and error handling.

## Expected Behavior

- React Router v6 configured with `BrowserRouter` and `basename={import.meta.env.BASE_URL}`
- Four routes: `/` (HomeScreen), `/about` (AboutScreen), `/help` (HelpScreen), `*` (NotFoundScreen)
- All screens are lazy-loaded with `React.lazy()` and `Suspense`
- `ErrorBoundary` wraps all routes — render errors display graceful fallback with logger
- 404 screen offers navigation back to Home

## Acceptance Criteria

- [x] Route `/` renders `HomeScreen`
- [x] Route `/about` renders `AboutScreen` with Back Home button
- [x] Route `/help` renders `HelpScreen` with FAQ, Quick Links, Back Home button
- [x] Route `*` renders `NotFoundScreen` with Go Home button
- [x] All routes lazy-loaded — separate JS chunks in `dist/`
- [x] `basename` set correctly — links work on GitHub Pages sub-path
- [x] `ErrorBoundary` catches render errors and logs via `logger.error`
- [x] `NotFoundScreen` "Try 404" button in HomeScreen links to `/nonexistent`
