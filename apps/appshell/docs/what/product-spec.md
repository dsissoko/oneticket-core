# AppShell — Product Specification

<!-- SITE_DESCRIPTION: Canonical React + Vite skeleton with design tokens, shadcn/ui, MSW, and observability for parallel-safe OneTicket app development. -->

## Product Overview

**AppShell** is the canonical skeleton and design system reference for all OneTicket application projects. It establishes a shared structure, design language, and development patterns that ensure visual consistency and parallel-safe code organization across the ecosystem.

### Product Vision

Eliminate merge conflicts in parallel development by enforcing exclusive file ownership. Prevent visual inconsistency by constraining design through tokens and shadcn/ui primitives. Provide a living template that developers and AI agents can copy, adapt, and extend safely.

---

## Primary Objectives

### 1. Eliminate Merge Errors in FAN-OUT Development
- **Goal:** Enable multiple agents or developers to work simultaneously without file conflicts
- **Mechanism:** Exclusive file ownership — each screen/route = 1 file, each component = 1 file
- **Guarantee:** No two tasks modify the same file
- **Outcome:** Merge-safe parallel delivery

### 2. Quality Design by Constraint
- **Goal:** Ensure visual and interaction coherence across all derived projects
- **Mechanism:** Design tokens frozen in `tailwind.config.ts` and `styles/globals.css`; shadcn/ui primitives only
- **Guarantee:** Agents cannot introduce off-brand colors, typography, or spacing
- **Outcome:** Production-grade UI without manual review

### 3. Reusable Template for New Projects
- **Goal:** New projects copy `apps/appshell/app/` and adapt
- **Mechanism:** Clear folder structure, documented patterns, working example screens
- **Outcome:** Zero setup time for new projects; fast ramp-up

---

## Core Capabilities — Version 1.0 (epic-0-mvp)

### 1. Skeleton & Layout System
- **Header** (locked after setup) — logo linking to `/`, navigation links, ThemeToggle, responsive mobile menu
- **AppLayout** — sticky header, flexible Outlet, sticky footer; CSS Grid layout
- **Footer** (locked after setup) — N1: copyright + text links; N2: social icon links with Avatar

### 2. Routing
- React Router v6 with `basename` for sub-path deployments (GitHub Pages)
- Screens: `/` (Home), `/about` (About), `/help` (Help), `*` (404)
- Lazy-loaded screens with Suspense fallback

### 3. Data Fetching Pattern
- React Query v5 with centralized `QueryClient`
- Hooks: `useUsers`, `useUser`, `useProfile`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`
- MSW intercepts all `/api/*` calls in all environments (dev, preview, production demo)
- `__ENABLE_MSW__` flag in `vite.config.ts` controls activation independently of build environment

### 4. Theme System
- `next-themes` with system/light/dark preference
- Persisted to localStorage, applied via `.dark` CSS class
- HSL design tokens consumed by Tailwind — single source of truth

### 5. Observability
- `loglevel` with configurable level via `VITE_LOG_LEVEL`
- Optional remote dispatch via `VITE_OTLP_ENDPOINT` (fire-and-forget, JSON format)
- Auto-instrumented: navigation, React Query errors, render errors, global JS errors

### 6. Design System
- shadcn/ui components: Button, Card, DropdownMenu, Separator, Form, Avatar
- `cn()` helper (`lib/utils.ts`) — Tailwind class composition
- lucide-react icons — consistent SVG library
- Geist Variable font via `@fontsource-variable/geist`

---

## File Structure

```
apps/appshell/app/
├── .env.example
├── index.html
├── package.json
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── vitest.config.ts
├── vitest.setup.ts
└── src/
    ├── main.tsx
    ├── styles/globals.css
    ├── components/
    │   ├── layout/
    │   │   ├── AppLayout.tsx
    │   │   ├── Header.tsx
    │   │   └── Footer.tsx
    │   ├── ui/                   ← shadcn components
    │   ├── ThemeToggle.tsx
    │   ├── ErrorBoundary.tsx
    │   └── LoadingIndicator.tsx
    ├── screens/
    │   ├── HomeScreen.tsx
    │   ├── AboutScreen.tsx
    │   ├── HelpScreen.tsx
    │   └── NotFoundScreen.tsx
    ├── hooks/
    │   ├── useUsers.ts
    │   ├── useUser.ts
    │   ├── useProfile.ts
    │   ├── useCreateUser.ts
    │   ├── useUpdateUser.ts
    │   └── useDeleteUser.ts
    ├── api/
    │   ├── client.ts
    │   ├── endpoints.ts
    │   └── types.ts
    ├── mocks/
    │   ├── browser.ts
    │   ├── handlers.ts
    │   └── data/users.ts
    └── lib/
        ├── utils.ts
        ├── query-client.ts
        ├── logger.ts
        └── schemas/.gitkeep
```

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Bundler | Vite | ^5 |
| UI | React + TypeScript | ^18, ^5 |
| Router | React Router DOM | ^6 |
| Styling | Tailwind CSS | ^3 |
| Components | shadcn/ui via @base-ui/react | latest |
| Utilities | clsx + tailwind-merge + class-variance-authority | latest |
| Icons | lucide-react | latest |
| Data fetching | @tanstack/react-query | ^5 |
| Mock API | MSW | ^2 |
| Theme | next-themes | ^0.3 |
| Logging | loglevel + loglevel-plugin-remote | ^1.9, ^0.6 |
| Testing | Vitest + @testing-library/react + jsdom | ^1 |

---

## Quick Start

```bash
# Copy skeleton to your project
cp -r apps/appshell/app apps/{your-project}/app

# Install dependencies
cd apps/{your-project}/app
npm install

# Start dev server
npm run dev        # http://localhost:5173

# Build
npm run build

# Run tests
npm run test
```

---

## Agent Development Rules

When using AI agents (OneTicket FAN-OUT pipeline) to develop screens:

1. **One screen = One task** — never assign two screens to the same task
2. **Lock shared components** — Header, Footer, AppLayout are never modified in parallel tasks
3. **`screens/` convention** — all route components live in `src/screens/`, named `{Feature}Screen.tsx`
4. **Always use `@/` imports** — never use relative `../` across directories
5. **Always use shadcn tokens** — never hardcode colors; use `bg-background`, `text-foreground`, etc.
6. **Always use `<Link to>` for internal navigation** — never `<a href>` for app routes

---

## Roadmap

| Epic | Subject | Status |
|---|---|---|
| [epic-0-mvp](epics/epic-0-mvp/epic.md) | Skeleton foundation | ✅ Delivered |
| [epic-1-auth0](epics/epic-1-auth0/epic.md) | Auth0 authentication | 🔲 Planned |
| [epic-2-testing](epics/epic-2-testing/epic.md) | Test coverage | ✅ Delivered |
| [epic-3-demo](epics/epic-3-demo/epic.md) | Demo screen with tabbed patterns | ✅ Delivered |
| [epic-4-appshell-reuse](epics/epic-4-appshell-reuse/epic.md) | AppShell reuse — new project init | 🔲 Planned |
| [epic-5-realtime](epics/epic-5-realtime/epic.md) | SSE streaming pattern | ✅ Delivered |

---

## Acceptance Criteria — Version 1.0

- [x] `apps/appshell/app/` exists with complete React + Vite + TypeScript setup
- [x] `npm install && npm run dev` starts without errors on `http://localhost:5173`
- [x] `npm run build` produces `dist/` with no TypeScript errors
- [x] App deployed on GitHub Pages PR preview and production
- [x] Header with logo, navigation (Home, About, Help), ThemeToggle
- [x] Footer with N1 (copyright + links) and N2 (social icons with Avatar)
- [x] Theme switch (system/light/dark) reactive without page reload
- [x] React Query hooks for users CRUD available
- [x] MSW active in all environments — no backend required
- [x] Logger with configurable level (`VITE_LOG_LEVEL`) and optional remote dispatch (`VITE_OTLP_ENDPOINT`)
- [x] Global error boundary — no silent failures (`window.onerror`, `unhandledrejection`, `ErrorBoundary`)
- [x] Auto-instrumented: navigation, React Query errors, render errors
