# AppShell Architecture — Vite + React + TypeScript

## 1. Architecture Principles

AppShell is built on a foundation of **exclusive file ownership**, **design token centralization**, and **zero-merge-conflict parallel development**. These principles enable multiple agents to work independently without conflicts:

1. **Exclusive File Ownership** — Each file is owned by at most one task. Shared infrastructure (layout, tokens, config) is set up once in Task 0. Feature files (screens, hooks, handlers) are owned by individual feature tasks.

2. **Design Quality by Constraint** — Design tokens (colors, spacing, typography) are centralized in CSS variables and Tailwind config. All components consume these tokens; visual inconsistency becomes impossible.

3. **Minimal, Reusable Skeleton** — AppShell is a copy-paste template for new projects. The structure is intentionally simple and unopinionated about business logic, allowing rapid reuse and adaptation.

4. **Development Velocity** — Agents can add features (screens, hooks, data handlers) without touching shared files. The skeleton is structured so that parallel tasks can proceed independently.

5. **Production Safety** — Development-only tooling (MSW, React Query DevTools) is tree-shaken from production builds. Zero runtime overhead in production.

---

## 2. System Overview

AppShell is a **single-page application** built with modern frontend technologies. It establishes the reference architecture for all React/Vite projects in oneticket-core.

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (User)                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Vite SPA (React 18)                  │ │
│  │  ┌───────────────────────────────────────────────────┐  │ │
│  │  │  Header (App Name, About&Help, ThemeToggle)     │  │ │
│  │  ├───────────────────────────────────────────────────┤  │ │
│  │  │  <Outlet /> (HomeScreen, AboutScreen, HelpScreen) │  │ │
│  │  ├───────────────────────────────────────────────────┤  │ │
│  │  │  Footer (empty, structured)                        │  │ │
│  │  └───────────────────────────────────────────────────┘  │ │
│  │                                                            │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  CSS Variables (--background, --foreground, etc.)  │ │ │
│  │  │  Tailwind Config (colors, spacing, typography)    │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  React Router 6 (Routes: /, /about, /help)         │ │ │
│  │  │  React Query (@tanstack/react-query)               │ │ │
│  │  │  MSW (dev-only, mocks fetch)                       │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  shadcn/ui Components (Button, Card, Form, etc.)   │ │ │
│  │  │  lucide-react Icons                                │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ↓ (dev-only: intercepts fetch)
┌─────────────────────────────────────────────────────────────┐
│  MSW Worker (Browser — dev only, tree-shaken in prod)      │
│  Handlers: GET /api/users → mock data                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Architectural Style

**Hexagonal Frontend Architecture** with clear separation of concerns:

- **Presentation Layer** — React components (screens, layout, UI primitives)
- **Hook Layer** — Custom hooks encapsulating business logic and data fetching
- **Data Layer** — React Query for caching and synchronization
- **Mock Layer** — MSW for development-only API mocking
- **Styling Layer** — Tailwind CSS + CSS custom properties for design tokens

The architecture strictly separates **what screens show** (presentation) from **how data is fetched** (hooks) from **what data looks like** (mock handlers and types).

---

## 4. Main Technical Boundaries

### 4.1 File Ownership Structure

```
apps/appshell/app/
├── src/
│   ├── App.tsx                  ← Task 0 (routes definition, shared infrastructure)
│   ├── main.tsx                 ← Task 0 (MSW init, providers, app bootstrap)
│   │
│   ├── layouts/
│   │   └── AppLayout.tsx        ← Task 0 (shared across all screens)
│   │
│   ├── components/
│   │   ├── Header.tsx           ← Task 0 (shared navigation)
│   │   ├── Footer.tsx           ← Task 0 (shared footer)
│   │   ├── ThemeToggle.tsx      ← Task 0 (shared theme control)
│   │   └── ui/                  ← Task 0 (shadcn components, installed once)
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx       ← Feature Task (owns this screen exclusively)
│   │   ├── AboutScreen.tsx      ← Feature Task (owns this screen exclusively)
│   │   └── HelpScreen.tsx       ← Feature Task (owns this screen exclusively)
│   │
│   ├── hooks/
│   │   └── useUsers.ts          ← Feature Task (owns this hook exclusively)
│   │
│   ├── stores/
│   │   └── .gitkeep             ← Convention: Zustand (optional, unused in skeleton)
│   │
│   ├── mocks/
│   │   ├── browser.ts           ← Task 0 (MSW worker setup)
│   │   ├── handlers.ts          ← Extended by Feature Tasks (each endpoint owner)
│   │   └── data/
│   │       └── users.ts         ← Feature Task (owns mock data)
│   │
│   ├── lib/
│   │   ├── utils.ts             ← Task 0 (cn() helper — shared utility)
│   │   ├── query-client.ts      ← Task 0 (QueryClient singleton)
│   │   └── schemas/
│   │       └── .gitkeep         ← Convention: Zod schemas (optional)
│   │
│   └── styles/
│       └── globals.css          ← Task 0 (CSS variables, design tokens)
│
├── tailwind.config.ts           ← Task 0 (Tailwind config, consumes CSS variables)
├── postcss.config.js            ← Task 0
├── vite.config.ts               ← Task 0
├── vitest.config.ts             ← Task 0
├── tsconfig.json                ← Task 0
├── .env.example                 ← Task 0 (VITE_APP_NAME)
└── index.html                   ← Task 0
```

**Key Rule:** No file exists in two ownership categories simultaneously. Once a file is created in Task 0, it is never touched by parallel feature tasks.

### 4.2 Ownership Categories

| Category | Owner | Scope | Examples |
|---|---|---|---|
| **Infrastructure** | Task 0 (setup) | Config, layout, theme, shared utilities | App.tsx, AppLayout.tsx, Header.tsx, globals.css, tailwind.config.ts |
| **Screens** | One Feature Task per screen | User-facing views | HomeScreen.tsx, AboutScreen.tsx, CustomFeatureScreen.tsx |
| **Hooks** | One Feature Task per hook | Business logic, data fetching | useUsers.ts, useTodos.ts |
| **Mock Handlers** | Feature Task (extensible) | MSW endpoint definitions | handlers.ts (GET /api/users, GET /api/todos, etc.) |
| **Mock Data** | Feature Task | Mock database content | mocks/data/users.ts, mocks/data/todos.ts |

---

## 5. Key Components

### 5.1 Layout & Navigation

**AppLayout.tsx** — Master wrapper for all screens
- Renders `<Header />` (top)
- Renders `<Outlet />` from React Router (main content)
- Renders `<Footer />` (bottom)
- Applies responsive Tailwind classes
- Owned by Task 0 (never modified by feature tasks)

**Header.tsx** — Top navigation bar
- Left: App name (`VITE_APP_NAME` from `.env`) — clickable → `/`
- Right: "About & Help" dropdown menu with links to `/about` and `/help`
- Far right: `ThemeToggle` component
- Uses shadcn/ui Button and DropdownMenu
- Owned by Task 0

**Footer.tsx** — Bottom section
- Structured but empty in skeleton
- Ready for apps to add copyright, links, etc.
- Owned by Task 0

**ThemeToggle.tsx** — Theme selection control
- Three options: system (OS preference), light, dark
- Reactive: switches immediately without page reload
- Persistent: saves preference to localStorage
- Uses CSS class on `<html>` element + CSS custom properties
- Owned by Task 0

### 5.2 Screens (Feature Views)

**HomeScreen.tsx** — Example screen demonstrating data fetching
- Imports `useUsers()` hook
- Displays loading state while fetching
- Renders list of users in shadcn/ui Card components
- Shows error state if fetch fails
- Owned by a feature task (can be modified by that task only)

**AboutScreen.tsx** — Description of AppShell
- Explains AppShell's purpose: "reference skeleton for React/Vite projects"
- Links to generated documentation: `https://dsissoko.github.io/oneticket-core/appshell/docs/`
- Links to GitHub repo: `https://github.com/dsissoko/oneticket-core`
- Owned by a feature task

**HelpScreen.tsx** — Reuse quickstart guide
- 7-step guide for reusing AppShell in a new project
- Links to runbook: `.oneticket/docs/run/appshell-reuse.md`
- Owned by a feature task

### 5.3 Hooks (Data Logic)

**useUsers() — React Query Example**
```typescript
function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      return res.json();
    },
  });
}
```
- Owned by a feature task
- Automatically cached by React Query
- Demonstrates the pattern for all data fetching
- Can be extended with invalidation, mutations, etc.

### 5.4 Mock Data & MSW Handlers

**mocks/browser.ts** — MSW worker setup
- Activates the service worker for local development
- Owned by Task 0

**mocks/handlers.ts** — API endpoint mocks
```typescript
export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json(mockUsers);
  }),
];
```
- Feature tasks extend this with new endpoints
- Each endpoint handler is owned by the feature task that created it

**mocks/data/users.ts** — Mock database
```typescript
export const mockUsers = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];
```
- Owned by feature task

### 5.5 Styling & Design Tokens

**globals.css** — Design tokens as CSS custom properties

Light mode (`:root`):
```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3%;
  --accent: 0 100% 50%;
  --border: 0 0% 89%;
  --muted-background: 0 0% 96%;
  --muted-foreground: 0 0% 45%;
}
```

Dark mode (`.dark`):
```css
.dark {
  --background: 0 0% 3%;
  --foreground: 0 0% 98%;
  --accent: 0 100% 70%;
  --border: 0 0% 20%;
  --muted-background: 0 0% 12%;
  --muted-foreground: 0 0% 63%;
}
```

**tailwind.config.ts** — Consumes CSS variables
```typescript
export default {
  theme: {
    colors: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      accent: 'hsl(var(--accent))',
      border: 'hsl(var(--border))',
      'muted-background': 'hsl(var(--muted-background))',
      'muted-foreground': 'hsl(var(--muted-foreground))',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
  },
};
```

Owned by Task 0. Feature tasks **never** modify these tokens — they only consume them via Tailwind utility classes.

### 5.6 Component Library (shadcn/ui)

**Installed Components** in `src/components/ui/`:
- `button.tsx` — versatile button with variants
- `card.tsx` — container for grouped content
- `dropdown-menu.tsx` — context menu / select dropdown
- `separator.tsx` — visual divider
- `form.tsx` — React Hook Form wrapper
- `input.tsx` — text input field
- `label.tsx` — form label

**Installation:** One-time setup in Task 0 via `npx shadcn-ui@latest add <component>`

**Rule:** Feature tasks never install new shadcn components. Request new components through a setup/integration task.

### 5.7 Icons

**lucide-react** — Icon library

All icons come from lucide-react. Never use emoji or custom SVGs in feature tasks.

Example:
```typescript
import { Users, Settings } from 'lucide-react';

export function UsersHeader() {
  return <Users className="w-6 h-6" />;
}
```

---

## 6. Key Interfaces

### 6.1 React Router Routes

```typescript
// App.tsx
const routes = [
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomeScreen /> },
      { path: '/about', element: <AboutScreen /> },
      { path: '/help', element: <HelpScreen /> },
    ],
  },
];
```

New routes are **additive** — feature tasks add new `<Route>` entries without modifying existing ones.

### 6.2 Hook Contract

All hooks follow the React Query pattern:

```typescript
export function useFeature() {
  return useQuery({
    queryKey: ['feature'], // unique identifier
    queryFn: async () => {
      const res = await fetch('/api/feature');
      if (!res.ok) throw new Error('Failed to fetch feature');
      return res.json();
    },
  });
}

// Usage:
const { data, isLoading, isError } = useFeature();
```

### 6.3 MSW Handler Contract

```typescript
export const handlers = [
  http.get('/api/endpoint', ({ request, params, cookies }) => {
    return HttpResponse.json({ data: [...] });
  }),
];
```

Handlers are **composable** — each feature task adds its own handlers to the `handlers` array.

### 6.4 Screen Contract

All screens follow this pattern:

```typescript
export function FeatureScreen() {
  const { data, isLoading, isError, error } = useFeature();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Feature</h1>
      {/* render data using shadcn components */}
    </div>
  );
}
```

---

## 7. Data Architecture

### 7.1 Data Flow

```
Screen (React component)
  ↓ uses
useFeature() (custom hook)
  ↓ uses
React Query (@tanstack/react-query)
  ↓ calls
fetch('/api/feature')
  ↓ intercepted by (dev only)
MSW (Mock Service Worker)
  ↓ returns
Mock data from mocks/data/feature.ts
  ↓ cached by
React Query
  ↓ returned to
Screen (renders data)
```

### 7.2 Data Fetching Strategy

1. **All fetching goes through React Query** — Never use bare `fetch()` or `axios` without React Query.
2. **MSW Intercepts in Dev** — In development, MSW intercepts `fetch()` calls and returns mock data.
3. **Real API in Prod** — In production, MSW is tree-shaken; `fetch()` calls go to the real API.
4. **Automatic Caching** — React Query automatically caches responses and syncs data.

### 7.3 Query Client Setup

**lib/query-client.ts:**
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes (formerly cacheTime)
    },
  },
});
```

Wrapped in `main.tsx` via `QueryClientProvider`.

### 7.4 Mock Data Organization

```
mocks/
├── browser.ts          ← MSW worker (no data)
├── handlers.ts         ← HTTP handler definitions
└── data/
    ├── users.ts        ← Mock users array
    └── todos.ts        ← Mock todos array
```

Each feature task owns its own data file(s).

---

## 8. Security Architecture

### 8.1 Dev-Only MSW

MSW is **guarded by `import.meta.env.DEV`** in `main.tsx`:

```typescript
async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'warn',
    });
  }
}

await enableMocking();
```

This ensures:
- MSW is active only during development (`npm run dev`)
- Production builds (`npm run build`) have zero MSW code (tree-shaken)
- No security risk from mock data or intercepted requests in production

### 8.2 Environment Variables

`.env.example`:
```
VITE_APP_NAME=AppShell
```

The `VITE_` prefix makes variables available to the browser at build time (Vite convention). No secrets in frontend config.

### 8.3 No Authentication in Skeleton

AppShell intentionally omits authentication — it's not part of the reference skeleton. Apps built on AppShell add authentication as needed (JWT, OAuth, etc.).

---

## 9. Deployment Strategy

### 9.1 Build & Optimization

1. **Development** — `npm run dev`
   - Vite dev server on `http://localhost:5173`
   - HMR (Hot Module Replacement) enabled
   - MSW active (mocks API calls)
   - React Query DevTools enabled

2. **Production Build** — `npm run build`
   - Vite produces optimized `dist/` directory
   - MSW is tree-shaken (zero production overhead)
   - TypeScript compiled to JavaScript
   - CSS minified
   - No console logs or debug code

3. **Preview** — `npm run preview`
   - Local preview of production build
   - Useful for testing production behavior locally

### 9.2 GitHub Pages Deployment

AppShell is published to GitHub Pages via GitHub Actions workflow (`.github/workflows/docs-site-github-pages.yml`):

1. Push to `main` → triggers workflow
2. Build step: `npm run build` → produces `dist/`
3. Deploy step: Publishes docs and app to GitHub Pages
4. App live at: `https://dsissoko.github.io/oneticket-core/appshell/`

### 9.3 Basename Configuration

For GitHub Pages deployment, `vite.config.ts` sets the basename:

```typescript
export default defineConfig({
  base: '/oneticket-core/appshell/',
});
```

This ensures assets load correctly when deployed to a subdirectory.

---

## 10. Observability Strategy

### 10.1 React Query DevTools

React Query DevTools provide real-time visibility into query state:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// In App.tsx or main.tsx:
<ReactQueryDevtools initialIsOpen={false} />
```

- View all active queries
- See cached data and stale times
- Inspect request/response payloads
- Useful for debugging data-fetching issues

### 10.2 Console Logging

- **Development:** Console logs are allowed for debugging
- **Production:** No debug console logs (via build optimization)

### 10.3 Error Handling

- **MSW Errors:** MSW logs unhandled requests to console with `onUnhandledRequest: 'warn'`
- **React Query Errors:** Use React Query's error callback to log API failures
- **Component Errors:** Will be caught by React error boundary (if added later)

---

## 11. Related C4 Views

- [System Context](../c4/system-context.md) — AppShell within the oneticket-core ecosystem
- [Containers](../c4/containers.md) — Frontend containers, build tools, runtimes
- [Components](../c4/components.md) — React components, hooks, styling layers
- [Deployment](../c4/deployment.md) — GitHub Pages, build artifacts, CDN

---

## 12. Related Implementation Slices

Implementation of AppShell is organized into sequential and parallel slices to prevent merge conflicts:

See [how/slices/](../slices/) for all implementation slices derived from this architecture.

**Slice Model:**
- **Slice 0: Skeleton Setup** (sequential, no dependencies)
  - File structure, config files, Tailwind setup
- **Slices 1+: Feature Screens** (parallel, depends_on: [slice-0])
  - Each screen: HomeScreen, AboutScreen, HelpScreen
  - Each hook: useUsers
  - Each mock handler: GET /api/users
- **Final Slice: Route Integration** (sequential, depends_on: all screens)
  - Wire screens into App.tsx routes

---

## 13. Technical Constraints

### 13.1 Stack Lock

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Bundler | Vite | 5.x | Lightning-fast dev server, zero-config |
| Framework | React | 18.x | Stable, widespread, great DevTools |
| Language | TypeScript | 5.x | Type safety, excellent editor support |
| Router | React Router | 6.x | Lightweight, modern, no magic |
| Styling | Tailwind CSS | 3.x | Utility-first, constraint-based, fast |
| Styling | CSS Custom Properties | CSS3 | Design tokens, reactive theme switching |
| UI Components | shadcn/ui | latest | Accessible, customizable, Radix-based |
| Icons | lucide-react | latest | Consistent, comprehensive, open-source |
| Forms | React Hook Form | 7.x | Lightweight, performant, validation-friendly |
| Validation | Zod | 3.x | TypeScript-first schema validation |
| Data Fetching | @tanstack/react-query | 5.x | Caching, synchronization, DevTools |
| Mocking | MSW | 2.x | Transparent API mocking, dev-only |
| State (optional) | Zustand | 4.x | Lightweight, optional in skeleton |
| Testing | Vitest | latest | Fast, Vue-inspired, compatible with React |
| Component Testing | @testing-library/react | latest | User-centric testing patterns |

**Rationale:** No ad-hoc substitutions. These choices are enforced to ensure consistency across all apps built on AppShell.

### 13.2 Naming Conventions

| Category | Pattern | Examples |
|---|---|---|
| Screens | `{Feature}Screen.tsx` | `HomeScreen.tsx`, `ProfileScreen.tsx` |
| Hooks | `use{Feature}.ts` | `useUsers.ts`, `useTodos.ts` |
| Components | `{Name}.tsx` | `Header.tsx`, `Card.tsx` |
| Mock Data | `{feature}.ts` | `users.ts`, `todos.ts` |
| Stores | `{feature}.ts` | `user.ts`, `theme.ts` |
| Schemas | `{entity}.ts` | `user.ts`, `todo.ts` |
| Utilities | Descriptive PascalCase | `cn.ts`, `format.ts` |
| Constants | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `DEFAULT_TIMEOUT` |

### 13.3 File Organization Rules

1. **One screen per file** — `HomeScreen.tsx` is not split into subcomponents within screens/. Small components stay inline.
2. **One hook per data source** — `useUsers.ts` is not split; all user data fetching goes through this hook.
3. **One handler per endpoint family** — All `/api/users` handlers in `mocks/handlers.ts`, not split into separate files.
4. **No shared state in skeleton** — Zustand is available but unused. Apps add global state only if needed.
5. **No custom components in skeleton** — Use shadcn/ui components directly; don't wrap them.

---

## 14. Open Questions

1. **Authentication Pattern** — Should AppShell include an auth example, or is authentication always app-specific?
   - **Decision Pending:** Recommend to @po

2. **Error Boundary** — Should there be a top-level error boundary in `main.tsx` to catch React rendering errors?
   - **Decision Pending:** Recommend to @po

3. **404 Route** — Should AppShell include a NotFound/404 screen with a catch-all route?
   - **Decision Pending:** Recommend to @po

4. **Internationalization (i18n)** — Should AppShell include i18n foundation (e.g., react-i18next)?
   - **Decision Pending:** Recommend to @po

5. **Advanced State Management** — Should there be an example Zustand store in the skeleton, or keep it unused?
   - **Current Decision:** Keep unused; add only if needed by specific app

6. **API Base URL** — Should there be a configurable API base URL, or is it always domain-relative?
   - **Current Decision:** Domain-relative (`/api/...`); apps override if needed

7. **Logger/Analytics** — Should AppShell include a logging or telemetry foundation?
   - **Decision Pending:** Recommend to @po

---

## 15. Appendix: File Structure Reference

Complete file structure with ownership and responsibility:

```
apps/appshell/
├── app/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── vitest.setup.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── layouts/
│       │   └── AppLayout.tsx
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── Footer.tsx
│       │   ├── ThemeToggle.tsx
│       │   └── ui/
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── dropdown-menu.tsx
│       │       ├── separator.tsx
│       │       ├── form.tsx
│       │       ├── input.tsx
│       │       └── label.tsx
│       ├── screens/
│       │   ├── HomeScreen.tsx
│       │   ├── AboutScreen.tsx
│       │   └── HelpScreen.tsx
│       ├── hooks/
│       │   └── useUsers.ts
│       ├── stores/
│       │   └── .gitkeep
│       ├── mocks/
│       │   ├── browser.ts
│       │   ├── handlers.ts
│       │   └── data/
│       │       └── users.ts
│       ├── lib/
│       │   ├── utils.ts
│       │   ├── query-client.ts
│       │   └── schemas/
│       │       └── .gitkeep
│       └── styles/
│           └── globals.css
│
├── docs/
│   ├── what/
│   │   ├── product-spec.md
│   │   └── epics/
│   │       └── epic-0-mvp/
│   │           ├── epic.md
│   │           └── us-001.md ... us-007.md
│   └── how/
│       ├── architecture.md          ← THIS FILE
│       ├── c4/                      ← C4 diagrams (to be produced)
│       └── slices/                  ← Implementation slices (to be produced)
```

---

## 16. Related Skills & Documentation

- **Skill: oneticket-appshell** — Details on reusing AppShell for new projects, conventions, and patterns
- **Runbook: appshell-reuse.md** — Step-by-step guide for copying and adapting AppShell in a new project
- **Product Spec** — [product-spec.md](../what/product-spec.md) — Business goals and feature list
- **Epic 0** — [epic-0-mvp](../what/epics/epic-0-mvp/) — Functional scope and user stories

---

**Last Updated:** 2026-05-29  
**Status:** Draft (Task D — Architecture Production)  
**Maintained By:** @architect
