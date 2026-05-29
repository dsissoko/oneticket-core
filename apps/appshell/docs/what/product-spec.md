# Product Specification — AppShell

<!-- SITE_DESCRIPTION: Reference skeleton for all app projects in oneticket-core. Eliminates merge errors and enforces design quality by constraint. (max 160 chars) -->

## 1. Vision

Establish a **reference skeleton** for all React/Vite app projects in oneticket-core that eliminates merge conflicts in parallel task pipelines and enforces consistent visual quality through design constraints. AppShell serves as the canonical starting point for new projects: copy it, adapt it, and build on it with zero structural friction and maximum design consistency.

## 2. Users and Actors

- **Product Owner (`@po`)** — Defines new app projects based on AppShell. Commands the skeleton's reuse in new feature areas.
- **Lead Developer (`@leaddev`)** — Decomposes feature work into parallel tasks based on AppShell's exclusive file ownership model. Ensures parallel tasks never touch the same file.
- **Developer Agents** — Implement feature screens, hooks, and data layers in isolation. Work in `screens/`, `hooks/`, and `mocks/` without conflicts.
- **Design System** — The skeleton itself is the design system: tokens, primitives, and layout rules prevent visual inconsistency and guide agent decisions.

## 3. Problems to Solve

1. **Merge Errors in FAN-OUT Pipelines** — When multiple parallel tasks modify shared files (e.g., `App.tsx`, `globals.css`), merge conflicts block delivery. AppShell's file ownership structure prevents this: each feature task owns its own screen file, hook file, and mock handler — zero shared edits.

2. **Visual Inconsistency Across Projects** — Without a reference design system, agents produce apps with mismatched colors, typography, spacing, and component styles. Visual quality degrades and brand coherence is lost.

3. **Slow Project Onboarding** — Creating a new app requires manual setup: routing, theme integration, layout structure, form patterns, MSW setup. Developers repeat boilerplate work across projects.

4. **Unclear Conventions for Agents** — Agents lack clear rules for where to place components, how to name hooks, what styling libraries to use, how to fetch data. This leads to inconsistent project structures.

## 4. Product Goals

1. **Eliminate merge conflicts via exclusive file ownership** — Establish a file structure where each parallel task owns its own files (screens, hooks, handlers) and never modifies shared infrastructure files.

2. **Enforce design quality by constraint** — Define design tokens (colors, spacing, typography) in a central location (`tailwind.config.ts`, `globals.css`) that all screens and components consume. Visual inconsistency becomes impossible.

3. **Provide a reusable, copy-paste skeleton** — Any new project starts by copying `apps/appshell/app/` and adapting `.env`, `AboutScreen`, and `HelpScreen`. No manual setup required.

4. **Establish clear conventions for parallel agents** — Document where features are placed (screens), how data is fetched (React Query + MSW), what components are available (shadcn), and how global state is managed (Zustand, available but unused in skeleton).

5. **Support rapid iteration with next-generation tools** — Vite for fast dev/build, React Router for lightweight routing, shadcn/ui for accessible primitives, Tailwind CSS for utility-first styling, MSW for mock APIs in dev.

## 5. Out of Scope

- **Multi-app backend/API infrastructure** — AppShell focuses on frontend structure only. Backend architecture is separate.
- **Deployment automation** — CI/CD pipelines exist; AppShell itself is not a deployment target but a source template.
- **Advanced state management** — Zustand is available but not integrated into the skeleton. Apps add it only if needed.
- **End-to-end testing framework** — AppShell includes unit test setup (Vitest); E2E tests are app-specific.
- **Storybook or component documentation** — No component library documentation; shadcn docs are external references.
- **Type-safe API clients** — Apps generate API clients as needed (e.g., tRPC, OpenAPI codegen); not skeleton-provided.

## 6. Business Concepts

- **AppShell** — The reference skeleton: a minimal React/Vite app with routing, layout, theme, and data-fetching patterns. Copied, not deployed directly.

- **Screen** — A top-level feature view in `screens/`. One screen file = one route. Exclusive ownership prevents parallel task conflicts. Examples: `HomeScreen`, `AboutScreen`, `HelpScreen`.

- **Hook** — A custom React hook in `hooks/` that encapsulates business logic or data fetching. Examples: `useUsers()`, `useTodos()`. One hook = one async operation or computation.

- **Design Token** — A centralized design decision stored in CSS variables or Tailwind config. Colors, spacing, typography, shadows. Consuming these tokens ensures visual consistency.

- **Component Primitive** — A shadcn/ui component installed once at setup time. Examples: Button, Card, Form, Dropdown Menu. Never modified in parallel tasks — installed once, reused everywhere.

- **Layout** — The structural container for all screens: `AppLayout` wraps `<Outlet />` and defines the Header, main content area, and Footer. Shared by all screens.

- **Theme** — Light, dark, and system-aware colors and spacing. Reactive: toggled without page reload via CSS custom properties and Tailwind's dark mode.

- **File Ownership** — A file is owned exclusively by a single task. Shared infrastructure (config, layout, tokens) is owned by a setup task (task 0). Feature screens are owned by individual tasks.

- **Exclusive File Ownership** — The principle that no two parallel tasks modify the same file. Enforced by the skeleton's directory structure and naming conventions.

## 7. Product Capabilities

### Layout & Navigation
- **AppLayout Component** — A shared wrapper providing Header (top), Outlet (main content), and Footer (bottom).
- **Header Component** — App name (left, clickable → `/`), "About & Help" dropdown (right), ThemeToggle (far right).
- **Footer Component** — Empty but structured for future content. No default content.
- **React Router Integration** — Three baseline routes: `/` (HomeScreen), `/about` (AboutScreen), `/help` (HelpScreen). New features add screens in `screens/` and routes in `App.tsx`.

### Theme & Design Tokens
- **CSS Custom Properties** — Light and dark mode colors defined in `globals.css`. Variables: `--background`, `--foreground`, `--accent`, `--border`, `--muted-background`, `--muted-foreground`.
- **Tailwind Config** — Consumes CSS variables; defines spacing scale, typography scale, and color palette.
- **Reactive Theme Toggle** — System, light, dark modes. Switching is instant (no reload) via CSS class on `<html>` element.
- **Dark Mode Support** — Automatic based on system preference or user selection. No page reload required.

### Component Library
- **shadcn/ui Components** — Pre-installed primitives (Button, Card, Dropdown Menu, Separator, Form, Input, Label, etc.). Radix UI-based, accessible, customizable via Tailwind.
- **Icon Library** — lucide-react for SVG icons. Consistent icon set across all apps.
- **Form Integration** — React Hook Form + Zod for type-safe forms with validation. Example form in `components/ui/form.tsx`.

### Data Fetching & Mocking
- **React Query (@tanstack/react-query)** — Handles data fetching, caching, and synchronization. DevTools included.
- **MSW (Mock Service Worker)** — Mocks API responses in development. Activated via `import.meta.env.DEV` guard. Zero production overhead.
- **Example Hook** — `useUsers()` demonstrates the pattern: React Query → fetch('/api/users') → MSW intercepts and returns mock data.
- **Mock Data** — Stored in `mocks/data/`. Example: `users.ts` contains `[{ id: 1, name: 'Alice' }, ...]`.

### Styling & Utility
- **Tailwind CSS** — Utility-first styling. No inline styles. All spacing, colors, and sizing via Tailwind classes.
- **tailwind-merge + clsx** — Utilities in `lib/utils.ts` for safe class composition. Prevents conflicting Tailwind rules.
- **postcss** — Processes CSS, applies Tailwind directives.

### Developer Experience
- **Vite** — Lightning-fast dev server and production build.
- **TypeScript** — Full type safety across all code.
- **Vitest** — Fast unit test runner. Compatible with React Testing Library.
- **HMR (Hot Module Replacement)** — Changes reflect instantly during development.

### Screen Content

#### HomeScreen
- Example of data fetching via `useUsers()` → React Query → MSW.
- Displays a list of users in Card components.
- Demonstrates the happy-path pattern for all feature screens.

#### AboutScreen
- Describes AppShell and its purpose.
- "AppShell is the reference skeleton for all app projects in oneticket-core. Copy it, adapt it, build on it."
- Link to generated documentation site: `https://dsissoko.github.io/oneticket-core/appshell/docs/`
- Link to GitHub repo: `https://github.com/dsissoko/oneticket-core`

#### HelpScreen
- 7-step quickstart for reusing AppShell in a new project.
- Step 1: Copy `apps/appshell/app/` → `apps/{your-project}/app/`
- Step 2: Set `VITE_APP_NAME` in `.env.example`
- Step 3: Update `current_project` in `.oneticket/config.yml`
- Step 4: Update `AboutScreen` with your project description
- Step 5: Update `HelpScreen` with your project quickstart
- Step 6: Add feature screens in `screens/` — one screen per file
- Step 7: Push → deploy is automatic via GitHub Actions
- Link to detailed runbook: `.oneticket/docs/run/appshell-reuse.md`

## 8. High-Level Workflows

### Workflow 1: Reuse AppShell for a New Project

1. **User (PO) requests a new app** based on AppShell (e.g., "Create a Todo app").
2. **@leaddev copies** `apps/appshell/app/` → `apps/todo/app/`.
3. **@leaddev configures** `.env.example`, `current_project`, and `.oneticket/config.yml`.
4. **@leaddev decomposes** the feature work into parallel tasks:
   - Task 0 (setup): Install shadcn components, configure tokens, update AboutScreen/HelpScreen.
   - Task 1 (parallel): `TodoListScreen` + `useTodos()` hook + mock handlers.
   - Task 2 (parallel): `TodoDetailScreen` + related hooks.
   - Task N (parallel): Additional features, each owning its own screen file.
5. **@dev executes** Task 0 (sequential setup).
6. **Parallel agents execute** Tasks 1-N independently, each modifying only their own screen, hook, and handler files.
7. **Integration task** wires all screens into `App.tsx` routes.
8. **@user validates** and merges.

### Workflow 2: Implement a Feature in an AppShell-Based App

1. **Feature is assigned** to an agent (e.g., "Implement user profile screen").
2. **Agent creates** `screens/ProfileScreen.tsx` (exclusive ownership).
3. **Agent creates** `hooks/useProfile.ts` (exclusive ownership).
4. **Agent creates** mock handlers in `mocks/handlers.ts` (if new API endpoint).
5. **Agent wires** the route in `App.tsx` → `/profile` → `<ProfileScreen />`.
6. **Agent tests** locally; MSW intercepts API calls.
7. **Agent commits** and opens PR. No merge conflicts (exclusive file ownership).

### Workflow 3: Deploy an AppShell-Based App

1. **Agent pushes** to `main`.
2. **GitHub Actions workflow** (`docs-site-github-pages.yml`) triggers automatically.
3. **Build step** runs `npm run build` → Vite produces `dist/`.
4. **Deploy step** publishes docs and app to GitHub Pages.
5. **App is live** at `https://{org}.github.io/{repo}/{project}/`.

## 9. Business Rules

1. **File Ownership is Exclusive** — Each file is owned by at most one task. Shared infrastructure (config, layout, tokens) is set up once; feature files are owned by individual feature tasks. No two parallel tasks modify the same file.

2. **Screens are Modular** — Each screen is a single `.tsx` file in `screens/`. One screen per file, one file per feature, no exceptions. Screens are never modified by other tasks.

3. **Hooks Encapsulate Logic** — Custom hooks in `hooks/` handle data fetching, business logic, and computations. One hook per data source or operation. Hooks are consumed by screens without modification.

4. **Design Tokens Are Immutable During Feature Work** — Design tokens (colors, spacing, typography) are defined once in task 0. Feature tasks consume tokens but never modify them. Consistency is guaranteed.

5. **MSW is Dev-Only** — MSW handlers are activated in development only (`import.meta.env.DEV`). Production apps use real API endpoints without code changes.

6. **React Query is the Data Fetching Pattern** — All async data fetching goes through React Query (`@tanstack/react-query`). No ad-hoc `fetch()` calls or `axios`. Caching and synchronization are automatic.

7. **Components are shadcn** — All UI components come from shadcn/ui (installed via CLI). No custom component libraries, no ad-hoc inline components, no Material-UI. Consistency is enforced.

8. **Styling is Tailwind Only** — No inline styles, no CSS-in-JS, no CSS modules. All styling via Tailwind utility classes. Spacing, colors, and sizing come from design tokens.

9. **Icons are lucide-react** — All icons come from lucide-react. No emoji, no text symbols, no custom SVGs (unless exceptional). Consistent icon set across all apps.

10. **Route Additions are Additive** — New features add routes to `App.tsx` without modifying existing routes. Route definitions are simple: `<Route path="/feature" element={<FeatureScreen />} />`.

11. **Theme Toggle is System-Aware** — The theme toggle presents 3 options: system (follows OS preference), light, dark. Switching is instant via CSS class mutation (no reload). Preference is persisted in localStorage.

12. **AboutScreen and HelpScreen are Customizable** — Each app customizes `AboutScreen` (description) and `HelpScreen` (quickstart). The template content is replaced, not appended.

13. **Footer Remains Empty in Skeleton** — The Footer component is present but contains no content in the skeleton. Apps add content as needed.

14. **Parallel Task Isolation** — Parallel tasks must not import or depend on each other's files. Isolation prevents undeclared dependencies and keeps the task graph clean.

## 10. Success Criteria

1. ✅ **Skeleton Exists and is Deployable** — `npm run build` succeeds. No errors or warnings.

2. ✅ **Routes Work** — `/`, `/about`, `/help` render without errors. Navigation works.

3. ✅ **Header is Correct** — App name (left, clickable → `/`), "About & Help" dropdown (right), ThemeToggle (far right). No "Home" link.

4. ✅ **Footer is Structured** — Footer component exists, is empty, and is ready for content.

5. ✅ **Layout is Responsive** — Header spans full width, content area is centered and readable, footer spans full width. No horizontal scrolling on mobile.

6. ✅ **Theme Toggle Works** — Switching between system/light/dark is instant. No page reload. Preference persists in localStorage.

7. ✅ **HomeScreen Demonstrates Data Fetching** — `useUsers()` hook fetches users via React Query. MSW intercepts in dev and returns mock users. Users are rendered in Cards.

8. ✅ **AboutScreen has Content** — Describes AppShell, links to docs and GitHub repo.

9. ✅ **HelpScreen has Quickstart** — 7-step reuse guide + link to runbook.

10. ✅ **Design Tokens are Centralized** — Colors, spacing, and typography are defined in `globals.css` (CSS variables) and `tailwind.config.ts`. All components consume them.

11. ✅ **shadcn Components are Installed** — Button, Card, Dropdown Menu, Separator, Form, Input, Label present in `components/ui/`.

12. ✅ **MSW is Active in Dev Only** — `import.meta.env.DEV` guard in `main.tsx`. Production builds have zero MSW overhead.

13. ✅ **No Shared File Edits** — The file structure enables parallel tasks. Each feature can add a screen, hook, and handler without conflicting.

14. ✅ **Docs Are Generated** — AppShell docs are published to GitHub Pages at `https://dsissoko.github.io/oneticket-core/appshell/docs/`.

15. ✅ **Runbook Exists** — `.oneticket/docs/run/appshell-reuse.md` provides step-by-step reuse instructions.

16. ✅ **Skill `oneticket-appshell` Exists** — Documents the skeleton structure, conventions, and reuse patterns.

## 11. Open Questions

1. **Should AppShell include an example feature beyond Home?** — The issue describes HomeScreen + AboutScreen + HelpScreen. Should there be an example feature screen (e.g., TodoListScreen) to showcase hooks and data fetching patterns?

2. **How should parallel task ordering work in @leaddev's decomposition?** — Task 0 (setup) is sequential. All other tasks are parallel. Should `App.tsx` route integration happen in task 0 or as a separate final task?

3. **Should design tokens include a "secondary" and "tertiary" color beyond accent?** — Current plan: background, foreground, accent, border, muted-background, muted-foreground. Should we add more color roles for complex UIs?

4. **Should Zustand store initialization be included in skeleton?** — Zustand is available but currently unused. Should there be a `stores/` directory with a `.gitkeep` and an example store?

5. **Should AppShell include a "Not Found" (404) screen?** — No mention in issue. Should there be a catch-all route → NotFoundScreen?

6. **How should authentication be handled in AppShell-based apps?** — AppShell has no auth. Apps will need auth. Should there be a pattern/example?

7. **Should the runbook be auto-generated or hand-written?** — Current plan is hand-written. Should it be templated in `.oneticket/templates/`?

8. **Should AppShell support locale/i18n?** — Current plan has no i18n. Should there be a foundation for multi-language apps?

9. **Should ErrorBoundary be included?** — React error boundaries are important. Should AppShell include a top-level error boundary in `main.tsx`?

10. **Should there be a README in `apps/appshell/app/`?** — For developers who copy the skeleton, a README in the app directory might be helpful as an inline reference.
