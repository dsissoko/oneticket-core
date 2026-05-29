# Product Specification — AppShell

<!-- SITE_DESCRIPTION: AppShell is the reference skeleton for all OneTicket app projects - a production-grade React + Vite SPA template with routing, theming, data fetching, and form management (max 160 chars) -->

## 1. Vision

AppShell is the canonical reference skeleton and starter template for all new app projects in OneTicket. It establishes a single source of truth for project structure, design patterns, stack composition, and architectural conventions. Every new OneTicket app begins by copying `apps/appshell/app/` and adapting its content. AppShell eliminates merge errors through exclusive folder structure, enforces design quality through architectural constraints, and demonstrates production-ready patterns for data fetching, state management, theming, and form handling.

## 2. Users and Actors

- **App Developer** — A OneTicket engineer starting a new app project. Needs a clear, well-documented template that enforces best practices and reduces boilerplate setup time.
- **Tech Lead / Architect** — Ensures all apps follow consistent patterns, share the same tech stack, and avoid architectural divergence across the monorepo.
- **Maintainer** — Responsible for keeping AppShell up-to-date as dependencies evolve, fixing bugs in the template, and propagating breaking changes to downstream apps.

## 3. Problems to Solve

- **Project Proliferation Without Standards** — New app projects were created with inconsistent folder structures, dependency versions, and architectural patterns, making code harder to navigate and maintain across the monorepo.
- **Merge Conflicts in Fan-Out** — Copying and modifying app templates led to divergent file hierarchies and merge errors when trying to propagate updates across multiple projects.
- **Unclear Design Constraints** — Developers had to guess how to structure components, manage state, fetch data, and handle forms, leading to inconsistent implementations.
- **Missing Documentation** — No single reference for tech stack decisions, folder structure rationale, or recommended patterns for common tasks.

## 4. Product Goals

1. **Serve as the single reference skeleton** — All new OneTicket app projects start by copying `apps/appshell/app/` and adapting its content.
2. **Eliminate merge errors through exclusive folder structure** — Clear separation of concerns (UI, hooks, domain rules, validation, API, view models) reduces conflicts.
3. **Enforce design quality through architectural constraints** — Predefined folder structure and pattern examples guide developers toward clean, maintainable code.
4. **Demonstrate production-ready patterns** — Include working examples of:
   - Data fetching via MSW → React Query
   - Client-side state management (Zustand)
   - Client-side theme system (light/dark/system)
   - Form handling (React Hook Form)
   - TypeScript strict mode
   - Responsive layouts with Primer design system
   - Vitest + Testing Library setup

5. **Provide comprehensive documentation** — Explain tech stack choices, folder structure, and common development tasks.
6. **Remain lightweight and copy-friendly** — Minimal boilerplate, clear entry points, easy to customize for specific app needs.

## 5. Out of Scope

- **Backend / API Implementation** — AppShell mocks APIs via MSW; backend is outside scope.
- **Build Optimization** — CI/CD pipeline, bundling strategies, and deployment configs are not part of AppShell itself.
- **Advanced Testing Framework** — Full test coverage; AppShell provides setup and examples only.
- **Accessibility (WCAG)** — While Primer provides accessible components, comprehensive accessibility audit is deferred.
- **Mobile-First Responsive Design** — Desktop-first approach; mobile responsiveness is supported but not the primary focus.
- **PWA / Offline Capabilities** — Service worker, offline caching, and PWA manifests are out of scope for V1.
- **Internationalization (i18n)** — No multi-language support in V1.

## 6. Business Concepts

- **AppShell** — The reference template containing a complete, working React + Vite app structure. Copied as the basis for new projects.
- **Exclusive Folder Structure** — A hierarchical file organization that partitions concerns (UI, hooks, domain, validation, API, viewModels) to minimize merge conflicts.
- **Tech Stack** — The definitive set of dependencies for all OneTicket apps: Vite, React 18, TypeScript, React Router, Tailwind CSS, shadcn/ui, React Hook Form, React Query, MSW, Zustand, lucide-react, next-themes, Vitest, Testing Library.
- **Theming System** — Client-side theme toggle (light/dark/system) persisted to localStorage via next-themes.
- **Data Fetching Pattern** — MSW (Mock Service Worker) for API mocking in development; React Query for client-side caching, pagination, and mutations.
- **Form Pattern** — React Hook Form for declarative form management with validation rules and error handling.
- **View Model** — An optional layer that composes domain logic, validation, and business rules for presentation (distinct from React component state).

## 7. Product Capabilities

### Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Build Tool | Vite | ^5.0 | Fast development server and production bundling |
| Runtime | React | ^18.0 | UI library and component model |
| Language | TypeScript | ^5.0 | Type safety and tooling |
| Routing | React Router | ^6.0 | Client-side navigation and route management |
| Styling | Tailwind CSS | ^3.0 | Utility-first CSS framework |
| UI Components | shadcn/ui | Latest | Pre-built, accessible component library |
| Form Handling | React Hook Form | ^7.0 | Performant, flexible form management |
| Data Fetching | React Query | ^5.0 | Server state management and caching |
| API Mocking | Mock Service Worker (MSW) | ^2.0 | Intercept and mock HTTP/GraphQL requests |
| Client State | Zustand | ^4.0 | Lightweight state management |
| Icons | lucide-react | Latest | Consistent icon library |
| Theming | next-themes | Latest | Client-side theme toggle (light/dark/system) |
| Testing Framework | Vitest | ^1.0 | Fast unit testing |
| Testing Utilities | Testing Library | ^14.0 | Component and integration testing |

### Folder Structure

```
apps/appshell/
├── app/                              # Main application (template for new projects)
│   ├── src/
│   │   ├── ui/                       # Presentational React components (no logic)
│   │   │   ├── components/
│   │   │   │   ├── Header.tsx        # Header component
│   │   │   │   ├── Footer.tsx        # Footer component
│   │   │   │   └── ...
│   │   │   ├── layouts/
│   │   │   │   └── MainLayout.tsx    # Main layout wrapper (Header, Outlet, Footer)
│   │   │   └── screens/
│   │   │       ├── HomeScreen.tsx    # Home page
│   │   │       ├── AboutScreen.tsx   # About AppShell page
│   │   │       └── HelpScreen.tsx    # Help / Quick Start page
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useUsers.ts           # Data fetching example
│   │   │   ├── useTheme.ts           # Theme toggle hook
│   │   │   └── ...
│   │   │
│   │   ├── domain/                   # Business logic and rules (no React deps)
│   │   │   ├── types.ts              # Business entity types
│   │   │   ├── rules.ts              # Business rules and invariants
│   │   │   └── ...
│   │   │
│   │   ├── validation/               # Input validation rules
│   │   │   ├── schemas.ts            # Zod schemas or validation rules
│   │   │   └── ...
│   │   │
│   │   ├── api/                      # API client and handlers
│   │   │   ├── client.ts             # Axios or fetch wrapper
│   │   │   ├── handlers.ts           # MSW handlers for dev
│   │   │   └── ...
│   │   │
│   │   ├── viewModels/               # Composition layer for domain + validation
│   │   │   ├── UserViewModel.ts      # Example: compose user domain + validation
│   │   │   └── ...
│   │   │
│   │   ├── App.tsx                   # Root component and router setup
│   │   ├── main.tsx                  # Entry point
│   │   ├── index.css                 # Global styles
│   │   └── vite-env.d.ts             # Vite type definitions
│   │
│   ├── public/                       # Static assets
│   │   └── favicon.svg
│   │
│   ├── tests/                        # Test files (mirrors src/ structure)
│   │   ├── ui/
│   │   ├── hooks/
│   │   ├── domain/
│   │   └── ...
│   │
│   ├── vite.config.ts                # Vite configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── tailwind.config.ts            # Tailwind configuration
│   ├── postcss.config.ts             # PostCSS configuration
│   ├── vitest.config.ts              # Vitest configuration
│   ├── package.json                  # Dependencies
│   ├── .env.example                  # Example environment variables
│   └── README.md                     # Project-specific setup guide
│
└── docs/                             # Documentation (rendered via Astro Starlight)
    └── what/
        └── product-spec.md           # This file
```

### Routes

| Route | Purpose | Description |
|-------|---------|-------------|
| `/` | Home | Welcome screen with example data (list of users from mock API) |
| `/about` | About AppShell | Documentation page explaining AppShell's purpose, stack, and patterns |
| `/help` | Help / Quick Start | Quick-start guide for developers forking AppShell |

### Layout

- **Header** — Fixed top navigation bar with logo, project title, and theme toggle (light/dark/system).
- **Outlet** — Main content area where route-specific screens render.
- **Footer** — Fixed bottom footer with copyright, links, and optional status indicators.

### Theming System

- **Providers** — Wrapped via `next-themes` ThemeProvider at app root.
- **Storage** — Theme preference persisted to `localStorage['theme']`.
- **Default** — System preference on first visit; user choice on subsequent visits.
- **UI Integration** — Theme toggle button in Header; updates className on `<html>` element (dark mode via Tailwind CSS).

### Data Fetching Pattern

1. **MSW Handlers** — API endpoints mocked in `src/api/handlers.ts` during development.
2. **React Query** — Client-side state management for server data:
   - `useQuery` for read operations (e.g., fetching users).
   - `useMutation` for mutations (e.g., creating, updating, deleting).
   - Automatic caching, refetching, and error handling.
3. **Example: `useUsers` Hook**
   ```typescript
   export const useUsers = () => {
     return useQuery({
       queryKey: ['users'],
       queryFn: () => api.get('/users'),
     });
   };
   ```

### Form Handling Pattern

- **React Hook Form** — Declarative form definitions with validation rules.
- **Example: Login Form**
  ```typescript
  const form = useForm({
    resolver: zodResolver(loginSchema),
  });
  
  const onSubmit = (data) => {
    // Handle submission
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}
    </form>
  );
  ```

### Development Workflow

1. **Local Development** — `npm run dev` starts Vite dev server + MSW request interception.
2. **Build** — `npm run build` produces optimized production bundle.
3. **Preview** — `npm run preview` serves built artifacts locally.
4. **Testing** — `npm run test` runs Vitest suite.
5. **Type Checking** — `npm run type-check` runs TypeScript compiler.

### Example Screens

#### Home Screen (`/`)
- Displays a list of users fetched via `useUsers` hook (MSW mocked endpoint).
- Shows loading state, error state, and rendered user list.
- Demonstrates React Query integration and data fetching pattern.

#### About Screen (`/about`)
- Static page explaining AppShell's purpose, goals, and tech stack.
- Links to documentation and architectural guides.
- Serves as a reference for developers exploring the template.

#### Help Screen (`/help`)
- Quick-start guide for developers forking AppShell.
- Step-by-step instructions:
  1. Copy `apps/appshell/app/` to new project folder.
  2. Update `package.json` with new project name.
  3. Run `npm install`.
  4. Update routes and screens for specific app needs.
  5. Customize layout, theme, and business logic.
- Links to common patterns (forms, data fetching, state management, theming).

## 8. High-Level Workflows

### Creating a New App Project

1. **Developer copies AppShell template** → `cp -r apps/appshell/app/ apps/newproject/app/`
2. **Update project metadata** → Modify `package.json`, `.env`, and config files.
3. **Install dependencies** → `npm install`
4. **Customize routes and screens** → Replace Home, About, Help with app-specific screens.
5. **Implement domain logic** → Add business rules to `src/domain/`, validation rules to `src/validation/`, API handlers to `src/api/`.
6. **Add custom hooks** → Extend `src/hooks/` with app-specific data fetching and state management.
7. **Build and test** → Run `npm run build`, `npm run test`, deploy.

### Fetching Data in a Component

1. **Define a custom hook** (e.g., `useUsers`) in `src/hooks/`.
2. **Use React Query** with MSW-mocked endpoint.
3. **In component** → Call `const { data, isLoading, error } = useUsers()`.
4. **Render UI** based on loading/error/data states.

### Managing Form State

1. **Define validation schema** in `src/validation/schemas.ts` (e.g., using Zod).
2. **Create form hook** or component using React Hook Form.
3. **Register inputs** with `useForm.register()`.
4. **Display errors** from `form.formState.errors`.
5. **Submit** via `form.handleSubmit(onSubmit)`.

### Toggling Theme

1. **User clicks theme toggle** in Header.
2. **`next-themes` hook** updates theme preference.
3. **localStorage** persists new preference.
4. **CSS class** on `<html>` switches Tailwind dark mode styles.

## 9. Business Rules

1. **Single Source of Truth** — AppShell is the reference template. All apps begin as a copy of `apps/appshell/app/`.

2. **Exclusive Folder Structure** — The defined folder hierarchy (ui, hooks, domain, validation, api, viewModels) must be preserved in all derived apps to enable consistent merges and updates.

3. **Tech Stack Lock** — All apps use the exact same versions of core dependencies (Vite, React, TypeScript, Tailwind, shadcn/ui, React Query, MSW, Zustand, next-themes, Vitest, Testing Library). Version upgrades are coordinated across all apps.

4. **MSW for Development** — Development always mocks APIs via MSW. Production may swap handlers for real API endpoints.

5. **React Query Caching** — All data fetching must use React Query to ensure consistent caching behavior and network request deduplication.

6. **TypeScript Strict Mode** — All code must compile under `"strict": true` in `tsconfig.json`. No `any` types without explicit justification.

7. **Theme Persistence** — Theme preference (light/dark) must persist to localStorage and survive page reloads.

8. **Component Separation** — UI components in `src/ui/` must contain no business logic or data fetching. Logic belongs in hooks, domain, or viewModels.

9. **Route Protection** — All routes must be explicitly defined in App.tsx router config. No catch-all or dynamic route matching.

10. **Error Handling** — All async operations (data fetching, mutations) must handle success and error cases. Errors must be visible to the user.

## 10. Success Criteria

1. ✅ **AppShell is a complete, runnable React app** — Developer can clone, install, and run `npm run dev` without errors.

2. ✅ **File structure matches specification** — Folders for ui, hooks, domain, validation, api, viewModels exist and contain example files.

3. ✅ **Three routes work end-to-end** — Home, About, Help screens render correctly; navigation works.

4. ✅ **Data fetching example works** — Home screen successfully fetches users via React Query + MSW.

5. ✅ **Theme toggle works** — User can switch light/dark/system theme; preference persists across reloads.

6. ✅ **Layout renders correctly** — Header (with theme toggle) + Outlet + Footer visible on all pages.

7. ✅ **TypeScript strict mode passes** — No build errors or type warnings.

8. ✅ **Tests run** — Vitest + Testing Library setup works; example tests pass.

9. ✅ **Documentation is clear** — README in app/, About screen, Help screen provide actionable guidance.

10. ✅ **No external dependencies beyond spec** — Only dependencies listed in tech stack are used.

## 11. Open Questions

1. **Logo and branding** — Should AppShell have a default logo, or is a text-only header sufficient?

2. **Color palette** — What is the default Tailwind color scheme for AppShell? Should it match GitHub Primer design system?

3. **Header layout** — Should the Header be fixed, sticky, or static? Any minimum width constraints for responsiveness?

4. **Footer content** — Should Footer include version number, links to docs, or other metadata?

5. **User API response format** — What is the exact schema for the `/users` endpoint mocked in MSW? (e.g., `{ id, name, email }`)

6. **Form example** — Should HomeScreen include a form example (e.g., user creation), or focus solely on data fetching?

7. **Error boundary** — Should AppShell include a top-level error boundary to catch React errors?

8. **Environment variables** — What environment variables should `.env.example` include? (e.g., `VITE_API_URL`, `VITE_THEME_DEFAULT`)

9. **Accessibility requirements** — Should all screens pass WCAG 2.1 AA, or is WCAG 2.1 A sufficient?

10. **Performance targets** — Any specific Lighthouse scores or Core Web Vitals targets for AppShell?
