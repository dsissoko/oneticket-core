# Slice 2 — Routing Setup

## Goal

Implement React Router v6 with core routes (home, about, help) and error boundaries for graceful error handling.

## Related Epics

[Epic 0 — AppShell MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

[US-003 — Routing Setup](../../what/epics/epic-0-mvp/user-stories/us-003-routing.md)

## Impacted Components

- `src/App.tsx` — React Router configuration and route definitions
- `src/pages/HomePage.tsx` — landing page at `/`
- `src/pages/AboutPage.tsx` — about page at `/about`
- `src/pages/HelpPage.tsx` — help page at `/help`
- `src/pages/NotFoundPage.tsx` — 404 page for invalid routes
- `src/components/ErrorBoundary.tsx` — catches and displays render errors

## Interfaces

**Route Configuration**:
```typescript
interface RouteConfig {
  path: string;
  element: React.ReactNode;
  lazy?: () => Promise<{ default: React.ComponentType }>;
  errorElement?: React.ReactNode;
}
```

**ErrorBoundary Props**:
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

## Data Changes

None (routing only).

## Sequence Flow

1. Create `src/App.tsx` with `<BrowserRouter>` and `<Routes>`
2. Create page components: `HomePage`, `AboutPage`, `HelpPage`, `NotFoundPage`
3. Implement lazy loading with `React.lazy()` and `<Suspense>`
4. Create `ErrorBoundary` component to catch render errors
5. Configure route structure: exact paths for main routes, wildcard for 404
6. Add loading skeleton/spinner for lazy-loaded routes
7. Test navigation between routes and 404 handling

## Observability Impact

- Browser URL updates when navigating between routes
- Page components render and update in React DevTools
- No console errors when clicking navigation links
- 404 page displays gracefully for invalid routes

## Acceptance Criteria

- [x] React Router v6 configured with `<BrowserRouter>` and `<Routes>`
- [x] Route `/` renders `HomePage`
- [x] Route `/about` renders `AboutPage` with team/vision info
- [x] Route `/help` renders `HelpPage` with FAQ/documentation
- [x] Invalid routes display `NotFoundPage` (404)
- [x] ErrorBoundary wraps routes and catches render errors
- [x] Lazy loading implemented with `React.lazy()` and `Suspense`
- [x] Loading indicator displayed while lazy route loads
- [x] Navigation links in Header are working and tested
- [x] No console errors during route transitions
