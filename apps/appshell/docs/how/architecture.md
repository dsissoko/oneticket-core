---
title: Architecture — AppShell
---

# Architecture — AppShell

## 1. Architecture Principles

1. **Exclusive File Ownership** — Each feature task owns exactly one file or directory, enabling true parallelization without merge conflicts
2. **Design Token Inheritance** — All styling derives from centralized Tailwind configuration and CSS custom properties; no inline styles
3. **MSW Development Parity** — Mock Service Worker enables seamless API development without server dependencies; production uses real endpoints with zero code changes
4. **React Query Caching** — Server state is managed by @tanstack/react-query; component state is minimal and local
5. **Lazy Layout** — AppLayout is defined once (task-0) and never modified by feature tasks; only screens change
6. **Testable by Default** — All hooks, components, and screens are testable in isolation using Vitest + React Testing Library

## 2. System Overview

AppShell is a reference **frontend skeleton application** for oneticket-core projects. It establishes conventions for:
- Routing and navigation (React Router v6)
- Data fetching and caching (React Query + MSW)
- State management (Zustand for cross-screen concerns)
- Theme management (System/Light/Dark with localStorage persistence)
- Form handling (React Hook Form + Zod validation)
- UI components (shadcn/ui primitives + Tailwind styling)
- Testing (Vitest + @testing-library)

New projects copy `apps/appshell/app/` and adapt it to their domain without modifying the architecture.

## 3. Architectural Style

**Single-Page Application (SPA)** with **layered component architecture**:
- **Presentation Layer** — React components organized by feature (screens) and UI primitives (components/ui)
- **Hooks Layer** — Custom React hooks for data fetching (useQuery-based) and logic
- **API/Mock Layer** — MSW handlers intercept fetch calls in development; production requests target real endpoints
- **State Layer** — Zustand stores for cross-screen state (optional); React Query for server state; React Hook Form for form state

## 4. Main Technical Boundaries

```
┌─────────────────────────────────────────────────┐
│         main.tsx (MSW init + Providers)         │
├─────────────────────────────────────────────────┤
│  App.tsx (BrowserRouter + Routes)               │
├─────────────────────────────────────────────────┤
│  layouts/AppLayout.tsx (Header + Outlet + Footer) │
├─────────────────────────────────────────────────┤
│  screens/* (Feature screens — one per file)    │
│  ├── HomeScreen.tsx                            │
│  ├── AboutScreen.tsx                           │
│  └── ... (exclusive ownership per task)        │
├─────────────────────────────────────────────────┤
│  hooks/* (Data fetching + logic)                │
│  ├── useUsers.ts (React Query)                 │
│  └── ... (exclusive ownership per task)        │
├─────────────────────────────────────────────────┤
│  mocks/handlers.ts (MSW intercepts)            │
│  mocks/data/* (Mock fixtures)                  │
├─────────────────────────────────────────────────┤
│  components/ui/* (shadcn/ui primitives)         │
│  components/Header.tsx, Footer.tsx             │
├─────────────────────────────────────────────────┤
│  styles/globals.css (Design tokens + CSS vars) │
│  tailwind.config.ts (Token configuration)      │
└─────────────────────────────────────────────────┘
```

## 5. Key Components

### Entry Point: `main.tsx`
- Initializes MSW worker (development only)
- Wraps App with `QueryClientProvider` (@tanstack/react-query)
- Wraps App with `ThemeProvider` (next-themes for system/light/dark)
- Wraps App with `BrowserRouter` (React Router v6)

### Routing: `App.tsx`
- Defines all routes using `<Routes>` and `<Route>`
- Wraps with `AppLayout` for layout consistency
- Each screen is a route bound to `src/screens/ScreenName.tsx`

### Layout: `layouts/AppLayout.tsx`
- Header component (navigation, theme toggle)
- Outlet for route-specific content
- Footer component (static content)
- **Exclusive ownership: task-0 only** — never modified by feature tasks

### Screens: `src/screens/*`
- Each screen is a single file: `HomeScreen.tsx`, `UserListScreen.tsx`, etc.
- **Exclusive ownership: one screen per task** — no two tasks modify the same screen file
- Screens call hooks to fetch data and manage state
- Screens use shadcn/ui components and Tailwind for styling

### Hooks: `src/hooks/*`
- Each hook is a dedicated file: `useUsers.ts`, `usePosts.ts`, etc.
- **Exclusive ownership: one hook per task** — no two tasks modify the same hook file
- All hooks use `useQuery` from @tanstack/react-query for server state
- Hook fetches from a URL (intercepted by MSW in dev, real endpoint in prod)

### MSW Mock API: `src/mocks/*`
- `handlers.ts` — defines all MSW handlers using `http.get()`, `http.post()`, etc.
- `data/*` — fixture files containing mock JSON responses
- In development, MSW intercepts all fetch calls and returns mock data
- In production, the same code fetches from real API endpoints (no code changes)

### Design System: `styles/` + `tailwind.config.ts`
- `globals.css` defines CSS custom properties for colors, spacing, typography, and theme-specific values
- `tailwind.config.ts` centralizes token definitions (colors, spacing, font sizes)
- All components consume tokens via Tailwind classes and CSS custom properties
- **Exclusive ownership: task-0 only** — tokens are frozen after initial setup

### UI Components: `src/components/ui/*`
- shadcn/ui components installed once (task-0)
- Baseline set includes: Button, Card, Input, Form, Dialog, Dropdown, Tabs, Badge, etc.
- Feature tasks import components but do not add new shadcn components
- **Exclusive ownership: task-0 only** — component set is frozen after initial setup

## 6. Key Interfaces

### Data Fetching Interface (Hook → MSW/API)
```typescript
// src/hooks/useUsers.ts
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      return res.json();
    },
  });
}
```

### MSW Handler Interface
```typescript
// src/mocks/handlers.ts
export const handlers = [
  http.get('/api/users', async () => {
    return HttpResponse.json(mockUsers);
  }),
];
```

### React Hook Form Interface
```typescript
// In a screen component
const form = useForm({
  resolver: zodResolver(userSchema),
  defaultValues: { name: '', email: '' },
});

const onSubmit = form.handleSubmit((data) => {
  // Process form data
});
```

### Theme Interface
```typescript
// ThemeToggle component or hook
const { theme, setTheme } = useTheme();
setTheme('dark'); // Updates class + localStorage + CSS vars
```

## 7. Data Architecture

### Request Flow (Happy Path)
```
Screen Component
    ↓ (imports + calls)
Custom Hook (useUsers)
    ↓ (calls useQuery)
@tanstack/react-query
    ↓ (manages fetch)
fetch('/api/users')
    ↓ (in dev: MSW intercepts)
MSW Handler
    ↓ (returns mock JSON)
React Query Cache
    ↓ (caches response)
Screen re-renders with data
```

### Caching Strategy
- **React Query** manages all server state with built-in caching, refetching, and invalidation
- Hooks define `queryKey` and `queryFn`; React Query handles the rest
- Components subscribe to query state via `useQuery` hook
- MSW intercepts all requests in development; production requests hit real endpoints

### State Topology
```
Server State (React Query)
  ├── /api/users → useUsers() → HomeScreen
  └── /api/posts → usePosts() → PostsScreen

Cross-Screen State (Zustand - optional)
  ├── User context (logged-in user, permissions)
  └── Global notifications

Local Component State (React.useState)
  ├── Form input values (managed by React Hook Form)
  ├── UI state (modal open/closed, tabs)
  └── Transient animations
```

## 8. Security Architecture

1. **HTTPS-Only** — All API requests use HTTPS in production
2. **CORS Headers** — MSW respects CORS in development; production API handles CORS
3. **Token-Based Auth** — Placeholder for JWT/Bearer token integration (not in skeleton, added per-project)
4. **Form Validation** — Zod schemas validate all input before submission
5. **XSS Prevention** — React auto-escapes by default; no raw HTML in components
6. **Content Security Policy** — Set via HTTP headers in production (not in skeleton)

## 9. Deployment Strategy

### Build Process
```bash
npm run build           # Vite builds to dist/
                        # Removes MSW from production bundle
                        # Minifies and optimizes

npm run preview         # Preview production build locally
npm run deploy          # Deployed to hosting (GitHub Pages, Vercel, etc.)
```

### Environment Variables
- `VITE_APP_NAME` — Application name (for AboutScreen, window title)
- `VITE_BASE_PATH` — Base URL for router (default: `/`)
- `VITE_API_BASE_URL` — Production API base (optional; `fetch('/api/...')` by default)

### MSW in Production
- MSW worker is installed in development only (not in production bundle)
- Production uses real API endpoints
- No code changes required to switch from dev (mock) to prod (real API)

## 10. Observability Strategy

1. **Console Logs** — Development logging via `console.log()` in hooks and components
2. **React Query DevTools** — Optional `@tanstack/react-query-devtools` for cache inspection (dev-only)
3. **Browser Console Errors** — All errors logged to browser console for debugging
4. **Error Boundary** — Global error boundary at App root for graceful error handling (TBD)
5. **Performance Monitoring** — Web Vitals metrics via Vercel Analytics (optional, per-project)

## 11. Related C4 Views

- [System Context](../c4/system-context.md)
- [Containers](../c4/containers.md)
- [Components](../c4/components.md)
- [Deployment](../c4/deployment.md)

## 12. Related Implementation Slices

See [how/slices/](../slices/) for all implementation slices derived from this architecture.

## 13. Technical Constraints

1. **Exclusive File Ownership** — Each feature task owns exactly one file in `src/screens/` or `src/hooks/`. No shared modifications.
2. **No Inline Styles** — All styling via Tailwind classes and CSS custom properties; inline `style={{}}` forbidden.
3. **No Custom HTML in Components** — Use shadcn/ui primitives; custom div/span usage is minimal.
4. **MSW Handler Convention** — All mocks in `src/mocks/handlers.ts`; no hardcoded fixtures in components.
5. **Hook Isolation** — Hooks in `src/hooks/` fetch data; components never call `fetch()` directly.
6. **Frozen Dependencies (Task-0)** — After task-0, no changes to `package.json`, `vite.config.ts`, `tsconfig.json`, or `tailwind.config.ts` without team coordination.
7. **Frozen Components (Task-0)** — shadcn/ui baseline and shared components (Header, Footer, AppLayout) are defined once; feature tasks do not add new components to `src/components/ui/`.
8. **Single Theme System** — Theme is global (system/light/dark); no per-component theme overrides.

## 14. Open Questions

1. **Error Boundary Placement** — Should we add a global error boundary in main.tsx or wrap each screen separately?
2. **Authentication Integration** — How should real auth (OAuth, JWT) be integrated without breaking the mock API flow?
3. **API Base URL Strategy** — Should projects use `VITE_API_BASE_URL` env var or hardcode `/api/` endpoint paths?
4. **Shared Hooks Across Projects** — Should common hooks (useUser, useAuth) be extracted to a shared package under `packages/`?
5. **Component Library Customization** — Can projects extend shadcn/ui with project-specific components, or is the baseline frozen?
6. **MSW Logging in Prod** — Should MSW handlers log to console in production for demo purposes, or be completely silent?
