# Slice 1 — Skeleton Foundation

## Goal

Establish the complete technical foundation of AppShell, spanning configuration, tooling, layout system, routing, theming, and component infrastructure. This is the walking skeleton slice that enables all subsequent feature slices to build upon a consistent, conflict-free platform.

## Related Epics

- [../../../what/epics/epic-0-mvp/epic.md](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [../../../what/epics/epic-0-mvp/user-stories/us-001-skeleton-setup.md](../../../what/epics/epic-0-mvp/user-stories/us-001-skeleton-setup.md) — Application skeleton with React Router v6, AppLayout, and theme system
- [../../../what/epics/epic-0-mvp/user-stories/us-002-design-tokens.md](../../../what/epics/epic-0-mvp/user-stories/us-002-design-tokens.md) — Design tokens (Tailwind, CSS custom properties) and theme toggle
- [../../../what/epics/epic-0-mvp/user-stories/us-003-exclusive-ownership.md](../../../what/epics/epic-0-mvp/user-stories/us-003-exclusive-ownership.md) — File structure and exclusive ownership conventions

## Impacted Components

**Project Configuration:**
- `.env.example` — Environment variables with `VITE_APP_NAME`
- `package.json` — Dependencies for React, Vite, Tailwind, TypeScript, Vitest
- `vite.config.ts` — Vite setup with base path dynamic resolution
- `tsconfig.json` — TypeScript configuration
- `tailwind.config.ts` — Design tokens (colors, spacing, typography)
- `postcss.config.js` — PostCSS with Tailwind
- `vitest.config.ts` — Unit/integration test runner configuration

**React Application Layer:**
- `src/main.tsx` — Entry point with React Router, Query Client, Theme Provider, MSW bootstrap
- `src/App.tsx` — Root layout router wrapper
- `src/layouts/AppLayout.tsx` — Main application layout container
- `src/components/Header.tsx` — App name, navigation dropdown, theme toggle
- `src/components/Footer.tsx` — Application footer with metadata
- `src/components/ThemeToggle.tsx` — Theme selector component (system/light/dark)

**Styling & Design Tokens:**
- `src/styles/globals.css` — CSS custom properties for light/dark modes, typography, spacing scales
- `src/lib/utils.ts` — Utility functions (cn() for classname merging, theme helpers)
- `tailwind.config.ts` — Centralized color palette, spacing scale, typography settings

**Data & State Management:**
- `src/lib/query-client.ts` — @tanstack/react-query configuration and cache setup

**Routes & Pages:**
- `/` — Home route (HomeScreen)
- `/about` — About page (AboutScreen)
- `/help` — Help page (HelpScreen)

**UI Component Library:**
- `shadcn/ui` components installed and configured in `src/components/ui/` (Button, Card, Dialog, etc.)

## Interfaces

### Environment Variables
```typescript
VITE_APP_NAME: string    // Application display name
VITE_BASE_PATH: string   // Optional base path for routing (default: '/')
```

### React Router Structure
```
AppLayout
  ├── Header (appName, theme toggle)
  ├── <Outlet /> (page content)
  └── Footer
```

### Theme Hook API
```typescript
useTheme(): {
  theme: 'system' | 'light' | 'dark'
  setTheme: (theme: 'system' | 'light' | 'dark') => void
  effectiveTheme: 'light' | 'dark'  // resolved system preference
}
```

### Query Client Configuration
```typescript
createQueryClient(): QueryClient
  - staleTime: 1000 * 60 * 5  (5 minutes)
  - gcTime: 1000 * 60 * 10    (10 minutes)
  - retry: 1
```

## Data Changes

**localStorage:**
- `appshell-theme` — Persists user's theme preference ('system' | 'light' | 'dark')

## Sequence Flow

1. User opens browser → `src/main.tsx` runs
2. React app mounts with:
   - QueryClientProvider wraps entire tree
   - ThemeProvider applies theme context
   - MSW starts intercepting API calls (dev only)
   - React Router initializes with AppLayout as root
3. AppLayout renders:
   - Header (with theme toggle)
   - Route outlet (page content)
   - Footer
4. User toggles theme → ThemeToggle calls `setTheme()` → CSS custom properties update → DOM rerenders (no page reload)
5. User navigates between routes (/, /about, /help) → React Router renders matched page in outlet

## Observability Impact

**Logging & Diagnostics:**
- `console.log` on app startup with app name and theme preference
- MSW console logs API interception (dev only)
- React Query DevTools integration (dev only)

**Performance Markers:**
- Paint events measured for initial load and theme switch
- React Query cache hits/misses visible in DevTools

**Error Boundaries:**
- Root error boundary catches crashes and displays fallback UI
- Query errors logged but do not crash app

## Testing Strategy

- Unit tests for utility functions (classname merging, theme resolution)
- Integration tests for theme persistence and toggle behavior
- E2E smoke tests for initial page load and navigation between routes
- MSW interceptors validate query client requests
