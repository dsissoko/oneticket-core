# Architecture

## 1. Architecture Principles

### Exclusive File Ownership
- **One component = One file** — each UI component owns its own `.tsx` file exclusively
- **One page = One file** — each route/page owns one `.tsx` file with no shared modification
- **Shared components locked** — `Header`, `Footer`, and `AppLayout` are locked after v1 setup; modifications require review
- **Parallel-safe development** — multiple agents work simultaneously on different files with zero merge conflicts

### Design by Constraint
- **Design tokens immutable** — all colors, spacing, typography defined in `tailwind.config.ts` and `globals.css`
- **Radix UI + shadcn/ui only** — approved primitives enforce visual consistency automatically
- **No inline styles** — all styling uses Tailwind classes and design tokens
- **No magic numbers** — all dimensions, colors, and transitions derive from frozen tokens

### Single Responsibility
- **API layer** — `api/client.ts` and `api/endpoints.ts` centralize all HTTP communication
- **State management** — Zustand stores encapsulate domain state; React Query encapsulates server state
- **Hooks isolation** — each hook manages one concern (auth, users, theme, etc.)
- **Route isolation** — each page component manages its own features without importing from other pages

---

## 2. System Overview

**AppShell** is a canonical React + Vite single-page application (SPA) that serves as a reference implementation and scaffolding template for all OneTicket projects.

The system consists of:

1. **Frontend SPA** — React 19 + TypeScript, running in browser
2. **Mock API** — MSW (Mock Service Worker) intercepting HTTP calls in dev/test
3. **State Layer** — Zustand for local app state, React Query for server state
4. **Design System** — Tailwind CSS with frozen design tokens and shadcn/ui components
5. **Testing Layer** — Vitest + React Testing Library with MSW in test mode

**Key Insight:** There is no backend server. AppShell is entirely frontend-driven with API calls mocked via MSW. This allows developers to:
- Work completely offline
- Design APIs before backend exists
- Test with realistic data without server dependency
- Parallelize development across multiple agents safely

---

## 3. Architectural Style

**Single-Page Application (SPA) with Client-Side Routing**

- **Client-side routing** via React Router v6 — all navigation happens in-browser without page reload
- **Lazy-loaded routes** — each page is a separate JavaScript chunk, loaded on demand with `React.lazy()` and `Suspense`
- **Error boundary** — top-level error boundary catches render errors and displays graceful fallback
- **Component-driven architecture** — UI is composed of small, testable, reusable components

**Data flow:**
```
User Action
  ↓
React Component
  ↓
Zustand Store (app state) OR React Query Hook (server state)
  ↓
API Client (fetch/axios)
  ↓
MSW Interceptor (dev/test) or Real HTTP (production)
  ↓
Response to Component
  ↓
Re-render
```

---

## 4. Main Technical Boundaries

### Frontend Boundary (Browser)
- **React components** — UI rendering and state management
- **React Router** — client-side routing and navigation
- **Zustand stores** — local app state (auth, theme, sidebar, etc.)
- **React Query** — server state caching and synchronization
- **Hooks** — custom logic extraction (useAuth, useUsers, useTheme)

### API Boundary
- **Centralized API client** (`api/client.ts`) — single HTTP wrapper for all requests
- **Endpoint definitions** (`api/endpoints.ts`) — URLs and request/response shapes
- **Type definitions** (`api/types.ts`) — Request/Response DTOs in TypeScript
- **MSW handlers** (`api/mocks.ts`) — mock implementations of API endpoints

### Design System Boundary
- **Tailwind configuration** (`tailwind.config.ts`) — frozen design tokens (colors, spacing, typography)
- **Global styles** (`styles/globals.css`) — CSS variables for light/dark theme switching
- **shadcn/ui primitives** — Button, Input, Card, Dialog, etc. — pre-styled and ready to use
- **Lucide icons** — 300+ consistent SVG icons

### State Boundary
- **Zustand stores** — synchronous, local-first state (auth status, theme preference, UI state)
- **React Query** — async server state (user data, lists, etc.) with automatic caching and synchronization

---

## 5. Key Components

### Layout Components (Locked)

**AppLayout** (`src/components/AppLayout.tsx`)
- Root layout wrapping all pages
- Contains sticky Header, central Outlet (page content), and sticky Footer
- Manages responsive breakpoints (mobile, tablet, desktop)
- Applies global theme and spacing

**Header** (`src/components/Header.tsx`)
- Sticky header at top of page
- Contains logo (clickable, links to `/`)
- Navigation links (`/`, `/about`, `/help`)
- ThemeToggle component (right side)
- Responsive mobile menu (optional, if nav grows)

**Footer** (`src/components/Footer.tsx`)
- Sticky footer at bottom of page
- Links to documentation, help, About
- Copyright and version info

### Page Components (Exclusive Files)

**HomePage** (`src/pages/HomePage.tsx`)
- Landing/welcome page at `/`
- Introduces AppShell vision and capabilities
- Displays current theme
- Links to other sections

**AboutPage** (`src/pages/AboutPage.tsx`)
- About AppShell at `/about`
- OneTicket team, vision, tech stack
- Product metrics and design principles

**HelpPage** (`src/pages/HelpPage.tsx`)
- FAQ and documentation at `/help`
- Links to GitHub, docs, discussions
- Common troubleshooting

### Core Feature Components

**ThemeToggle** (`src/components/ThemeToggle.tsx`)
- Dropdown to select system/light/dark theme
- Integrates with next-themes
- Persists to localStorage

**ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
- Wrapper component for authenticated pages
- Redirects to login if user not authenticated
- Checks `useAuthStore` for current user

**ErrorBoundary** (`src/components/ErrorBoundary.tsx`)
- Catches React render errors
- Displays fallback UI instead of white screen
- Logs errors for debugging

---

## 6. Key Interfaces

### API Shape (MSW Handlers)

```typescript
// GET /api/users — fetch all users
interface GetUsersResponse {
  data: User[];
  total: number;
}

// GET /api/users/:id — fetch single user
interface GetUserResponse {
  data: User;
}

// POST /api/users — create user
interface CreateUserRequest {
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface CreateUserResponse {
  data: User;
}

// PUT /api/users/:id — update user
interface UpdateUserRequest {
  name?: string;
  role?: 'admin' | 'user';
}

interface UpdateUserResponse {
  data: User;
}

// DELETE /api/users/:id — delete user
interface DeleteUserResponse {
  success: true;
}

// POST /api/auth/login — mock login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  data: {
    token: string;
    user: User;
  };
}

// Domain Models
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
}
```

### React Query Hooks

```typescript
// Queries
useUsers(): UseQueryResult<User[]>
useUser(id: string): UseQueryResult<User>
useProfile(): UseQueryResult<User>  // authenticated

// Mutations
useCreateUser(): UseMutationResult<User, Error, CreateUserRequest>
useUpdateUser(): UseMutationResult<User, Error, UpdateUserRequest>
useDeleteUser(): UseMutationResult<void, Error, string>
```

### Zustand Stores

```typescript
// useAuthStore
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): void;
  setUser(user: User | null): void;
  isAuthenticated(): boolean;
}

// useAppStore
interface AppState {
  theme: 'system' | 'light' | 'dark';
  sidebarCollapsed: boolean;
  setTheme(theme: 'system' | 'light' | 'dark'): void;
  toggleSidebar(): void;
}
```

---

## 7. Data Architecture

### State Management Strategy

**Zustand Stores** (Local App State)
- User session (`authStore`) — persisted to localStorage, survives page reload
- UI state (`appStore`) — theme preference, sidebar collapse state, etc.
- Synchronous, single source of truth per store
- No async logic in stores; async handled by hooks/mutations

**React Query** (Server State)
- Fetches and caches user data, lists, etc. from API
- Automatic background refetching and stale-while-revalidate
- Centralizes cache invalidation logic
- Integrates with React hooks for simple component integration

### Data Flow: User Fetching Example

```
Component mounts
  ↓
useUsers() hook called
  ↓
React Query checks cache
  ↓
If cached (and fresh): return cached data immediately
If stale or missing: trigger fetch
  ↓
API client calls GET /api/users
  ↓
MSW intercepts (in dev/test) or real HTTP (production)
  ↓
Response returned
  ↓
React Query caches and invalidates related queries
  ↓
Component re-renders with fresh data
```

### Caching Layers

1. **React Query cache** — automatic, time-based (staleTime configurable, default 0)
2. **Browser localStorage** — app state (auth token, theme preference)
3. **HTTP caching** — not used in MSW (no browser caching needed for mocks)

---

## 8. Security Architecture

### Authentication
- **Mock login endpoint** (`POST /api/auth/login`) — takes email/password, returns JWT-like token
- **Token storage** — `localStorage.auth_token` — persisted across sessions
- **Token validation** — checked on app startup; auto-logout if expired
- **Protected routes** — `<ProtectedRoute>` wrapper checks `useAuthStore.user` before rendering

### Authorization
- **User roles** — `admin` or `user` (future: RBAC via roles array)
- **Role checking** — available but not enforced in v1 (preparation for v1.1)

### Data Protection
- **HTTPS only** (in production) — Vite dev server uses HTTP (acceptable for dev)
- **No sensitive data in localStorage** — token only; user ID and permissions can be read from JWT
- **CORS** — configured via MSW handlers in dev; real API handles CORS headers

### Secrets Management
- **No hardcoded secrets** — MSW provides mock responses without auth logic
- **API endpoint URLs** — defined in `api/endpoints.ts`; no secrets in code

---

## 9. Deployment Strategy

### Development
- **`npm run dev`** — Vite dev server on `http://localhost:5173`
- **MSW enabled** — `setupWorker()` in `src/index.tsx`
- **Hot module reload** — code changes reload instantly in browser

### Testing
- **`npm run test`** — Vitest with React Testing Library
- **MSW in test mode** — `setupServer()` intercepts API calls
- **Coverage** — Jest coverage reporter

### Production Build
- **`npm run build`** — Webpack/Vite bundler output to `dist/`
- **Tree-shaking** — unused code removed automatically
- **Code splitting** — routes lazy-loaded, separate `.js` chunks per route
- **Minification** — JavaScript, CSS minified by Vite
- **MSW disabled** — no mock API in production (real API used instead)

### Deployment Target
- **Static hosting** — AppShell is entirely static, deployable to Netlify, Vercel, GitHub Pages, AWS S3
- **Environment variables** — `VITE_API_URL` can be configured per deployment
- **Baseline requirement** — any HTTP server capable of serving static files

---

## 10. Observability Strategy

### Logging
- **Console logs** — development-only, no production telemetry
- **Error boundary logs** — errors caught at root level are logged
- **MSW request/response logs** — available in dev tools console (Network tab)

### Debugging
- **React DevTools** — browser extension for inspecting component tree and props
- **Zustand DevTools** — stores exposed for inspection (optional Redux DevTools integration)
- **Network tab** — MSW requests visible in browser DevTools
- **Source maps** — generated for dev/test (not in production build)

### Performance Monitoring (Future)
- **Lighthouse CI** — automated performance scoring
- **Bundle analysis** — webpack-bundle-analyzer or similar for code splitting audit
- **React Profiler** — built-in React profiler for render analysis

---

## 11. Related C4 Views

- [System Context](../c4/system-context.md) — user and system interactions
- [Containers](../c4/containers.md) — SPA, design system, API mocking layer
- [Components](../c4/components.md) — React components and their relationships
- [Deployment](../c4/deployment.md) — static hosting infrastructure

---

## 12. Related Implementation Slices

See [how/slices/](../slices/) for all implementation slices derived from this architecture.

---

## 13. Technical Constraints

### Tech Stack (Locked)
- **React** 19.x — component library
- **Vite** — build tool and dev server
- **TypeScript** — strict mode required (`strict: true`)
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — component library primitives
- **React Router** v6 — client-side routing
- **React Query** v5 — server state management
- **Zustand** v4 — local state management
- **next-themes** v0.3 — theme switching
- **React Hook Form** — form state management
- **Zod** — schema validation
- **Mock Service Worker** v2 — API mocking
- **Vitest** — test runner
- **React Testing Library** — component testing

### File Structure Rules (Hard Constraints)
- **No file sharing** — two features never modify the same file
- **One component = One file** — `Button.tsx` is not shared; each page imports shadcn/ui Button directly
- **One page = One file** — `UsersPage.tsx` is exclusive to `/users` route
- **Locked components** — `Header.tsx`, `Footer.tsx`, `AppLayout.tsx` are protected; changes require architectural review

### Code Quality Rules
- **TypeScript strict** — no `any` types allowed
- **No console.log in production** — dev-only via `process.env.DEV`
- **Accessibility (WCAG AA)** — all interactive elements keyboard-navigable; color contrast ≥ 4.5:1
- **Testing required** — all new components and pages must have unit or integration tests
- **No external CSS frameworks** — Tailwind + shadcn/ui only; no Bootstrap, Material-UI, etc.

### Browser Support
- **Modern browsers only** — Chrome, Firefox, Safari, Edge (last 2 versions)
- **ES2020 target** — TypeScript compiled to ES2020; no IE11 support

---

## 14. Open Questions

1. **Real Backend Integration (v1.1)** — How should the API client switch from MSW mocks to real HTTP calls?
   - Planned: Environment variables (`VITE_API_URL`)
   - Alternative: Feature flags via Zustand store

2. **Advanced Authentication (v1.1)** — Should OAuth/social login be added?
   - Planned: Optional, separate handler in MSW
   - Decision deferred until user research

3. **Permission Model (v1.1+)** — How should role-based access control (RBAC) scale?
   - Current: Simple `user.role` string
   - Future: Role-based permissions array, feature flags

4. **State Management Scale (v2.0)** — Will Zustand scale for complex app state?
   - Current: Simple stores, no middleware
   - Future: Consider Redux or Zustand middleware if state tree grows

5. **Performance Optimization (v2.0)** — Should code splitting be more aggressive?
   - Current: One chunk per route
   - Future: Component-level code splitting if bundle exceeds 500KB

---

## Summary

**AppShell** is a parallel-safe, design-constrained React SPA template that enables 6+ developers to work simultaneously without merge conflicts. It establishes exclusive file ownership, frozen design tokens, and proven patterns for routing, state management, API integration, and testing. The architecture prioritizes simplicity and clarity over flexibility, making it ideal for agent-driven development and rapid project scaffolding.

**Core principles:**
- **Exclusive ownership** — one file, one feature
- **Design by constraint** — design tokens locked, approved primitives only
- **Single responsibility** — API layer, state layer, UI layer clearly separated
- **Parallel-safe** — zero merge conflicts by design
