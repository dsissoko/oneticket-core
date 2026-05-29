# Product Specification — AppShell

<!-- SITE_DESCRIPTION: Reference skeleton for all React/Vite app projects — eliminates merge errors through file ownership and enforces design quality via tokens and Tailwind constraints (max 160 chars) -->

## 1. Vision

AppShell is the **reference skeleton** for all app projects in oneticket-core. It establishes a clean, reusable foundation that any new project can copy and adapt in minutes. By enforcing exclusive file ownership across parallel tasks and embedding design quality through constraints (Tailwind tokens, shadcn/ui primitives, layout system), AppShell eliminates merge conflicts and ensures visual consistency without requiring manual oversight.

Every new app project starts by copying `apps/appshell/app/` and adapting its content to specific business needs. The skeleton is feature-complete, build-ready, and production-grade.

## 2. Users and Actors

- **Project Lead (`@po`)** — Creates a new app project by copying AppShell, adapting theme and routes, and delegating feature implementation to `@dev` agents.
- **Developer Agent (`@dev`)** — Implements feature screens independently, each in its own file, following strict file ownership rules to enable parallel, merge-error-free work.
- **Lead Developer (`@leaddev`)** — Decomposes app features into tasks (task 0 = skeleton setup, then parallel feature screens), enforcing file ownership boundaries.
- **QA / Reviewer** — Validates that routes work, theme toggles correctly, data fetching works end-to-end, and no uncommitted config is required.

## 3. Problems to Solve

1. **Merge Errors in Parallel Pipelines** — When multiple agents modify the same config files (routes, theme, layout) simultaneously, merge conflicts block deployment. AppShell prevents this through exclusive file ownership.

2. **Inconsistent Design Across Features** — Agents may create visually inconsistent screens without a common design language. AppShell embeds design tokens, component conventions, and layout structure to enforce consistency without manual review.

3. **Repetitive Project Setup** — Setting up a new React/Vite app from scratch (routing, theme, MSW, React Query) is boilerplate. AppShell eliminates this by providing a complete, working skeleton that can be copied and adapted in minutes.

4. **Unknown Architecture Constraints** — New agents don't know which files they can modify in parallel. AppShell documents exclusive file ownership so agents understand the boundaries.

## 4. Product Goals

1. **Zero-Setup Reusability** — Any new app project can copy the entire `apps/appshell/app/` directory and have a working, build-ready application within minutes.

2. **Merge-Error Elimination** — Through strict file ownership, parallel FAN-OUT tasks never modify the same file, eliminating merge conflicts entirely.

3. **Design Quality by Constraint** — Tailwind tokens, shadcn/ui component library, and layout system force agents to use approved primitives, preventing generic AI aesthetics.

4. **Developer Clarity** — Clear documentation of file ownership so agents know exactly which files they can modify in parallel and which are shared.

5. **Production-Grade Skeleton** — Include authentication scaffolding, data-fetching patterns (MSW + React Query), theme switching, and error boundaries so no project starts with incomplete fundamentals.

## 5. Out of Scope

- **Feature Implementation** — AppShell provides only screens, hooks, and mocks templates; specific features (user registration, dashboards, etc.) are built in derived projects, not AppShell itself.
- **Backend API** — AppShell uses MSW for mocking; real backend integration is project-specific.
- **Multi-Language Support (i18n)** — Internationalization is deferred to projects that require it.
- **Mobile-Responsive Design** — AppShell targets desktop-first; mobile responsiveness is a per-project concern.
- **Advanced State Management** — Zustand is available but unused in the skeleton; complex state logic lives in projects.
- **Custom Styling** — No custom CSS beyond globals.css and Tailwind config; projects extend tokens as needed.
- **Deployment Configuration** — CI/CD, environment variables, and deployment are managed per-project.

## 6. Business Concepts

### Core Entities

- **Project** — A derived app created by copying AppShell. Each project has its own `apps/{project}/app/` directory, environment, and feature screens.

- **Screen** — A React component representing a page or major UI section (e.g., HomeScreen, AboutScreen). Each screen is in its own file under `screens/`. One task per screen ensures exclusive ownership.

- **Route** — A URL path mapped to a screen via React Router (`/`, `/about`, `/help`). Routes are centralized in `App.tsx`.

- **Component (UI Primitive)** — A shadcn/ui component (button, card, dropdown-menu) installed once during skeleton setup, never modified in parallel tasks.

- **Hook (Data/Logic)** — A custom React hook encapsulating data fetching (e.g., `useUsers()`) or business logic. One hook per file, one task per hook.

- **Mock Handler** — An MSW request handler that intercepts and responds to API calls during development. MSW is dev-only; production uses real endpoints.

- **Theme** — The light/dark mode presentation, controlled via CSS custom properties and Tailwind config. Toggled without page reload via `ThemeToggle` component.

- **Layout** — The AppLayout wrapper (Header, Outlet, Footer) that frames all screens. Established once, never modified by feature tasks.

### States & Lifecycle

- **Skeleton Setup (Task 0)** — Copy appshell, install shadcn components, configure theme, prepare routes. Sequential, single task.
- **Feature Development (Tasks 1+)** — Implement feature screens, hooks, mocks in parallel. Each task owns exclusive files.
- **Integration (Final Task)** — Wire all screens into `App.tsx` routes. Sequential, depends_on all feature tasks.

## 7. Product Capabilities

### Core Architecture
- **React 18 + TypeScript** — Modern, type-safe React with strict null checks.
- **Vite Bundler** — Fast, ES-module-based bundling with HMR for instant feedback.
- **React Router v6** — Client-side routing with outlets, nested routes, and programmatic navigation.
- **Tailwind CSS + Design Tokens** — CSS-in-class utility framework with custom tokens for colors, spacing, typography. No inline styles.

### Styling & Theme
- **Tailwind Configuration** — Custom tokens defined in `tailwind.config.ts`; consumed by all components via class names.
- **CSS Custom Properties** — Light and dark mode values defined in `globals.css` (`:root` and `.dark` selectors). Reactive without page reload.
- **Theme Toggle** — `ThemeToggle` component exposing three modes: system (respect OS preference), light, dark. Persisted via `next-themes`.

### Component Library
- **shadcn/ui** — Radix UI components pre-configured for Tailwind. Includes button, card, dropdown-menu, separator, form, and more. Installed once; code committed to repo, not node_modules.
- **UI Conventions** — All screens use common primitives: `PageHeader` at top, `Card` for grouped content, `EmptyState` for no-data scenarios.

### Data Fetching & State
- **@tanstack/react-query** — Server state management with caching, refetching, and loading states. Central `QueryClient` configured in `lib/query-client.ts`.
- **MSW (Mock Service Worker)** — HTTP request mocking for development. `import.meta.env.DEV` guard ensures it's dev-only; production uses real endpoints.
- **API Handlers** — Mock handlers in `mocks/handlers.ts` intercept requests (e.g., `GET /api/users`) and return mock data from `mocks/data/`.
- **Zustand** — Optional lightweight state management available but unused in skeleton. Projects add stores under `stores/` as needed.

### Forms & Validation
- **React Hook Form** — Declarative form state with minimal re-renders.
- **Zod** — Schema validation for forms and API responses. Schemas live in `lib/schemas/`.
- **@hookform/resolvers** — Bridges React Hook Form and Zod validation.

### Layout & Navigation
- **AppLayout** — Wraps all screens with Header, Outlet (screens render here), and Footer.
- **Header** — Left: App name (VITE_APP_NAME, clickable → `/`). Right: "About & Help" dropdown (→ `/about`, `/help`) + `ThemeToggle`.
- **Footer** — Empty but structured; projects add content as needed.
- **Routes** — Three built-in routes: `/` (HomeScreen), `/about` (AboutScreen), `/help` (HelpScreen).

### Development Experience
- **HMR (Hot Module Replacement)** — Edit components and see changes instantly without reload.
- **Vitest + Testing Library** — Fast unit and integration tests with realistic DOM interactions.
- **ESLint + Prettier** — Enforced code style and formatting.

## 8. High-Level Workflows

### Project Creation Workflow
1. **Project Lead** copies `apps/appshell/app/` → `apps/{project}/app/`.
2. **Update .env.example** — Set `VITE_APP_NAME` to the project name.
3. **Update config** — Set `current_project` in `.oneticket/config.yml`.
4. **Customize AboutScreen** — Replace AppShell description with project description.
5. **Customize HelpScreen** — Replace AppShell quickstart with project-specific steps.
6. **Push** → CI/CD detects changes, builds, deploys to GitHub Pages.

### Feature Development Workflow
1. **LeadDev** defines feature stories and breaks them into screen tasks (task 0 = skeleton, task 1-N = screens in parallel).
2. **@dev agents** each pick a screen task:
   - Create `screens/{FeatureName}Screen.tsx` (exclusive file ownership).
   - Add hook in `hooks/` if data fetching needed (exclusive file ownership).
   - Add MSW handler in `mocks/handlers.ts` (add to existing file, no new files).
   - Add route in `App.tsx` (sequential task, depends_on all screen tasks).
3. **All parallel tasks complete** → Integration task wires screens into routes.
4. **CI/CD deploys** → GitHub Pages updated automatically.

### Data Fetching Workflow
1. **Screen component** calls `useUsers()` hook.
2. **Hook** uses `useQuery()` to fetch `/api/users`.
3. **React Query** sends request.
4. **MSW** (in dev) intercepts and returns mock data; (in prod) request reaches real API.
5. **Hook** returns `{ data, isLoading, error }`.
6. **Screen** renders UI conditionally on loading/error/success states.
7. **User interaction** triggers `refetch()` if needed.

### Theme Toggle Workflow
1. **User clicks ThemeToggle** → selects light/dark/system.
2. **next-themes** updates `localStorage` and HTML class.
3. **CSS custom properties** update (light values or dark values).
4. **Tailwind classes** reactively apply new colors.
5. **No page reload** — smooth transition.

## 9. Business Rules

1. **File Ownership is Exclusive** — Each file in `screens/`, `hooks/`, `stores/` belongs to exactly one task. No two parallel tasks may modify the same file. Shared files (layout, components, config) are established once in task 0 and never modified.

2. **One Screen per File** — Feature screens are defined in `screens/{FeatureName}Screen.tsx`, not split across files. One file = one feature = one task.

3. **One Hook per Feature** — Data-fetching logic lives in hooks (e.g., `useUsers.ts`). One hook per file. If a feature needs multiple hooks, define multiple files (e.g., `useUsers.ts`, `usePosts.ts`).

4. **MSW is Dev-Only** — MSW is active only in development (`import.meta.env.DEV` guard in `main.tsx`). In production, real API endpoints are called; no code changes needed.

5. **Theme Persists** — Theme preference is persisted in `localStorage` via `next-themes`. User's choice is remembered across sessions.

6. **Routes are Centralized** — All routes are defined in `App.tsx`. Screens do not define their own routes; they are wired in App.tsx by a single task.

7. **Design Tokens are Immutable in Feature Tasks** — Feature tasks use existing Tailwind tokens; they do not add or modify `tailwind.config.ts` or `globals.css`. Design changes require a separate, dedicated task.

8. **Components are Installed Once** — shadcn components are installed during task 0. Feature tasks do not run `shadcn/ui add component`. If a component is missing, it is added during task 0, not during feature work.

9. **No Uncommitted Config** — `.env.example` and all config files are committed. Projects do not require manual setup beyond copying the directory and changing environment variables.

10. **TypeScript Strict Mode** — All TypeScript files are compiled with strict mode enabled. No `any` types without justification.

11. **Hooks Return Stable Objects** — React hooks return memoized objects/functions to prevent unnecessary re-renders. Use `useMemo`, `useCallback` when appropriate.

12. **Query Client is Singleton** — A single `QueryClient` instance is created in `lib/query-client.ts` and reused throughout the app. No per-component client instances.

## 10. Success Criteria

- [ ] `npm run build` completes without errors or warnings.
- [ ] Routes `/`, `/about`, `/help` render correctly with appropriate screens.
- [ ] Header displays app name (left, clickable → `/`) and "About & Help" dropdown (right).
- [ ] "About & Help" dropdown has two options: "About" → `/about`, "Help" → `/help`.
- [ ] ThemeToggle (right side of header) allows switching between system/light/dark modes.
- [ ] Theme changes are reactive without page reload.
- [ ] HomeScreen demonstrates React Query + MSW: calls `useUsers()`, fetches `/api/users`, renders list of users in cards.
- [ ] MSW is active only during development (`import.meta.env.DEV` guard in place).
- [ ] AboutScreen describes AppShell, explains its intent, and links to documentation and GitHub repo.
- [ ] HelpScreen provides 7-step quickstart for reusing AppShell and references runbook.
- [ ] Footer is present but empty, structured for future content.
- [ ] `globals.css` defines CSS custom properties for light and dark modes.
- [ ] `tailwind.config.ts` consumes CSS variables for colors.
- [ ] shadcn/ui components (button, card, dropdown-menu, separator, form) are installed and functional.
- [ ] No inline styles used; all styling via Tailwind classes.
- [ ] File ownership rules are documented and enforced (no parallel modifications to shared files).
- [ ] `npm run test` runs Vitest tests successfully.
- [ ] No `dist/`, `test-results/`, `*.tsbuildinfo` files committed.

## 11. Glossary

### Technical Terms

- **Vite** — Modern JavaScript bundler using ES modules. Provides instant HMR and fast builds. No webpack complexity.

- **React Router DOM** — Client-side routing library. Enables SPA navigation without full page reloads via `<BrowserRouter>`, `<Routes>`, and `<Route>`.

- **Tailwind CSS** — Utility-first CSS framework. Styles are applied via class names; no custom CSS for most use cases.

- **Design Tokens** — Named, reusable values for colors, spacing, typography, etc. Defined in `tailwind.config.ts` and `globals.css`. Enforced consistency across all screens.

- **shadcn/ui** — Collection of Radix UI components styled with Tailwind. Components are copied into the project repo (not node_modules), allowing customization.

- **React Query** — Server state management library. Handles fetching, caching, and synchronization of remote data. Provides hooks like `useQuery()`, `useMutation()`.

- **MSW (Mock Service Worker)** — HTTP request mocking library. Intercepts XHR/Fetch requests and returns mock responses. Dev-only; transparent to production code.

- **Theme** — Light or dark color scheme applied to the entire app. Toggled via `ThemeToggle` component; controlled by CSS custom properties and persisted in localStorage.

- **Screen** — A React component representing a full page or major UI section (e.g., HomeScreen, DashboardScreen). Lives in `screens/` directory.

- **Hook** — Reusable logic encapsulated in a React function (e.g., `useUsers()` for data fetching). Lives in `hooks/` directory.

- **Layout** — Wrapper component that frames all screens with common UI (header, footer, outlet). Established once; never modified by feature tasks.

### Project Structure Terms

- **apps/appshell/docs/** — Documentation directory. Contains product-spec.md, architecture.md, epics, user stories, and runbooks.

- **apps/appshell/app/** — Application source code. Copied by new projects and adapted. Contains `src/`, config files, and build artifacts.

- **src/screens/** — Directory for screen/page components. One component per file; one task per screen.

- **src/hooks/** — Directory for custom React hooks. One hook per file; handles data fetching and business logic.

- **src/mocks/** — Directory for MSW setup and mock data. `browser.ts` initializes worker, `handlers.ts` defines request handlers.

- **src/components/ui/** — Directory for shadcn/ui components. Installed once; never modified by feature tasks.

- **src/styles/globals.css** — Global styles and CSS custom properties for light/dark themes. Modified only by dedicated theme tasks.

- **tailwind.config.ts** — Tailwind configuration file. Defines design tokens (colors, spacing, typography). Modified only by dedicated design tasks.

- **vite.config.ts** — Vite bundler configuration. Frozen in skeleton; not modified by feature tasks.

### Governance Terms

- **Local Skill** — A skill produced and maintained by oneticket-core team. `source: local` in frontmatter.

- **External Skill (Wrapped)** — A skill adapted from external source (e.g., Vercel Labs, shadcn/ui) with full traceability. `source: external` in frontmatter, plus `source_url`, `source_skill`, and `install_native` fields.

- **Skill Frontmatter** — YAML metadata at the top of every skill file defining name, description, version, source, and traceability. Required for APM (Microsoft Agent Package Manager) compatibility.

- **APM (Agent Package Manager)** — Standard for packaging and versioning agent skills. OneTicket follows APM conventions for all skills.

- **File Ownership** — Assignment of exclusive modification rights to a file. Prevents parallel merge conflicts. Example: `screens/HomeScreen.tsx` is owned by HomeScreen task; no other task may modify it.

## 12. Open Questions

1. **Default Theme on First Load** — Should the app detect the user's OS preference on first load, or default to light mode?

2. **Persistence Scope** — Should theme preference be persisted per browser/device or globally per user account? (Currently localStorage per browser.)

3. **Mock Data Volume** — Should mock endpoints return minimal datasets or realistic large datasets to test pagination/virtualization?

4. **Error Boundary Scope** — Should the error boundary cover the entire app or just individual screens?

5. **Form Validation Display** — Should validation errors display inline or below each field? What is the priority order?

6. **Authentication Scaffold** — Should AppShell include a login skeleton (even non-functional) or start completely public?

7. **Icon Library Choice** — `lucide-react` is included; should alternative icon libraries be available?

8. **Component Naming Convention** — Are PascalCase names (e.g., `UserCard`) mandatory for all components?

9. **Hook Testing Strategy** — Should hooks be tested in isolation (Vitest + @testing-library/hooks) or only via component integration tests?

10. **Environment Variable Expansion** — What is the strategy for expanding environment variables in the build? (Currently Vite's `import.meta.env.*`.)
