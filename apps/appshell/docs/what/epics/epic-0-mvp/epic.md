# Epic 0 — AppShell MVP

## Goal

Establish a canonical, conflict-free project skeleton that serves as the foundation for all app projects in oneticket-core. AppShell eliminates merge conflicts through exclusive file ownership, enforces visual consistency via design tokens, and provides exemplary patterns for routing, data fetching, and state management.

## Business Value

- **Zero merge conflicts** — Exclusive file ownership enables true parallel development and task assignment
- **Consistent visual design** — Design tokens and shadcn/ui components prevent visual drift across projects
- **Faster onboarding** — New projects copy AppShell, adapt naming, and begin feature work in < 15 minutes
- **Reusable patterns** — Working examples of routing, forms, React Query, and testing reduce rework

## Scope

This epic covers the creation of AppShell with four core capabilities:

1. **Application skeleton with layout, routing, and theme system** — A production-ready foundation with React Router v6, AppLayout wrapper, and system/light/dark theme toggle
2. **Examples of data fetching with React Query + MSW** — Exemplary hooks using @tanstack/react-query, with Mock Service Worker intercepts for development, enabling seamless transition to real APIs
3. **Design tokens and shadcn/ui components** — Tailwind CSS configuration, CSS custom properties for tokens, and a baseline set of shadcn/ui components for consistent UI
4. **Exclusive file structure for zero merge errors** — Clear ownership semantics where each feature task owns exactly one file or directory, preventing concurrent modifications

## Related User Stories

<!-- Placeholders for user stories — to be filled by @analyst and @po -->

- [./user-stories/us-001-routing-layout-theme.md](./user-stories/us-001-routing-layout-theme.md) — Application skeleton with React Router v6, AppLayout, and theme system
- [./user-stories/us-002-react-query-msw.md](./user-stories/us-002-react-query-msw.md) — Data fetching patterns with @tanstack/react-query and Mock Service Worker
- [./user-stories/us-003-design-tokens-components.md](./user-stories/us-003-design-tokens-components.md) — Design tokens (Tailwind, CSS custom properties) and shadcn/ui baseline components
- [./user-stories/us-004-exclusive-ownership.md](./user-stories/us-004-exclusive-ownership.md) — File structure and exclusive ownership documentation to enable parallel task execution

## Related Slices

- [../../how/slices/slice-1-skeleton-foundation/slice.md](../../how/slices/slice-1-skeleton-foundation/slice.md) — Application skeleton with React Router v6, AppLayout, and theme system
- [../../how/slices/slice-2-home-screen-example/slice.md](../../how/slices/slice-2-home-screen-example/slice.md) — Data fetching example with React Query and MSW
- [../../how/slices/slice-4-theme-system/slice.md](../../how/slices/slice-4-theme-system/slice.md) — Light/dark/system theme system with reactive switching

---

### Success Criteria

- [ ] **Zero merge conflicts** — Multiple parallel tasks can develop different screens without file conflicts
- [ ] **Consistent visual design** — All spacing, colors, and typography derive from tokens; no inline styles or deviations
- [ ] **Exemplary patterns** — MSW, React Query, Zustand convention, and form handling are demonstrated in working code
- [ ] **Fast onboarding** — New projects copy AppShell, adapt naming, and begin feature development in < 15 minutes
- [ ] **Exclusive ownership clear** — Documentation and file structure make it obvious which files are owned exclusively by each task
- [ ] **Theme support** — System/Light/Dark theme toggle works without page reload; persists user preference
