# Architecture — AppShell

## 1. Architecture Principles

### Exclusive File Ownership
- **One component = One file** — each UI component owns its own `.tsx` file exclusively
- **One screen = One file** — each route owns one `.tsx` file with no shared modification
- **Shared components locked** — `Header`, `Footer`, and `AppLayout` are locked after setup; modifications require review
- **Parallel-safe development** — multiple developers or agents work simultaneously on different files with zero merge conflicts

### Design by Constraint
- **Design tokens immutable** — all colors, spacing, typography defined in `tailwind.config.ts` and `styles/globals.css`
- **shadcn/ui only** — approved primitives built on `@base-ui/react` enforce visual consistency automatically
- **No inline styles** — all styling uses Tailwind classes and design tokens
- **No magic numbers** — all dimensions, colors, and transitions derive from frozen tokens

### Single Responsibility
- **API layer** — `api/client.ts` and `api/endpoints.ts` centralize all HTTP communication
- **Server state** — React Query hooks encapsulate all async data fetching and caching
- **Hooks isolation** — each hook manages one concern (`useUsers`, `useCreateUser`, etc.)
- **Screen isolation** — each screen component manages its own features without importing from other screens
- **Theme isolation** — `next-themes` manages all theme state via context — no manual CSS class toggling

---

## 2. System Overview

**AppShell** is a canonical React + Vite single-page application (SPA) that serves as a reference skeleton and template for all OneTicket projects.

The system consists of:

1. **Frontend SPA** — React 18 + TypeScript, running entirely in the browser
2. **Mock API** — MSW (Mock Service Worker) intercepting HTTP calls in all environments (dev, preview, production demo)
3. **Server State** — React Query managing all async data fetching, caching, and synchronization
4. **Design System** — Tailwind CSS with frozen design tokens and shadcn/ui components
5. **Theme System** — `next-themes` managing light/dark/system preference
6. **Observability** — `loglevel` with optional remote dispatch via `VITE_OTLP_ENDPOINT`
7. **Testing Infrastructure** — Vitest + React Testing Library + MSW in test mode

**Key Insight:** There is no backend server. AppShell is entirely frontend-driven with API calls intercepted by MSW. This allows developers to:
- Work completely offline
- Design APIs before the backend exists
- Test with realistic data without server dependency
- Parallelize development safely

---

## 3. Architectural Style

**Single-Page Application (SPA) with Client-Side Routing**

- **Client-side routing** via React Router v6 — all navigation happens in-browser without page reload
- **Lazy-loaded routes** — each screen is a separate JavaScript chunk, loaded on demand via `React.lazy()` and `Suspense`
- **Global error boundary** — top-level `ErrorBoundary` catches render errors and displays a graceful fallback
- **Global error listeners** — `window.onerror` and `unhandledrejection` captured in `main.tsx`
- **Component-driven architecture** — UI composed of small, testable, reusable components

**Data flow:**

```
User Action
  ↓
React Component
  ↓
React Query Hook (server state) OR next-themes (theme state)
  ↓
API Client (fetch wrapper)
  ↓
MSW Interceptor → mock response
  ↓
React Query caches + delivers to component
  ↓
Re-render
```

---

## 4. Main Technical Boundaries

### Frontend Boundary (Browser)
- **React screens** — UI rendering at `src/screens/`
- **React Router** — client-side routing with `basename` for sub-path deployments
- **React Query** — server state caching and synchronization
- **next-themes** — theme preference (system/light/dark), persisted to localStorage
- **Hooks** — custom logic at `src/hooks/` (`useUsers`, `useUser`, `useProfile`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`)

### API Boundary
- **Centralized API client** (`api/client.ts`) — single fetch wrapper for all requests
- **Endpoint definitions** (`api/endpoints.ts`) — URLs and request shapes
- **Type definitions** (`api/types.ts`) — request/response TypeScript interfaces
- **MSW handlers** (`mocks/handlers.ts`) — mock implementations of API endpoints
- **Mock data** (`mocks/data/users.ts`) — realistic seed data for development and demo

### Design System Boundary
- **Tailwind configuration** (`tailwind.config.ts`) — frozen HSL design tokens (colors, spacing, typography)
- **Global styles** (`styles/globals.css`) — CSS custom properties for light/dark theme, Tailwind directives
- **shadcn/ui components** (`components/ui/`) — Button, Card, DropdownMenu, Separator, Form, Avatar — installed in repo, not from node_modules
- **Lucide icons** — consistent SVG icon library
- **`cn()` helper** (`lib/utils.ts`) — Tailwind class composition via `clsx` + `tailwind-merge`

### State Boundary
- **React Query** — all async server state (users list, single user, profile, mutations)
- **next-themes** — theme state (persisted to localStorage, applied via `.dark` CSS class)
- **React local state** — UI-only ephemeral state (`useState` in components)
- **No global client state store** — Zustand intentionally excluded; add if a derived app requires cross-screen client state

### Observability Boundary
- **`logger`** (`lib/logger.ts`) — `loglevel` wrapper with configurable level via `VITE_LOG_LEVEL`
- **Remote dispatch** — optional, activated by `VITE_OTLP_ENDPOINT`; fire-and-forget, never blocks rendering
- **Auto-instrumented** — navigation changes logged in `AppLayout`, React Query errors in `QueryCache.onError`, render errors in `ErrorBoundary.componentDidCatch`

---

## 5. File Structure

```
apps/appshell/app/
├── .env.example                     ← VITE_APP_NAME, VITE_LOG_LEVEL, VITE_OTLP_ENDPOINT
├── index.html
├── package.json
├── tailwind.config.ts               ← frozen design tokens
├── postcss.config.js
├── tsconfig.json                    ← ES2020, strict, vite/client types, @/ alias
├── vite.config.ts                   ← VITE_BASE_PATH, __ENABLE_MSW__, resolve.alias
├── vitest.config.ts                 ← jsdom, @/ alias, vitest.setup.ts
├── vitest.setup.ts                  ← Testing Library + MSW server setup
└── src/
    ├── main.tsx                     ← MSW init + ThemeProvider + QueryClientProvider + BrowserRouter
    ├── styles/
    │   └── globals.css              ← Tailwind directives + HSL CSS vars (light/dark)
    ├── components/
    │   ├── layout/
    │   │   ├── AppLayout.tsx        ← Header + Outlet + Footer (locked)
    │   │   ├── Header.tsx           ← logo + nav + ThemeToggle (locked)
    │   │   └── Footer.tsx           ← N1 copyright+links / N2 social icons (locked)
    │   ├── ui/                      ← shadcn components (button, card, dropdown-menu, separator, form, avatar)
    │   ├── ThemeToggle.tsx          ← next-themes dropdown (system/light/dark)
    │   ├── ErrorBoundary.tsx        ← React render error boundary
    │   └── LoadingIndicator.tsx     ← Suspense fallback
    ├── screens/
    │   ├── HomeScreen.tsx           ← landing page (/)
    │   ├── AboutScreen.tsx          ← about (/about)
    │   ├── HelpScreen.tsx           ← help & FAQ (/help)
    │   └── NotFoundScreen.tsx       ← 404 fallback
    ├── hooks/
    │   ├── useUsers.ts              ← GET /api/users
    │   ├── useUser.ts               ← GET /api/users/:id
    │   ├── useProfile.ts            ← GET /api/users/profile
    │   ├── useCreateUser.ts         ← POST /api/users
    │   ├── useUpdateUser.ts         ← PUT /api/users/:id
    │   └── useDeleteUser.ts         ← DELETE /api/users/:id
    ├── api/
    │   ├── client.ts                ← fetch wrapper
    │   ├── endpoints.ts             ← URL definitions
    │   └── types.ts                 ← User, CreateUserRequest, etc.
    ├── mocks/
    │   ├── browser.ts               ← MSW worker setup
    │   ├── handlers.ts              ← REST handlers (GET/POST/PUT/DELETE /api/users)
    │   └── data/
    │       └── users.ts             ← seed data (Alice, Bob, Charlie, Diana, Eve)
    ├── lib/
    │   ├── utils.ts                 ← cn() helper (clsx + tailwind-merge)
    │   ├── query-client.ts          ← QueryClient with QueryCache.onError + MutationCache.onError
    │   ├── logger.ts                ← loglevel + optional remote dispatch
    │   └── schemas/
    │       └── .gitkeep             ← Zod schemas — empty, ready for epic-3-demo forms
    └── types/
        └── loglevel-plugin-remote.d.ts  ← module declaration (no official types)
```

---

## 6. Key Components

### Layout Components (Locked)

**AppLayout** (`src/components/layout/AppLayout.tsx`)
- Root layout wrapping all screens
- CSS Grid: `grid-rows-[auto_1fr_auto]` — sticky header, flexible content, sticky footer
- Logs navigation changes via `useLocation` + `logger.info`

**Header** (`src/components/layout/Header.tsx`)
- Sticky top header using `bg-background border-border` tokens
- Logo (clickable → `/`), navigation links, ThemeToggle
- Responsive mobile menu button (Menu icon from lucide-react)

**Footer** (`src/components/layout/Footer.tsx`)
- N1: copyright left + text links right (Documentation, Project, Issues)
- Separator
- N2: social icons (GitFork → github.com, Avatar → github.com/dsissoko, Star → stargazers)
- All colors use shadcn tokens — no hardcoded values

### Core Components

**ThemeToggle** (`src/components/ThemeToggle.tsx`)
- shadcn DropdownMenu with lucide icons (Sun, Moon, Monitor)
- `useTheme()` from `next-themes` — persists to localStorage, applies `.dark` class

**ErrorBoundary** (`src/components/ErrorBoundary.tsx`)
- Catches React render errors
- Logs via `logger.error`
- Displays graceful fallback with shadcn Button

---

## 7. API Shape (MSW Handlers)

```typescript
// GET /api/users
{ data: User[]; total: number }

// GET /api/users/:id
{ data: User }

// GET /api/users/profile
{ data: User }

// POST /api/users
body: { email: string; name: string; role: 'admin' | 'user' }
response: { data: User }  // 201

// PUT /api/users/:id
body: Partial<User>
response: { data: User }

// DELETE /api/users/:id
response: {}  // 204

// Domain Model
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}
```

---

## 8. MSW Strategy

MSW is **always active** — controlled by `__ENABLE_MSW__: true` in `vite.config.ts`, independent of the build environment.

- `true` → MSW intercepts all `/api/*` calls (dev, preview, GitHub Pages demo)
- `false` → MSW disabled, real backend is used (set when connecting a real API)

**Service Worker scope:** `worker.start({ serviceWorker: { url: import.meta.env.BASE_URL + 'mockServiceWorker.js' } })` — ensures the SW is found on any sub-path deployment.

**Unhandled requests:** `onUnhandledRequest: 'bypass'` — external requests (avatar images, fonts, etc.) are never intercepted.

---

## 9. Theme System

`next-themes` manages all theme state:

- `ThemeProvider attribute="class"` in `main.tsx` — applies `.dark` class on `<html>`
- `defaultTheme="system"` — follows OS preference by default
- CSS custom properties in `styles/globals.css` — HSL values for `:root` (light) and `.dark`
- `tailwind.config.ts` — consumes CSS vars via `hsl(var(--token))` for all color tokens
- `darkMode: ['class']` — Tailwind dark variants activated by `.dark` class

---

## 10. Observability

### Logger (`lib/logger.ts`)

- **Library:** `loglevel` + `loglevel-plugin-remote`
- **Level:** controlled by `VITE_LOG_LEVEL` env var (default: `debug`)
- **Remote:** activated by `VITE_OTLP_ENDPOINT` — JSON format, 1s batch, 500 message queue
- **Fire-and-forget** — remote dispatch never blocks rendering

### Auto-instrumented points

| Point | Mechanism | Log level |
|---|---|---|
| App start | `main.tsx` | `info` |
| MSW enabled | `main.tsx` | `info` |
| Navigation | `AppLayout` `useEffect` on `location.pathname` | `info` |
| React Query fetch error | `QueryCache.onError` | `error` |
| React Query mutation error | `MutationCache.onError` | `error` |
| React render error | `ErrorBoundary.componentDidCatch` | `error` |
| Uncaught JS error | `window.onerror` | `error` |
| Unhandled promise rejection | `window.unhandledrejection` | `error` |

---

## 11. Deployment

### GitHub Pages (current)

| Environment | URL | `VITE_BASE_PATH` |
|---|---|---|
| PR preview | `https://dsissoko.github.io/oneticket-core/appshell/pr/{N}/app/` | `/oneticket-core/appshell/pr/{N}/app/` |
| Production | `https://dsissoko.github.io/oneticket-core/appshell/app/` | `/oneticket-core/appshell/app/` |

**Critical configuration for sub-path deployments:**
- `vite.config.ts` — `base: process.env.VITE_BASE_PATH ?? '/'`
- `BrowserRouter` — `basename={import.meta.env.BASE_URL}`
- MSW — `url: import.meta.env.BASE_URL + 'mockServiceWorker.js'`
- `tsconfig.json` — `"types": ["vite/client"]` for `import.meta.env`
- `vite.config.ts` — `resolve.alias: { '@': path.resolve(__dirname, './src') }`

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_NAME` | `AppShell` | Application name |
| `VITE_BASE_PATH` | `/` | Base path — injected by CI |
| `VITE_LOG_LEVEL` | `debug` | Logger level: `debug \| info \| warn \| error \| silent` |
| `VITE_OTLP_ENDPOINT` | _(empty)_ | Remote log endpoint — empty = console only |

---

## 12. Tech Stack

| Layer | Library | Version |
|---|---|---|
| Bundler | Vite | ^5 |
| UI | React + TypeScript | ^18, ^5 |
| Router | React Router DOM | ^6 |
| Styling | Tailwind CSS | ^3 |
| Components | shadcn/ui via @base-ui/react | latest |
| Utilities | clsx + tailwind-merge + class-variance-authority | latest |
| Icons | lucide-react | latest |
| Font | @fontsource-variable/geist | latest |
| Animations | tw-animate-css | latest |
| Data fetching | @tanstack/react-query | ^5 |
| Mock API | MSW | ^2 |
| Theme | next-themes | ^0.3 |
| Logging | loglevel + loglevel-plugin-remote | ^1.9, ^0.6 |
| Testing | Vitest + @testing-library/react + jsdom | ^1 |

---

## 13. Technical Constraints

### Hard Constraints
- **No file sharing** — two features never modify the same file
- **One screen = One file** — `HomeScreen.tsx` is exclusive to `/` route
- **Locked components** — `Header.tsx`, `Footer.tsx`, `AppLayout.tsx` — changes require architectural review
- **shadcn/ui only** — no other UI component libraries
- **No inline styles** — Tailwind classes only
- **No hardcoded colors** — always use design tokens (`bg-background`, `text-foreground`, etc.)
- **TypeScript strict** — `strict: true` in `tsconfig.json`
- **`@/` alias** — always use `@/` imports, never relative `../` for cross-directory imports

### Browser Support
- Modern browsers only — Chrome, Firefox, Safari, Edge (last 2 versions)
- ES2020 target

---

## 14. Roadmap

| Epic | Subject | Status |
|---|---|---|
| `epic-0-mvp` | Skeleton foundation | ✅ Delivered |
| `epic-1-auth0` | Auth0 authentication | 🔲 Planned |
| `epic-2-testing` | Test coverage | 🔲 Planned |
| `epic-3-demo` | Demo screen with tabbed patterns | 🔲 Planned |
| `epic-4-appshell-reuse` | AppShell reuse — new project init | 🔲 Planned |

---

## 15. Related C4 Views

- [System Context](c4/system-context.md)
- [Containers](c4/containers.md)
