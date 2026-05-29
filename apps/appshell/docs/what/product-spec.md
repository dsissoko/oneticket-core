---
title: AppShell Product Specification
---

# AppShell Product Specification

<!-- SITE_DESCRIPTION: Reference skeleton app for oneticket projects with exclusive file ownership, design constraints, and zero merge errors. -->

## 1. Vision

AppShell is the **reference skeleton application** for all app projects in oneticket-core. It establishes a canonical project structure that eliminates merge conflicts through exclusive file ownership, enforces visual consistency through design token constraints, and provides a production-ready foundation with exemplary patterns for data fetching, forms, state management, and testing.

Every new project begins by copying `apps/appshell/app/` and adapting its content.

## 2. Users and Actors

- **Project Leads** — Initialize new projects by copying AppShell and adapting it to their domain
- **Frontend Developers** — Implement feature screens following AppShell patterns and conventions
- **Design System Team** — Maintain design tokens, shadcn component library, and visual guidelines
- **OneTicket Agents** — Execute tasks in parallel on screens, hooks, and mocks with zero merge conflicts

## 3. Problems to Solve

1. **Merge conflicts in FAN-OUT execution** — Parallel tasks often modify the same files (e.g., `App.tsx`, `package.json`, CSS), causing conflicts and integration delays
2. **Visual inconsistency across projects** — Without constraints, agents produce varied UI patterns, spacing, typography, and color schemes
3. **Repeating configuration patterns** — Every project rebuilds the same routing, theme, form, and data-fetching setup
4. **Unclear ownership semantics** — Developers don't know which files can be modified in parallel and which must be sequential

## 4. Product Goals

1. **Eliminate merge errors through exclusive file ownership** — Each developer task owns exactly one file or directory (`screens/UserListScreen.tsx`, `hooks/useUsers.ts`, `mocks/handlers.ts`), enabling true parallelization
2. **Enforce visual quality by design constraint** — Design tokens, Tailwind configuration, and shadcn component primitives prevent agents from diverging visually
3. **Provide exemplary patterns** — MSW integration, React Query setup, Zustand convention, form handling, and testing are demonstrated in the skeleton
4. **Reduce project setup time** — Copy once, adapt naming, and begin feature development immediately

## 5. Out of Scope

- **Backend implementation** — AppShell focuses on frontend only
- **Production-grade authentication** — Skeleton assumes mock API; real auth integrates at task level
- **Deployment infrastructure** — CI/CD is handled externally; AppShell assumes a `VITE_BASE_PATH` env var
- **Custom component library** — shadcn/ui provides the component baseline; projects extend it, not replace it

## 6. Business Concepts

### Screen
A single-file React component under `src/screens/` representing a route and entire view. One screen = one file = exclusive ownership. Examples: `HomeScreen.tsx`, `UserListScreen.tsx`, `SettingsScreen.tsx`.

### Layout
Shared structure (Header, Footer, Outlet) that wraps all screens. Defined once in `AppLayout.tsx`, never modified by feature tasks.

### Design Tokens
CSS custom properties (colors, spacing, typography) defined in `tailwind.config.ts` and `src/styles/globals.css`. All visual decisions inherit from tokens, preventing drift.

### Exclusive Ownership
A development task is assigned exactly one file or directory. No two parallel tasks modify the same file. This eliminates merge conflicts entirely.

### Mock API
MSW (Mock Service Worker) intercepts fetch calls in development and returns mock JSON. In production, the same code fetches from real endpoints without modification.

## 7. Product Capabilities

| Capability | Implementation | Status |
|---|---|---|
| **Routing** | React Router v6 — nested layouts, dynamic segments | ✅ Exemplified |
| **Styling** | Tailwind CSS + design tokens — no inline styles | ✅ Enforced |
| **Components** | shadcn/ui via Radix — one-time setup, never parallel-modified | ✅ Included |
| **Forms** | React Hook Form + Zod schema validation | ✅ Exemplified |
| **Data Fetching** | @tanstack/react-query + MSW mocking | ✅ Exemplified |
| **State Management** | Zustand convention — optional, not required in skeleton | ✅ Available |
| **Icons** | lucide-react — SVG icons, no emoji | ✅ Included |
| **Theme Toggle** | System/Light/Dark — reactive, no page reload | ✅ Exemplified |
| **Testing** | Vitest + @testing-library — unit and integration | ✅ Setup ready |

## 8. High-Level Workflows

### Workflow: Initialize a New Project
1. Copy `apps/appshell/app/` to `apps/{project}/app/`
2. Set `VITE_APP_NAME` in `.env.example`
3. Update `current_project` in `.oneticket/config.yml`
4. Edit `AboutScreen.tsx` with project description
5. Edit `HelpScreen.tsx` with project quickstart
6. Add feature screens in `src/screens/` — one per file, one task per screen
7. Commit and push — deployment is automatic

### Workflow: Fetch Data with React Query + MSW
1. Create a hook in `src/hooks/useXxx.ts` using `useQuery` and a fetch endpoint
2. Add a mock handler in `src/mocks/handlers.ts` to intercept the endpoint
3. Use the hook in a screen component — MSW returns mock data in dev, real API in prod
4. React Query caches and manages async state

### Workflow: Implement a Feature Screen
1. Create `src/screens/FeatureScreen.tsx`
2. Import and use the relevant hooks (e.g., `useUsers`, `usePosts`)
3. Structure the screen with Header, Card components, and Tailwind spacing
4. Test with Vitest + React Testing Library
5. The file is yours exclusively — no conflicts with other tasks

### Workflow: Modify Visual Design
1. Edit `tailwind.config.ts` or `src/styles/globals.css` to adjust tokens
2. All components consuming those tokens update automatically
3. This is a **single-task file** — coordinate across team before changes

## 9. Business Rules

1. **Exclusive Ownership Rule** — Each feature task owns exactly one file or directory. Modification rights are explicit.
2. **Token Inheritance Rule** — All styling uses Tailwind classes and CSS custom properties; inline styles are forbidden.
3. **Component Constraint Rule** — All UI elements come from shadcn/ui + Tailwind; custom HTML is minimal.
4. **MSW Convention Rule** — Mock data is defined in `src/mocks/data/` and returned via `src/mocks/handlers.ts`; no hardcoded fixtures in components.
5. **Hook Convention Rule** — All async data fetching lives in `src/hooks/`; components only call hooks, never fetch directly.
6. **Screen Isolation Rule** — Screens in `src/screens/` are route-bound and isolated; cross-screen state uses Zustand stores.
7. **Single Setup Rule** — shadcn components, design tokens, and theme system are installed once (task 0) and frozen; feature tasks do not modify them.

## 10. Success Criteria

- [ ] **Zero merge conflicts in parallel screen development** — Each screen is independent; multiple agents can develop screens simultaneously without conflicts
- [ ] **Consistent visual design across all screens** — All spacing, colors, and typography derive from tokens; no visual drift
- [ ] **Exemplary code patterns** — New projects copy working examples for routing, forms, data fetching, and state management
- [ ] **Fast onboarding** — New developers copy AppShell, rename one project, and begin feature work in < 15 minutes
- [ ] **Testability** — Every hook and screen component has isolated, runnable tests using Vitest + React Testing Library
- [ ] **Theme support** — System/Light/Dark theme toggle works out of the box; no production code changes needed

## 11. Open Questions

1. **How are breaking changes to the skeleton handled?** — Once AppShell is stable, should we version it and provide a migration path for existing projects?
2. **Should projects customize Tailwind tokens per-project, or use the skeleton tokens globally?** — Define the boundaries of design token ownership.
3. **How are shadcn components upgraded?** — Is there a centralized shadcn version, or does each project manage its own component versions?
4. **Should MSW mocks be kept in production builds for demo purposes?** — Or is MSW strictly dev-only?
