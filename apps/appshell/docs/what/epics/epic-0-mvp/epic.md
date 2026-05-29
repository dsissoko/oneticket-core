# Epic 0 — AppShell MVP

## Goal

Establish the canonical React + Vite skeleton and design system reference for all OneTicket applications, enabling parallel-safe development through exclusive file ownership and design constraint.

## Business Value

- **Eliminate merge conflicts** in FAN-OUT parallel development (6+ agents working simultaneously)
- **Quality design by constraint** — enforce visual consistency through design tokens and Radix UI primitives without manual review
- **Accelerate onboarding** — new projects copy AppShell skeleton in <10 minutes and have working patterns from day one
- **Enable AI-safe architecture** — exclusive file ownership prevents conflicts when multiple agents implement features in parallel

## Scope

### Setup & Deployment of Skeleton
- Directory structure with exclusive file ownership model (one component = one file, one page = one file)
- Vite configuration with dev server, build, and preview modes
- TypeScript strict mode enabled with proper tsconfig
- Header, Footer, AppLayout locked components
- Three demo routes: `/`, `/about`, `/help`

### Pattern Demonstrations
- **Routing:** React Router v6 setup with lazy route loading and 404 error boundary
- **Data Fetching:** React Query integration + MSW (Mock Service Worker) for API mocking
  - Query hooks: `useUsers()`, `useUser(id)`, `useProfile()`
  - Mutation hooks: `useCreateUser()`, `useUpdateUser()`, `useDeleteUser()`
  - MSW handlers for GET/POST/PUT/DELETE endpoints
- **Forms:** React Hook Form + Zod validation with FormField component wrapper
- **Theme Toggle:** next-themes integration with light/dark/system modes, localStorage persistence
- **State Management:** Zustand stores for `useAuthStore` and `useAppStore`
- **Authentication:** Mock login endpoint with JWT-like token, ProtectedRoute wrapper

### Design System & Tokens
- Tailwind CSS configuration with custom color palette (primary, secondary, accent, destructive, muted, background, foreground)
- Typography scale, spacing (4px baseline), border radius, shadows, transitions
- shadcn/ui primitives (Button, Input, Card, Badge, Alert, etc.)
- Global styles with CSS variables for theme switching
- Accessibility baseline (focus states, color contrast ≥4.5:1)

### Testing Foundation
- Vitest setup with React Testing Library
- Component unit tests for Header, Footer, AppLayout
- Integration tests for routes and authentication
- MSW handlers in test mode
- Snapshot tests for design tokens

### Documentation of Usage
- README.md explaining purpose and OneTicket vision
- Step-by-step guide: how to copy `apps/appshell/app/` to new projects
- Adaptation instructions: updating package.json, routes, theme tokens
- Code comments explaining non-obvious patterns
- TypeScript JSDoc on public functions

## Related User Stories

<!-- @analyst fills this section — write filename only, no relative path, no ../
     US files are always in user-stories/ subfolder — never flat in the epic directory
     The build script resolves the correct path automatically.
     Example: [US-001 — Skeleton Setup](user-stories/us-001-skeleton-setup.md) -->

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](../../../how/slices/slice-1-skeleton-foundation/slice.md) -->
