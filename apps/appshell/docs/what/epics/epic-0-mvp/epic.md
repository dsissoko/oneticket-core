# Epic: epic-0-mvp — AppShell Complete Skeleton Setup

## Overview

**epic-0-mvp** is the foundational epic for AppShell. It covers the creation of the complete, production-ready application skeleton: directory structure, base components, example screens, theming system, data-fetching infrastructure, and MSW setup. Upon completion, any new project can copy `apps/appshell/app/` and have a fully functional, feature-ready SPA.

## Problem Statement

New app projects require extensive boilerplate setup (routing, theming, API mocking, data fetching, component library, layouts). This setup is error-prone, time-consuming, and prone to inconsistencies across projects. AppShell eliminates this by providing a complete, copy-paste skeleton that is production-grade and enforces design quality through constraints.

## Goals

1. **Zero-Setup Reusability** — `apps/appshell/app/` is a complete, self-contained, working SPA that any new project can copy and run immediately.
2. **Merge-Error Elimination** — Establish strict file ownership boundaries so parallel feature development never causes merge conflicts.
3. **Design Quality by Constraint** — Embed design tokens, Tailwind configuration, and component library setup so all screens use approved primitives.
4. **Feature-Ready Foundation** — Include authentication scaffold, error boundaries, data-fetching pipeline, and mock server so feature teams have no setup burden.

## Scope: 100% AppShell Skeleton

### 1. Directory Structure (`apps/appshell/app/src/`)

```
apps/appshell/app/
├── src/
│   ├── main.tsx                  # App entry point; MSW setup with DEV guard
│   ├── App.tsx                   # React Router config; centralized routes
│   ├── index.css                 # Global imports (Tailwind, fonts)
│   ├── styles/
│   │   └── globals.css           # CSS custom properties (light/dark themes)
│   ├── components/
│   │   ├── AppLayout.tsx         # Header + Outlet + Footer wrapper
│   │   ├── Header.tsx            # App name (left) + About & Help dropdown + ThemeToggle (right)
│   │   ├── Footer.tsx            # Empty but structured
│   │   ├── ThemeToggle.tsx       # Light/Dark/System mode switcher
│   │   └── ui/                   # shadcn/ui components (button, card, dropdown-menu, separator, form, etc.)
│   ├── screens/
│   │   ├── HomeScreen.tsx        # Demonstrates React Query + MSW; calls useUsers()
│   │   ├── AboutScreen.tsx       # AppShell description, documentation links
│   │   └── HelpScreen.tsx        # 7-step quickstart for reusing AppShell
│   ├── hooks/
│   │   └── useUsers.ts           # Example hook; fetches /api/users via React Query
│   ├── lib/
│   │   ├── query-client.ts       # React Query singleton configuration
│   │   └── schemas/
│   │       └── users.ts          # Zod schema for User validation
│   ├── mocks/
│   │   ├── browser.ts            # MSW setupWorker initialization
│   │   ├── handlers.ts           # MSW request handlers (GET /api/users, etc.)
│   │   └── data/
│   │       └── users.ts          # Mock user dataset
│   └── types/
│       └── index.ts              # Shared TypeScript types
├── public/
│   ├── vite.svg
│   └── favicon.ico
├── .env.example                  # Environment variables template
├── vite.config.ts                # Vite bundler configuration
├── tailwind.config.ts            # Tailwind design tokens
├── postcss.config.ts             # PostCSS plugins (Tailwind processor)
├── tsconfig.json                 # TypeScript strict mode + settings
├── vitest.config.ts              # Vitest test runner configuration
├── eslint.config.js              # ESLint rules
├── prettier.config.js            # Code formatting
├── package.json                  # Dependencies (React, Vite, React Query, MSW, etc.)
└── README.md                     # Quick start guide for AppShell
```

### 2. Core Components & Layout

#### 2.1 AppLayout Component
- **File:** `src/components/AppLayout.tsx`
- **Purpose:** Wraps all screens with consistent Header, main Outlet, and Footer
- **Responsibilities:**
  - Render Header with app name and navigation
  - Render `<Outlet />` for screen content
  - Render Footer
  - Apply consistent padding/margins
  - Accept and manage theme state (via `next-themes`)
- **Props:** None (reads from `next-themes` context)
- **Styling:** Tailwind classes; no inline styles

#### 2.2 Header Component
- **File:** `src/components/Header.tsx`
- **Purpose:** Top navigation bar
- **Responsibilities:**
  - Display `VITE_APP_NAME` on left (clickable → `/`)
  - Display "About & Help" dropdown on right
    - "About" option → `/about`
    - "Help" option → `/help`
  - Display `ThemeToggle` on right side
  - Responsive design (desktop-first)
- **Styling:** Tailwind; use shadcn Button, DropdownMenu components

#### 2.3 ThemeToggle Component
- **File:** `src/components/ThemeToggle.tsx`
- **Purpose:** Switch between light, dark, and system theme modes
- **Responsibilities:**
  - Use `next-themes` hook (`useTheme()`)
  - Render three buttons or dropdown: "System", "Light", "Dark"
  - Current selection is highlighted
  - Clicking a theme updates `localStorage` and HTML class
  - Changes apply instantly without page reload
- **Styling:** Tailwind; use shadcn Button, DropdownMenu components

#### 2.4 Footer Component
- **File:** `src/components/Footer.tsx`
- **Purpose:** Footer placeholder
- **Responsibilities:**
  - Render empty footer (structured for future content)
  - Display minimal footer bar

### 3. Screen Components (Example Routes)

#### 3.1 HomeScreen
- **File:** `src/screens/HomeScreen.tsx`
- **Purpose:** Demonstrate React Query + MSW integration
- **Responsibilities:**
  - Call `useUsers()` hook to fetch `/api/users`
  - Render loading spinner while data loads
  - Render error message if fetch fails
  - Render list of user cards with shadcn Card component
  - Show how to handle async data states (loading, error, success)
- **Data Flow:** Component → `useUsers()` → `useQuery()` → MSW (dev) / Real API (prod)
- **Mock Data:** 3-5 sample users from `mocks/data/users.ts`

#### 3.2 AboutScreen
- **File:** `src/screens/AboutScreen.tsx`
- **Purpose:** Explain AppShell vision and purpose
- **Responsibilities:**
  - Display AppShell description
  - Explain the skeleton concept and file ownership model
  - Provide links to:
    - Product Specification (`docs/what/product-spec.md`)
    - Architecture Documentation (`docs/how/architecture.md`)
    - GitHub Repository
  - Use shadcn Card and Button components

#### 3.3 HelpScreen
- **File:** `src/screens/HelpScreen.tsx`
- **Purpose:** Provide quickstart guide for reusing AppShell
- **Responsibilities:**
  - Display 7-step quickstart for copying AppShell to a new project:
    1. Copy `apps/appshell/app/` → `apps/{project}/app/`
    2. Update `.env.example` with project name
    3. Update `tailwind.config.ts` with project-specific tokens
    4. Customize `AboutScreen.tsx` with project description
    5. Customize `HelpScreen.tsx` with project quickstart
    6. Update routes in `App.tsx` for project screens
    7. Run `npm install && npm run dev`
  - Provide links to runbook and documentation

### 4. Data-Fetching Infrastructure

#### 4.1 React Query Setup
- **File:** `src/lib/query-client.ts`
- **Configuration:**
  - Create singleton `QueryClient` instance
  - Set default options:
    - `staleTime: 5 * 60 * 1000` (5 minutes)
    - `gcTime: 10 * 60 * 1000` (10 minutes garbage collection)
    - `retry: 1` (single retry on failure)
    - `refetchOnWindowFocus: true` (refetch when tab regains focus)
  - Export `queryClient` for use in `main.tsx` and tests

#### 4.2 Example Hook: useUsers
- **File:** `src/hooks/useUsers.ts`
- **Purpose:** Fetch user list via React Query
- **Implementation:**
  ```typescript
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
- **Return Value:** `{ data: User[], isLoading, isError, error, refetch }`
- **Validation:** Zod schema validation (`lib/schemas/users.ts`)

#### 4.3 Zod Schemas
- **File:** `src/lib/schemas/users.ts`
- **Purpose:** Validate API responses
- **Schema Definition:**
  ```typescript
  export const userSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    avatar?: z.string().optional(),
  });
  export const usersSchema = z.array(userSchema);
  ```

### 5. Mock Service Worker (MSW) Setup

#### 5.1 MSW Initialization
- **File:** `src/mocks/browser.ts`
- **Purpose:** Set up MSW service worker
- **Implementation:**
  ```typescript
  import { setupWorker } from 'msw/browser';
  import { handlers } from './handlers';
  
  export const worker = setupWorker(...handlers);
  ```

#### 5.2 MSW Integration in main.tsx
- **File:** `src/main.tsx`
- **Purpose:** Start MSW only in development
- **Implementation:**
  ```typescript
  if (import.meta.env.DEV) {
    await worker.start({
      onUnhandledRequest: 'warn',
    });
  }
  ```
- **Guard:** `import.meta.env.DEV` ensures MSW is inactive in production

#### 5.3 MSW Request Handlers
- **File:** `src/mocks/handlers.ts`
- **Purpose:** Define HTTP request handlers
- **Implementation:**
  ```typescript
  import { http, HttpResponse } from 'msw';
  import { mockUsers } from './data/users';
  
  export const handlers = [
    http.get('/api/users', () => HttpResponse.json(mockUsers)),
  ];
  ```
- **Handler Pattern:** One handler per API endpoint
- **Response Format:** Match real API schema exactly

#### 5.4 Mock Data
- **File:** `src/mocks/data/users.ts`
- **Purpose:** Store mock datasets
- **Implementation:**
  ```typescript
  export const mockUsers = [
    { id: '1', name: 'Alice', email: 'alice@example.com', avatar: '...' },
    { id: '2', name: 'Bob', email: 'bob@example.com', avatar: '...' },
    // ...
  ];
  ```
- **Data Quality:** Realistic mock data that matches production API schema

### 6. Routing

#### 6.1 App.tsx — Centralized Routes
- **File:** `src/App.tsx`
- **Purpose:** React Router configuration
- **Implementation:**
  ```typescript
  import { BrowserRouter, Routes, Route } from 'react-router-dom';
  import AppLayout from './components/AppLayout';
  import HomeScreen from './screens/HomeScreen';
  import AboutScreen from './screens/AboutScreen';
  import HelpScreen from './screens/HelpScreen';
  
  export function App() {
    return (
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/about" element={<AboutScreen />} />
            <Route path="/help" element={<HelpScreen />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }
  ```
- **Nesting:** All routes render inside `AppLayout` via `<Outlet />`
- **File Ownership:** Centralized in one file; modified only by integration task

### 7. Theming System

#### 7.1 CSS Custom Properties
- **File:** `src/styles/globals.css`
- **Purpose:** Define light and dark mode color values
- **Implementation:**
  ```css
  :root {
    --color-primary: #000;
    --color-bg: #fff;
    --color-text: #000;
    --color-border: #e5e7eb;
    /* ... */
  }
  
  .dark {
    --color-primary: #fff;
    --color-bg: #000;
    --color-text: #fff;
    --color-border: #333;
    /* ... */
  }
  ```
- **Consumption:** Referenced in Tailwind config; consumed via `text-primary`, `bg-bg`, etc.

#### 7.2 Tailwind Configuration
- **File:** `tailwind.config.ts`
- **Purpose:** Define design tokens and Tailwind customizations
- **Implementation:**
  ```typescript
  export default {
    theme: {
      extend: {
        colors: {
          primary: 'var(--color-primary)',
          bg: 'var(--color-bg)',
          text: 'var(--color-text)',
          border: 'var(--color-border)',
        },
      },
    },
  };
  ```
- **Constraint:** No inline `style` attributes; all styling via Tailwind and CSS custom properties

#### 7.3 next-themes Integration
- **Purpose:** Manage theme state and persistence
- **Setup:**
  - Wrap `App` with `<ThemeProvider>` in `main.tsx`
  - Configuration: `attribute="class"`, `storageKey="theme"`, `themes={['light', 'dark', 'system']}`
  - Persist theme choice to `localStorage`
  - Update HTML class on theme change
  - No page reload needed

### 8. Component Library (shadcn/ui)

#### 8.1 Pre-Installed shadcn/ui Components
- **button** — Primary action button
- **card** — Container for grouped content
- **dropdown-menu** — Dropdown navigation menu
- **separator** — Visual divider
- **form** — Form wrapper with React Hook Form integration
- **input** — Text input field
- **label** — Form field label
- **select** — Dropdown select field

#### 8.2 Component Installation
- **Method:** All components are committed to repo (not node_modules)
- **Location:** `src/components/ui/`
- **Styling:** Tailwind classes; no custom CSS overrides
- **Modification Rule:** Components are frozen in task 0; feature tasks use existing components, do not add new ones

### 9. Build Configuration

#### 9.1 Vite Configuration
- **File:** `vite.config.ts`
- **Purpose:** Bundler settings
- **Configuration:**
  - React plugin enabled (`@vitejs/plugin-react`)
  - HMR enabled for instant feedback
  - Environment variable expansion
  - Build output to `dist/`
  - Source maps for debugging

#### 9.2 TypeScript Configuration
- **File:** `tsconfig.json`
- **Purpose:** Strict mode and compiler settings
- **Configuration:**
  - `strict: true` (strict null checks, no implicit any)
  - `module: "ESNext"`, `target: "ES2020"`
  - Path aliases (e.g., `@/*` → `./src/*`)

#### 9.3 Environment Variables
- **File:** `.env.example`
- **Purpose:** Template for environment configuration
- **Variables:**
  - `VITE_APP_NAME` — Display name in header
  - `VITE_API_BASE_URL` — Base URL for API (dev-only, MSW overrides in dev)

#### 9.4 Package Dependencies
- **Runtime:**
  - `react` (^18.0.0)
  - `react-dom` (^18.0.0)
  - `react-router-dom` (^6.x)
  - `@tanstack/react-query` (^5.x)
  - `next-themes` (latest)
  - `zod` (latest)
  - `react-hook-form` (latest)
  - `@hookform/resolvers` (latest)
  - `lucide-react` (icons)
  - `clsx` (className utilities)

- **Dev:**
  - `typescript` (latest, strict)
  - `vite` (latest)
  - `@vitejs/plugin-react` (latest)
  - `tailwindcss` (latest)
  - `postcss` (latest)
  - `autoprefixer` (latest)
  - `eslint`, `prettier`
  - `vitest`, `@testing-library/react`, `@testing-library/dom`
  - `msw` (^2.0.0)

### 10. Testing Infrastructure

#### 10.1 Vitest Configuration
- **File:** `vitest.config.ts`
- **Purpose:** Fast unit and integration test runner
- **Configuration:**
  - Environment: jsdom
  - Setup files for global test utilities
  - Coverage threshold: 70%+ for new code

#### 10.2 Test Example
- **File:** `src/screens/__tests__/HomeScreen.test.tsx`
- **Purpose:** Demonstrate testing data-fetching screens with MSW
- **Pattern:**
  ```typescript
  test('renders user list', async () => {
    render(<HomeScreen />);
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
  });
  ```

### 11. Error Boundaries

#### 11.1 Root Error Boundary
- **File:** `src/components/ErrorBoundary.tsx`
- **Purpose:** Catch React component errors
- **Scope:** Wraps entire `<App />` in `main.tsx`
- **Fallback:** Generic error page with reload button

#### 11.2 Screen-Level Error Handling
- **Pattern:** Each screen handles data-fetching errors via React Query's `isError` state
- **UI:** Error message card with retry button

### 12. Code Quality

#### 12.1 ESLint Configuration
- **File:** `eslint.config.js`
- **Rules:**
  - React best practices (hooks rules, prop-types)
  - TypeScript strict checks
  - Import organization
  - Unused variable detection

#### 12.2 Prettier Configuration
- **File:** `prettier.config.js`
- **Format:**
  - Print width: 80
  - Tab width: 2
  - No trailing commas in single-line objects
  - Single quotes for strings

### 13. Documentation Files

#### 13.1 README.md
- **Purpose:** Quick start guide for AppShell
- **Content:**
  - What is AppShell
  - Quick start (install, dev, build)
  - Project structure overview
  - How to reuse AppShell
  - Links to full documentation

#### 13.2 .env.example
- **Purpose:** Environment variable template
- **Content:**
  ```
  VITE_APP_NAME=AppShell
  VITE_API_BASE_URL=http://localhost:3000/api
  ```

## Success Criteria

- [ ] `npm run build` completes without errors or warnings
- [ ] `npm run dev` starts without errors; app renders at `http://localhost:5173`
- [ ] Routes `/`, `/about`, `/help` render correctly
- [ ] Header displays app name (left, clickable → `/`)
- [ ] Header displays "About & Help" dropdown (right)
- [ ] "About & Help" dropdown navigates correctly to `/about` and `/help`
- [ ] ThemeToggle (right side of header) is present and functional
- [ ] Theme switching is reactive without page reload
- [ ] Pressing F5 or refreshing persists theme choice
- [ ] HomeScreen calls `useUsers()` and displays 3-5 user cards
- [ ] MSW intercepts `/api/users` requests in development
- [ ] Loading spinner displays while fetching users
- [ ] Error state displays if fetch fails
- [ ] AboutScreen displays AppShell description and links
- [ ] HelpScreen displays 7-step quickstart
- [ ] Footer is present but empty
- [ ] `globals.css` defines CSS custom properties for light and dark modes
- [ ] `tailwind.config.ts` consumes CSS variables for colors
- [ ] All shadcn/ui components are installed and functional
- [ ] No inline `style` attributes; all styling via Tailwind
- [ ] TypeScript strict mode enabled; `npm run build` shows no type errors
- [ ] `npm run test` runs all tests; smoke test passes
- [ ] No `dist/`, `test-results/`, `*.tsbuildinfo` files committed
- [ ] `package.json` includes all required dependencies
- [ ] `.env.example` is committed; no `.env` file in repo

## High-Level Implementation Plan

1. **Initialize Project Structure** — Create directories, establish file organization, commit skeleton
2. **Install Dependencies** — `npm install` React, Vite, Tailwind, shadcn/ui, React Query, MSW, etc.
3. **Configure Build Tools** — Vite, TypeScript, Tailwind, PostCSS, ESLint, Prettier
4. **Establish Base Components** — AppLayout, Header, Footer, ThemeToggle
5. **Set Up Theming** — CSS custom properties, Tailwind config, next-themes integration
6. **Implement Screens** — HomeScreen, AboutScreen, HelpScreen
7. **Configure Routing** — React Router in App.tsx
8. **Set Up Data Fetching** — React Query, QueryClient singleton, useUsers hook
9. **Configure MSW** — Browser setup, handlers, mock data
10. **Install shadcn/ui Components** — Button, Card, DropdownMenu, Separator, Form
11. **Set Up Testing** — Vitest, Testing Library, example tests
12. **Add Error Boundaries** — Root and screen-level error handling
13. **Code Quality** — ESLint, Prettier, type checking
14. **Documentation** — README, runbook, product-spec, architecture
15. **Final Validation** — Build, test, verify all success criteria

## Acceptance Criteria

- All success criteria passing
- All files in `apps/appshell/app/src/` follow exclusive file ownership rules
- No merge conflict risk for parallel feature development
- Production-ready skeleton (no TODOs, no broken links)
- Full test coverage for screens, hooks, and components
- Documentation is complete and accurate

## Related Documents

- [Product Specification](../../product-spec.md) — Full vision and product goals
- [Architecture](../../../how/architecture.md) — Technical boundaries and design
- [User Stories](./stories/) — Breakdown of epic into individual tasks

## Timeline

- **Phase 1: Setup & Configuration** — 2-3 days
- **Phase 2: Components & Screens** — 2-3 days
- **Phase 3: Data & MSW** — 1-2 days
- **Phase 4: Testing & Documentation** — 1-2 days
- **Total:** 6-10 days for complete skeleton
