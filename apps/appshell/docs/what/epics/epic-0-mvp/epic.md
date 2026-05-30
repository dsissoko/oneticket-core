# Epic 0 — AppShell MVP

## Goal

Establish the canonical React + Vite skeleton and design system reference for all OneTicket applications, enabling parallel-safe development through exclusive file ownership and design constraint.

## Status

✅ Delivered — AppShell v1.0 is live at https://dsissoko.github.io/oneticket-core/appshell/app/

## Business Value

- **Eliminate merge conflicts** in FAN-OUT parallel development — exclusive file ownership prevents conflicts when multiple agents implement features in parallel
- **Quality design by constraint** — enforce visual consistency through HSL design tokens and shadcn/ui primitives without manual review
- **Accelerate onboarding** — new projects copy AppShell skeleton and have working patterns from day one
- **Observable by default** — loglevel + optional OTLP remote dispatch built in from the start

## Scope — Delivered

### Skeleton & Layout
- Directory structure with exclusive file ownership model (one screen = one file, one component = one file)
- Vite + TypeScript strict mode, `@/` path alias, `vite/client` types
- `main.tsx` entry point with global error boundary, ThemeProvider, QueryClientProvider, BrowserRouter with `basename`
- Header, Footer, AppLayout locked components — shadcn tokens only, no hardcoded colors
- Four screens: `/` (Home), `/about` (About), `/help` (Help), `*` (404)

### Pattern Demonstrations
- **Routing:** React Router v6 with lazy loading, Suspense, 404 fallback, `basename` for sub-path deployments
- **Data Fetching:** React Query v5 + MSW — `useUsers`, `useUser`, `useProfile`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`
- **Theme:** next-themes with system/light/dark, `.dark` CSS class, HSL tokens, persisted to localStorage
- **Observability:** loglevel with configurable level + optional remote dispatch (OTLP-compatible)

### Design System
- Tailwind CSS with frozen HSL design tokens — all colors via `hsl(var(--token))`
- shadcn/ui components: Button, Card, DropdownMenu, Separator, Form, Avatar
- lucide-react icons, Geist Variable font, tw-animate-css
- `cn()` helper (clsx + tailwind-merge)

### MSW Strategy
- `__ENABLE_MSW__: true` — always active, independent of build environment
- `onUnhandledRequest: 'bypass'` — external requests not intercepted
- Canonical structure: `mocks/browser.ts` + `mocks/handlers.ts` + `mocks/data/users.ts`

### Sub-path Deployment (GitHub Pages)
- `VITE_BASE_PATH` injected by CI
- `BrowserRouter basename={import.meta.env.BASE_URL}`
- MSW SW url using `import.meta.env.BASE_URL`
- `mockServiceWorker.js` committed in `public/`

## Related User Stories

- [US-001 — Skeleton Setup](user-stories/us-001-setup.md)
- [US-002 — Layout Structure](user-stories/us-002-layout.md)
- [US-003 — Routing Setup](user-stories/us-003-routing.md)
- [US-004 — Data Fetching Pattern](user-stories/us-004-data-fetching.md)
- [US-005 — Theme Toggle](user-stories/us-005-theme-toggle.md)
- [US-006 — Documentation](user-stories/us-006-documentation.md)
- [US-007 — Observability](user-stories/us-007-observability.md)
