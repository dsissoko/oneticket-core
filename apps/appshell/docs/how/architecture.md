# Architecture — AppShell

## 1. Architecture Principles

1. **Zero-Setup Reusability** — AppShell is a complete, copy-paste skeleton that any new project can adopt and customize in minutes without boilerplate setup.

2. **Merge-Error Elimination through File Ownership** — Each feature screen, hook, and store file is exclusively owned by a single task. No two parallel tasks may modify the same file, ensuring conflict-free parallel development.

3. **Design Quality by Constraint** — Tailwind design tokens, shadcn/ui component library, and CSS custom properties enforce visual consistency without manual oversight. Projects use only approved primitives.

4. **Separation of Concerns** — Clean boundaries between UI screens, data-fetching hooks, mock handlers, routing, and theme management. Each concerns lives in its own module with a single responsibility.

5. **Development-First Architecture** — MSW enables full development without a backend. Real API integration is transparent: switch from mock to live endpoints without code changes.

6. **TypeScript Strict Mode** — All code compiles with `strict: true`. No `any` types without justification. Strong typing catches errors at build time.

7. **Reactive Theme System** — Theme switching via CSS custom properties and `next-themes` integration. Changes apply instantly without page reload; user preference persists across sessions.

## 2. System Overview

AppShell is a **single-page application (SPA)** built with React 18 and Vite. It provides:

- **Templated Screens** — Three built-in routes (`/`, `/about`, `/help`) rendering screen components
- **Data-Fetching Pipeline** — React Query for server state + MSW for development mocking
- **Themeable UI** — Light/dark mode toggled via CSS custom properties and persisted via `next-themes`
- **Component Library** — shadcn/ui Radix components (button, card, dropdown-menu, form, etc.) pre-installed
- **Routing & Navigation** — React Router v6 managing all client-side navigation
- **Type Safety** — TypeScript strict mode enforced across all code

The app runs entirely in the browser. In development, MSW intercepts HTTP calls and returns mock data. In production, requests reach real API endpoints. No code changes required for this transition.

## 3. Architectural Style

**Layered Single-Page Application (SPA) with Mock-Based Development**.

```
┌──────────────────────────────────────────────────────┐
│                 User Interface (React)               │
│  ┌─────────────────────────────────────────────────┐ │
│  │ AppLayout (Header + Outlet + Footer)            │ │
│  │ ┌──────────────┐ ┌──────────────┐              │ │
│  │ │ HomeScreen   │ │ AboutScreen  │ ...          │ │
│  │ └──────────────┘ └──────────────┘              │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
            ↓
┌──────────────────────────────────────────────────────┐
│     Data & State Management (React Query)            │
│  useQuery() hooks fetch from `/api/*` endpoints      │
└──────────────────────────────────────────────────────┘
            ↓
┌──────────────────────────────────────────────────────┐
│    Network Layer (MSW in Dev, Real API in Prod)      │
│  ┌─────────────────────────────────┐                │
│  │ Development:                    │                │
│  │  - MSW intercepts requests      │                │
│  │  - Returns mock data from       │                │
│  │    mocks/data/ directory        │                │
│  └─────────────────────────────────┘                │
│  ┌─────────────────────────────────┐                │
│  │ Production:                     │                │
│  │  - Requests reach real server   │                │
│  │  - (import.meta.env.DEV guard)  │                │
│  └─────────────────────────────────┘                │
└──────────────────────────────────────────────────────┘
```

## 4. Main Technical Boundaries

### Boundary 1: UI Layer (`src/screens/`, `src/components/ui/`)
**Scope:** React components rendering the user interface.

**Responsibilities:**
- Render screen pages (HomeScreen, AboutScreen, HelpScreen)
- Use shadcn/ui primitives (Button, Card, DropdownMenu, Form)
- Receive data via custom hooks and render conditionally on loading/error/success states
- Emit user interactions (clicks, form submissions)
- Apply Tailwind classes for styling

**Exclusive File Ownership:** Each feature gets its own screen file (e.g., `screens/UserManagementScreen.tsx`). No two tasks modify the same screen file.

### Boundary 2: Data-Fetching Layer (`src/hooks/`)
**Scope:** Custom React hooks encapsulating data retrieval and business logic.

**Responsibilities:**
- Define `useQuery()` calls to fetch remote data
- Return `{ data, isLoading, error, refetch }` objects
- Validate API responses with Zod schemas
- Handle retry logic and error states
- Memoize return values to prevent unnecessary re-renders

**Exclusive File Ownership:** One hook per feature (e.g., `useUsers.ts`, `usePosts.ts`). Data-fetching logic for feature X is never split across multiple hook files.

### Boundary 3: Mock & Network Layer (`src/mocks/`)
**Scope:** MSW request handlers and mock data.

**Responsibilities:**
- Define MSW request handlers in `handlers.ts` (GET /api/users, POST /api/users, etc.)
- Store mock data in `mocks/data/` (JSON or TypeScript objects)
- Ensure handlers return realistic responses matching API schema
- Active only in development (`import.meta.env.DEV` guard in `main.tsx`)

**Shared File:** `handlers.ts` is shared across all tasks. Each feature task adds its handlers to this file; no new handler files are created.

### Boundary 4: Routing & Navigation (`src/App.tsx`)
**Scope:** React Router configuration and route definitions.

**Responsibilities:**
- Define all routes (path → screen component mapping)
- Manage nested layouts via `<Outlet />`
- Coordinate route transitions
- Centralize navigation logic

**Shared File:** `App.tsx` is centralized and modified only by the integration task (after all feature screens are complete).

### Boundary 5: Theme & Styling (`src/styles/globals.css`, `tailwind.config.ts`)
**Scope:** CSS custom properties, Tailwind tokens, global styles.

**Responsibilities:**
- Define light and dark mode color values via CSS custom properties
- Configure Tailwind design tokens (colors, spacing, typography)
- Set global fonts, resets, and layout utilities

**Exclusive to Design Tasks:** Theme files are modified only by dedicated theme/design tasks, never by feature development tasks.

### Boundary 6: Application Configuration
**Scope:** Environment, Vite config, TypeScript config.

**Responsibilities:**
- Define build and runtime settings
- Set environment variables (VITE_APP_NAME, VITE_API_BASE_URL, etc.)
- Configure strict TypeScript rules

**Frozen:** These files are established in task 0 and never modified by feature tasks.

## 5. Key Components

### 5.1 AppLayout (`src/components/AppLayout.tsx`)
**Purpose:** Wraps all screen routes with consistent header, main area, and footer.

**Responsibilities:**
- Render header with app name (clickable → `/`) and "About & Help" dropdown
- Render `<Outlet />` where screen components display
- Render footer (empty but structured)
- Pass theme state to children

**Key Props:** None; reads theme from `next-themes` provider.

### 5.2 Header (`src/components/Header.tsx`)
**Purpose:** Navigation and theme toggle.

**Responsibilities:**
- Display app name on left (VITE_APP_NAME, clickable → `/`)
- Display "About & Help" dropdown on right with links to `/about` and `/help`
- Render `<ThemeToggle />` on right side
- Responsive design (mobile-friendly)

### 5.3 ThemeToggle (`src/components/ThemeToggle.tsx`)
**Purpose:** Switch between light, dark, and system theme modes.

**Responsibilities:**
- Use `next-themes` hook to read/set theme
- Render three buttons or dropdown: system, light, dark
- Persist user choice to localStorage
- Trigger reactive CSS custom property updates

### 5.4 Screens (HomeScreen, AboutScreen, HelpScreen)
**Purpose:** Render page-level content for each route.

**HomeScreen (`src/screens/HomeScreen.tsx`):**
- Demonstrates React Query + MSW integration
- Calls `useUsers()` hook to fetch `/api/users`
- Renders loading spinner, error message, or list of user cards
- Shows how to handle async data in UI

**AboutScreen (`src/screens/AboutScreen.tsx`):**
- Explains AppShell purpose and vision
- Links to documentation
- Links to GitHub repo

**HelpScreen (`src/screens/HelpScreen.tsx`):**
- Provides 7-step quickstart for reusing AppShell
- References runbook and documentation links

### 5.5 QueryClient Singleton (`src/lib/query-client.ts`)
**Purpose:** Centralized React Query configuration.

**Responsibilities:**
- Create and export a single `QueryClient` instance
- Set default query options (stale time, retry behavior)
- Provide the client to the app via `<QueryClientProvider>`

**Key Config:**
```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,        // 10 minutes
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
})
```

### 5.6 MSW Setup (`src/mocks/browser.ts` + `src/main.tsx`)
**Purpose:** Initialize Mock Service Worker for development.

**Responsibilities:**
- Create `setupWorker()` in `browser.ts` to register service worker
- Start MSW in `main.tsx` with `import.meta.env.DEV` guard
- Load handlers from `mocks/handlers.ts`
- Ensure dev-only activation (no impact in production)

## 6. Key Interfaces

### 6.1 Data-Fetching Interface (Hook → Query → MSW/API)

**Flow:**
```
Component
    ↓
useUsers() hook (custom)
    ↓
useQuery({ queryKey: ['users'], queryFn: () => fetch('/api/users') })
    ↓
Network Layer (MSW in dev, real endpoint in prod)
    ↓
Mock Handler (dev) / Real Server (prod)
    ↓
Response JSON
    ↓
Zod validation (lib/schemas/users.ts)
    ↓
Typed data returned to component
```

**Example Hook:**
```typescript
// src/hooks/useUsers.ts
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      const data = await res.json();
      return usersSchema.parse(data);
    },
  });
}
```

**Example MSW Handler:**
```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { mockUsers } from './data/users';

export const handlers = [
  http.get('/api/users', () => HttpResponse.json(mockUsers)),
];
```

### 6.2 Routing Interface (App.tsx → Route → Screen → Layout)

**Flow:**
```
React Router
    ↓
App.tsx: <Routes>
    ├─ <Route path="/" element={<HomeScreen />} />
    ├─ <Route path="/about" element={<AboutScreen />} />
    └─ <Route path="/help" element={<HelpScreen />} />
    ↓
Each Route renders inside AppLayout
    ↓
Screen component receives props, renders content
```

### 6.3 Theme Interface (ThemeToggle → next-themes → CSS Custom Properties)

**Flow:**
```
User clicks ThemeToggle
    ↓
next-themes updates localStorage and HTML class
    ↓
CSS custom properties updated:
  - Light: --color-primary: #000, --color-bg: #fff, ...
  - Dark: --color-primary: #fff, --color-bg: #000, ...
    ↓
Tailwind classes reactively apply new colors
    ↓
UI updates without page reload
```

**CSS Custom Properties (globals.css):**
```css
:root {
  --color-primary: #000;
  --color-bg: #fff;
  /* ... */
}

.dark {
  --color-primary: #fff;
  --color-bg: #000;
  /* ... */
}
```

## 7. Data Architecture

### 7.1 Server State (React Query)

**Managed by React Query:**
- Remote API data (users, posts, etc.)
- Loading, error, and success states
- Cache management and staleness
- Automatic refetching on window focus

**Stored in Query Cache:**
No explicit state container. React Query maintains all server state internally via `useQuery()` hooks.

### 7.2 Client State (Optional: Zustand)

**Available but Unused in Skeleton:**
For features requiring client-side state (e.g., UI filters, form drafts), projects add stores under `src/stores/`:
```typescript
// src/stores/filterStore.ts
import { create } from 'zustand';

export const useFilterStore = create((set) => ({
  filters: {},
  setFilters: (filters) => set({ filters }),
}));
```

### 7.3 Persistent State (localStorage)

**Theme Preference:**
- Managed by `next-themes`
- Key: `theme` (value: `"light"`, `"dark"`, or `"system"`)
- Persists across browser sessions

**Projects may add:**
- User preferences (e.g., sidebar collapsed state)
- Form drafts
- Cache keys

### 7.4 Validation & Schemas (Zod)

**Location:** `src/lib/schemas/`

**Purpose:** Ensure API responses match expected shape before passing to components.

**Example:**
```typescript
// src/lib/schemas/users.ts
import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export const usersSchema = z.array(userSchema);
```

## 8. Security Architecture

### 8.1 Type Safety
- **Strict TypeScript:** All code compiles with `strict: true`. No unsafe `any` types.
- **Zod Validation:** API responses validated before use in components.

### 8.2 Environment Isolation
- **Development:** MSW intercepts requests (no real API calls).
- **Production:** Real API endpoints only (`import.meta.env.DEV` guard ensures MSW is dev-only).
- **Sensitive Data:** Never store secrets in client code. Use environment variables and server-side proxies.

### 8.3 XSS Prevention
- **React Escaping:** React automatically escapes user input in JSX.
- **DomPurify (optional):** Install if rendering user-generated HTML.

### 8.4 CORS Handling
- **Development:** MSW bypasses CORS entirely.
- **Production:** Real API must set appropriate CORS headers or use same-origin endpoints.

### 8.5 Error Boundaries (Future Enhancement)
- Consider adding error boundaries at root and screen levels for graceful degradation.
- Log errors to monitoring service (Sentry, LogRocket, etc.).

## 9. Deployment Strategy

### 9.1 Build Output
- **Target:** `dist/` directory (git-ignored)
- **Build Command:** `npm run build` → Vite bundles all assets
- **Artifacts:** HTML entry point, JavaScript bundles, CSS, static assets

### 9.2 Hosting
- **Static Hosting:** AppShell deploys to any static host (GitHub Pages, Vercel, Netlify, etc.)
- **No Server Required:** Pure client-side SPA; no Node.js runtime needed

### 9.3 Environment Configuration
- **Development:** `.env` or `.env.local` (git-ignored)
- **Production:** Environment variables set by hosting provider
- **Required Variables:** `VITE_APP_NAME`, `VITE_API_BASE_URL` (in dev, ignored due to MSW)

### 9.4 CI/CD Pipeline
- **Build:** `npm run build` must complete without errors
- **Test:** `npm run test` must pass
- **Deploy:** Host provider (e.g., GitHub Pages) automatically deploys `dist/` on push

## 10. Observability Strategy

### 10.1 Development Observability
- **Console Logging:** Use `console.log()`, `console.error()` for debugging
- **React DevTools:** Inspect component tree, props, hooks
- **Vite HMR:** Instant feedback on code changes
- **MSW Network Tab:** Chrome DevTools Network tab shows MSW-intercepted requests

### 10.2 Production Observability (Future Enhancement)
- **Error Tracking:** Integrate Sentry, LogRocket, or similar for runtime errors
- **Performance Monitoring:** Track Core Web Vitals, page load time
- **Analytics:** Track user behavior, feature usage (e.g., Google Analytics, Mixpanel)
- **Logging:** Structured logging to backend service (e.g., DataDog, ELK stack)

### 10.3 Build & Runtime Metrics
- **Build Time:** Monitor Vite build duration
- **Bundle Size:** Track JavaScript bundle size (vite-plugin-visualizer)
- **Component Render:** Use React Profiler for performance bottlenecks

## 11. Related C4 Views

- [System Context](../c4/system-context.md)
- [Containers](../c4/containers.md)
- [Components](../c4/components.md) (if needed for complex features)

## 12. Related Implementation Slices

See [how/slices/](../slices/) for all implementation slices derived from this architecture.

## 13. Technical Constraints

1. **React 18 Minimum** — Requires React 18+ for Suspense and concurrent features.
2. **TypeScript Strict Mode** — All code must compile with `strict: true`.
3. **Tailwind Classes Only** — No inline `style` attributes; all styling via Tailwind and CSS custom properties.
4. **File Ownership Exclusivity** — No two parallel tasks may modify the same screen, hook, or store file.
5. **MSW Dev-Only** — MSW must be guarded by `import.meta.env.DEV` to ensure it doesn't run in production.
6. **Route Centralization** — All routes defined in `App.tsx`; screens do not define their own routes.
7. **QueryClient Singleton** — Only one `QueryClient` instance; created in `lib/query-client.ts` and reused.
8. **shadcn/ui Components Only** — Use only pre-installed shadcn components. Adding new components requires a dedicated task.
9. **No Custom CSS** — Beyond `globals.css`, all styling is Tailwind. Projects extend tokens in `tailwind.config.ts` as needed.
10. **No Uncommitted Config** — `.env.example` and all config files are committed. Projects do not require manual setup beyond environment variable changes.

## 14. Open Questions

1. **Default Theme on First Load** — Should the app detect the user's OS preference on first load, or default to light mode? Currently uses `next-themes` default behavior (system preference).

2. **Error Boundary Scope** — Should the error boundary cover the entire app or just individual screens? Currently not implemented; consider adding in future task.

3. **Mock Data Volume** — Should mock endpoints return minimal datasets (1-3 items) or realistic large datasets (100+) to test pagination and virtualization?

4. **Offline Support** — Should the app include offline-first patterns (Service Worker caching)? Currently assumes online connectivity.

5. **State Persistence** — Beyond theme, should other state (filters, form drafts) be persisted to localStorage? Projects decide per feature.

6. **Icon Library** — `lucide-react` is included in dependencies. Should alternative icon libraries be available or documented?

7. **Form Validation UX** — Should validation errors display inline, below fields, or in a summary toast? Currently left to project implementation.

8. **Authentication Scaffold** — Should AppShell include a login skeleton (non-functional) or start completely public?

9. **Internationalization (i18n)** — Should AppShell include i18n setup (even if not used)? Currently deferred to projects.

10. **API Base URL Strategy** — Should `VITE_API_BASE_URL` be configurable per environment, or should the app assume a fixed backend location?
