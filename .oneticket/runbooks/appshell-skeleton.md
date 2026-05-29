# AppShell Skeleton — Detailed Implementation Runbook

## Document Purpose

This is the internal detailed runbook for implementing AppShell as a project scaffold. Use this for deep technical decisions, patterns, and implementation details that go beyond the user-facing [RUN-BOOK.md](../../apps/appshell/docs/how/RUN-BOOK.md).

---

## Principles

### 1. Exclusive File Ownership

**Definition:** Each file is owned by exactly one feature. No two features share the same file.

**Implementation:**

```
✅ Good: Zero conflicts
src/pages/UsersPage.tsx      (Feature A: User Management)
src/pages/ProductsPage.tsx   (Feature B: Product Management)

❌ Bad: Merge conflicts
src/pages/Dashboard.tsx      (Both Feature A and B need to modify)
```

**Locked Components (Protected):**

```
apps/appshell/app/src/components/layout/
├── AppLayout.tsx   ← LOCKED (root layout)
├── Header.tsx      ← LOCKED (navigation)
└── Footer.tsx      ← LOCKED (global footer)
```

These cannot be modified without architectural review to prevent breaking global layout.

### 2. Design by Constraint

All design decisions are frozen in configuration files, not scattered across code:

| What | Where | Format | Locked? |
|------|-------|--------|---------|
| Colors | `tailwind.config.ts` | theme.colors | YES |
| Spacing | `tailwind.config.ts` | theme.spacing | YES |
| Typography | `tailwind.config.ts` | theme.fontFamily | YES |
| Component Styles | `shadcn/ui` imports | Pre-styled components | YES |
| Icons | `lucide-react` | Consistent SVG set | YES |

**Benefit:** New developers cannot accidentally break visual consistency; all customizations go through one place.

### 3. Single Responsibility

Each layer has one concern:

```
┌─────────────────────────────────────────────┐
│ UI Layer (React Components)                 │
│ - No business logic                         │
│ - No API calls                              │
│ - Only render and dispatch events           │
└─────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│ State Layer (Zustand + React Query)         │
│ - Zustand: local app state (auth, theme)   │
│ - React Query: server state (data, lists)   │
│ - Never mix the two                         │
└─────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│ API Layer (HTTP client, endpoints)          │
│ - Centralized fetch wrapper                 │
│ - Endpoint definitions in one place         │
│ - Type-safe request/response shapes         │
└─────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│ Mocking Layer (MSW)                         │
│ - Intercepts HTTP in dev/test               │
│ - Disabled in production                    │
│ - Realistic response delays                 │
└─────────────────────────────────────────────┘
```

---

## File Structure Deep Dive

### apps/appshell/app/src/

```
src/
├── index.tsx                       # App entry point, route setup
├── main.css                        # Global styles (CSS variables for theme)
│
├── components/
│   ├── index.ts                    # Export all components
│   ├── layout/
│   │   ├── AppLayout.tsx           # ← LOCKED: Root layout
│   │   ├── Header.tsx              # ← LOCKED: Navigation bar
│   │   └── Footer.tsx              # ← LOCKED: App footer
│   ├── ThemeToggle.tsx             # Theme switcher (light/dark/system)
│   ├── ErrorBoundary.tsx           # Error boundary for render errors
│   └── ProtectedRoute.tsx          # Route wrapper for auth-protected pages
│
├── pages/
│   ├── HomePage.tsx                # Route: /
│   ├── AboutPage.tsx               # Route: /about
│   ├── HelpPage.tsx                # Route: /help
│   └── __tests__/                  # Page tests (co-located)
│       ├── HomePage.test.tsx
│       └── AboutPage.test.tsx
│
├── hooks/
│   ├── useUsers.ts                 # React Query hook for users list
│   ├── useUser.ts                  # React Query hook for single user
│   ├── useProfile.ts               # React Query hook for current user
│   ├── useCreateUser.ts            # React Query mutation for creating user
│   ├── useUpdateUser.ts            # React Query mutation for updating user
│   ├── useDeleteUser.ts            # React Query mutation for deleting user
│   ├── useTheme.ts                 # Zustand store hook for theme
│   └── useAuth.ts                  # Zustand store hook for auth (future)
│
├── stores/
│   ├── appStore.ts                 # Zustand store: theme, sidebar, UI state
│   └── authStore.ts                # Zustand store: user, token, login/logout (optional)
│
├── api/
│   ├── client.ts                   # HTTP fetch wrapper (single point for all requests)
│   ├── endpoints.ts                # Endpoint definitions (URLs grouped by resource)
│   ├── types.ts                    # Request/Response DTOs and domain models
│   ├── mocks.ts                    # MSW handlers for API mocking
│   └── __mocks__/                  # Fixture data for tests
│       └── users.ts                # Mock user data
│
├── types/
│   ├── index.ts                    # Type re-exports
│   └── models.ts                   # Domain models (User, Product, etc.)
│
├── lib/
│   ├── utils.ts                    # Utility functions (formatting, validation)
│   └── classnames.ts               # Class name merging utility (optional)
│
└── test/
    ├── setup.ts                    # Vitest setup file
    ├── smoke/
    │   └── render.test.tsx         # Smoke test: app renders
    └── fixtures/
        └── users.ts                # Shared test fixtures
```

### Configuration Files

```
apps/appshell/app/
├── vite.config.ts                 # Vite dev server & build config
├── vitest.config.ts               # Test runner config (if using Vitest)
├── tailwind.config.ts             # Design tokens & Tailwind setup
├── tsconfig.json                  # TypeScript strict mode
├── tsconfig.node.json             # TypeScript for build files
├── package.json                   # Dependencies & scripts
├── index.html                     # HTML template
├── postcss.config.js              # PostCSS + Tailwind
└── .eslintrc.json (optional)      # ESLint rules
```

### Docs Structure

```
apps/appshell/docs/
├── what/                          # "What" — problem & vision
│   ├── product-spec.md            # Product vision, requirements, success metrics
│   └── epics/
│       └── epic-0-mvp/
│           ├── epic.md            # Epic description
│           └── user-stories/
│               ├── us-001-setup.md
│               ├── us-002-layout.md
│               ├── us-003-routing.md
│               ├── us-004-data-fetching.md
│               ├── us-005-theme-toggle.md
│               └── us-006-documentation.md
│
├── how/                           # "How" — architecture & implementation
│   ├── architecture.md            # Full system design & constraints
│   ├── RUN-BOOK.md               # Step-by-step skeleton reuse guide
│   ├── c4/                        # C4 architecture diagrams (Mermaid)
│   │   ├── system-context.md      # User interactions & system boundaries
│   │   ├── containers.md          # SPA, API, mocking, styling
│   │   └── components.md          # React components & their relationships
│   └── slices/                    # Implementation slices (vertical cuts)
│       ├── slice-0-setup/
│       ├── slice-1-layout/
│       ├── slice-2-routing/
│       ├── slice-3-data-fetching/
│       ├── slice-4-theme/
│       └── slice-5-documentation/
│
└── run/
    └── appshell-reuse.md          # (deprecated, use RUN-BOOK.md instead)
```

---

## Implementation Patterns

### Pattern 1: Creating a New Page

**File structure:**
```
src/pages/
├── MyNewPage.tsx           # Page component (exclusive ownership)
└── __tests__/
    └── MyNewPage.test.tsx  # Page tests
```

**Implementation:**
```typescript
// src/pages/MyNewPage.tsx
import React from 'react';
import { useUsers } from '../hooks/useUsers';

/**
 * MyNewPage Component
 *
 * Displays a list of users.
 * Uses React Query via useUsers hook for server state.
 *
 * @component
 * @example
 * return <MyNewPage />
 */
export function MyNewPage(): React.ReactElement {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Users</h1>
      <ul>
        {users?.map((user) => (
          <li key={user.id} className="mb-4">
            <div className="text-lg font-semibold">{user.name}</div>
            <div className="text-sm text-gray-600">{user.email}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

MyNewPage.displayName = 'MyNewPage';
```

**Register in router:**
```typescript
// src/index.tsx
const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: 'my-new-page', element: <MyNewPage /> },
    ],
  },
];
```

### Pattern 2: Adding an API Endpoint

**Step 1: Define endpoint URL**
```typescript
// src/api/endpoints.ts
export const endpoints = {
  products: {
    list: () => `${API_BASE_URL}/products`,
    detail: (id: string) => `${API_BASE_URL}/products/${id}`,
    create: () => `${API_BASE_URL}/products`,
  },
};
```

**Step 2: Define types**
```typescript
// src/api/types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface GetProductsResponse {
  data: Product[];
  total: number;
}
```

**Step 3: Create MSW handler**
```typescript
// src/api/mocks.ts
import { http, HttpResponse } from 'msw';
import { endpoints } from './endpoints';

export const handlers = [
  http.get(endpoints.products.list(), () => {
    return HttpResponse.json({
      data: [
        { id: '1', name: 'Product A', price: 99.99, description: '...' },
        { id: '2', name: 'Product B', price: 149.99, description: '...' },
      ],
      total: 2,
    });
  }),
];
```

**Step 4: Create React Query hook**
```typescript
// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { GetProductsResponse } from '../api/types';

/**
 * Fetch all products from server
 *
 * @returns React Query result with products list
 *
 * @example
 * const { data: products, isLoading, error } = useProducts();
 */
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiClient<GetProductsResponse>(
        endpoints.products.list()
      );
      return response.data;
    },
  });
}
```

**Step 5: Use in component**
```typescript
// src/pages/ProductsPage.tsx
import { useProducts } from '../hooks/useProducts';

export function ProductsPage(): React.ReactElement {
  const { data: products } = useProducts();
  return (
    <div>
      {products?.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Pattern 3: Creating Zustand Store

**Define store:**
```typescript
// src/stores/myStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * MyStore State
 * Manages local UI state like sidebar collapse, filters, etc.
 */
interface MyStoreState {
  sidebarCollapsed: boolean;
  selectedFilter: string;
  toggleSidebar: () => void;
  setFilter: (filter: string) => void;
}

export const useMyStore = create<MyStoreState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      selectedFilter: 'all',
      
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      setFilter: (filter: string) =>
        set({ selectedFilter: filter }),
    }),
    {
      name: 'my-store', // Key in localStorage
    }
  )
);
```

**Use in component:**
```typescript
// src/components/Sidebar.tsx
import { useMyStore } from '../stores/myStore';

export function Sidebar(): React.ReactElement {
  const { sidebarCollapsed, toggleSidebar } = useMyStore();

  return (
    <aside className={sidebarCollapsed ? 'hidden' : 'visible'}>
      <button onClick={toggleSidebar}>Toggle</button>
    </aside>
  );
}
```

---

## TypeScript Configuration

**apps/appshell/app/tsconfig.json** enforces strict type safety:

```json
{
  "compilerOptions": {
    "target": "ES2020",              // Modern JavaScript target
    "strict": true,                   // Enable all strict mode checks
    "noImplicitAny": true,            // No bare 'any' types
    "strictNullChecks": true,         // Null/undefined must be explicit
    "strictFunctionTypes": true,      // Strict function parameter checking
    "noUnusedLocals": true,           // Error on unused variables
    "noUnusedParameters": true,       // Error on unused parameters
    "noImplicitReturns": true,        // All code paths must return
    "forceConsistentCasingInFileNames": true
  }
}
```

### Common Patterns to Avoid

**Bad:**
```typescript
// Don't use any
const data: any = response.json();

// Don't omit null checks
const user = userData;  // Could be null!
console.log(user.name);  // Runtime error

// Don't ignore function returns
useEffect(() => {
  fetch('/api/users').then(...);  // Unhandled promise
}, []);
```

**Good:**
```typescript
// Explicit types
const data: GetUsersResponse = response.json();

// Null-safe
const user: User | null = userData;
if (user) {
  console.log(user.name);
}

// Handle effects properly
useEffect(() => {
  let isMounted = true;
  fetch('/api/users').then((res) => {
    if (isMounted) {
      setUsers(res.data);
    }
  });
  return () => { isMounted = false; };
}, []);
```

---

## Testing Strategy

### Unit Tests (Components)

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('should render and handle clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(<Button onClick={onClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

### Hook Tests (React Query + Zustand)

```typescript
// src/hooks/__tests__/useUsers.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUsers } from '../useUsers';

describe('useUsers', () => {
  it('should fetch users', async () => {
    const queryClient = new QueryClient();
    
    const { result } = renderHook(() => useUsers(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([
      { id: '1', name: 'Alice', email: 'alice@example.com' },
    ]);
  });
});
```

### Integration Tests (Pages)

```typescript
// src/pages/__tests__/UsersPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { UsersPage } from '../UsersPage';

describe('UsersPage', () => {
  it('should display list of users', async () => {
    const queryClient = new QueryClient();
    
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <UsersPage />
        </QueryClientProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });
});
```

---

## Performance Considerations

### Code Splitting

Routes are lazy-loaded to reduce initial bundle:

```typescript
// src/index.tsx
const HomePage = React.lazy(() => import('./pages/HomePage'));
const UsersPage = React.lazy(() => import('./pages/UsersPage'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: '/', element: <Suspense fallback={<div>Loading...</div>}><HomePage /></Suspense> },
      { path: 'users', element: <Suspense fallback={<div>Loading...</div>}><UsersPage /></Suspense> },
    ],
  },
];
```

### React Query Caching

```typescript
// Queries are cached and stale-while-revalidate by default
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      gcTime: 1000 * 60 * 10,     // 10 minutes (formerly cacheTime)
    },
  },
});
```

### Memoization

Use `React.memo` for expensive components:

```typescript
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <div>{data}</div>;
}, (prevProps, nextProps) => prevProps.data === nextProps.data);
```

---

## Deployment Configuration

### Environment Variables

```env
# .env.local (development)
VITE_API_URL=http://localhost:3000

# .env.production
VITE_API_URL=https://api.example.com
```

**In code:**
```typescript
// src/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### Production Build Checklist

```bash
# 1. Build
npm run build

# 2. Check output
ls -la dist/
# Should contain: index.html, assets/

# 3. Bundle analysis (optional)
npx vite-bundle-visualizer dist

# 4. Preview locally
npm run preview
# Visit http://localhost:5173

# 5. Check for console errors
# Open DevTools → Console → Should be empty
```

### MSW in Production

MSW should be **disabled** in production:

```typescript
// src/index.tsx
async function enableMocking() {
  if (import.meta.env.PROD) {
    return;  // Don't mock in production
  }
  // ... setup worker
}
```

---

## Monitoring & Debugging

### Development DevTools

```typescript
// Enable store inspection (optional)
import { devtools } from 'zustand/middleware';

export const useMyStore = create<MyState>()(
  devtools(
    (set) => ({ /* ... */ }),
    { name: 'myStore' }
  )
);

// Now available in Redux DevTools extension
```

### Error Handling

```typescript
// Error Boundary catches render errors
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return children;
  } catch (error) {
    console.error('Render error:', error);
    return <div>Something went wrong</div>;
  }
}
```

### Logging

```typescript
// Only in development
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

---

## Common Pitfalls & Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| "Module not found" TypeScript errors | Incorrect import paths | Use `npm run build` to see real errors; check relative paths |
| Dev server won't start | Port already in use | `npm run dev -- --port 5174` |
| Tailwind classes don't work | Missing template paths in config | Verify `tailwind.config.ts` content paths include src/*.{ts,tsx} |
| React Query caching stale data | Default staleTime too long | Reduce staleTime or use `queryClient.invalidateQueries` |
| MSW not intercepting API calls | Handlers don't match requests | Check exact paths in handlers vs API calls |
| Zustand state not persisting | Middleware not configured | Use `persist` middleware: `create(...)(persist(...))` |

---

## Scaling Considerations

### When AppShell Becomes Too Small

- **Multiple teams**: Consider splitting into separate packages with shared design system
- **Large state tree**: Migrate from Zustand to Redux Toolkit
- **Complex routing**: Add route-level code splitting and preloading
- **Performance budget exceeded**: Implement component-level code splitting

### Version Management

AppShell follows semver:
- **0.1.x** — Alpha phase, breaking changes possible
- **1.0.0** — Stable release, backward compatibility guaranteed
- **2.0.0** — Major refactoring (e.g., React 19 → React 20)

---

## Documentation Maintenance

Keep these files in sync:

1. **README.md** — User-facing overview
2. **RUN-BOOK.md** — Step-by-step reuse guide
3. **architecture.md** — Detailed design decisions
4. **product-spec.md** — Vision and success metrics
5. **This file** — Internal implementation details

When updating code:
1. Update JSDoc comments
2. Update inline config comments
3. Update architecture.md if patterns change
4. Update RUN-BOOK.md if steps change

---

## Summary

AppShell is a **parallel-safe, design-constrained React template** that enables teams to:

- ✅ Scaffold new projects with zero boilerplate
- ✅ Multiple developers work simultaneously (exclusive file ownership)
- ✅ Consistent design (frozen Tailwind tokens)
- ✅ Type-safe patterns (strict TypeScript)
- ✅ Proven architecture (API, state, UI layers clearly separated)
- ✅ Realistic testing (MSW for API mocking)
- ✅ Fast development (Vite dev server, hot reload)
- ✅ Production-ready (optimized builds, tree-shaking, code splitting)

**Core Files to Review:**
- `apps/appshell/docs/how/architecture.md` — Design principles
- `apps/appshell/docs/how/RUN-BOOK.md` — Reuse instructions
- `apps/appshell/app/src/index.tsx` — App entry point
- `apps/appshell/app/vite.config.ts` — Build configuration
- `apps/appshell/app/tailwind.config.ts` — Design tokens

