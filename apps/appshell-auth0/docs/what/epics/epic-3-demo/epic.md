# Epic 3 — Demo Screen

## Goal

Provide an interactive demonstration screen that shows AppShell patterns in action, using shadcn/ui Tabs for navigation between themes. Each tab is self-contained and demonstrates one pattern.

## Status

🔲 Planned

## Business Value

- **Living documentation** — patterns are shown in action, not just described
- **shadcn Tabs showcase** — canonical usage of tabbed navigation from the design system
- **Onboarding accelerator** — developers understand available patterns at a glance
- **Dogfooding** — AppShell uses its own components and patterns in the demo

## Scope

- New route `/demo` — `DemoScreen.tsx` with shadcn Tabs
- One tab per pattern: Data Fetching, Forms, Logger, Theme, Auth (placeholder)
- `shadcn/ui Tabs` component installed
- `react-hook-form` + `zod` demonstrated in Forms tab
- Logger tab: instructions to open console + buttons triggering each log level
- Auth tab: placeholder linking to epic-1-auth0

## New Components Required

- `DemoScreen.tsx` — tabbed demo screen at `/demo`
- shadcn `Tabs` component added to `components/ui/`
- Form example using `react-hook-form` + `zod` + shadcn `Form`

## Related User Stories

- [US-001 — Demo Screen with Tabs](user-stories/us-001-demo-screen.md)
- [US-002 — Tab: Data Fetching](user-stories/us-002-tab-data-fetching.md)
- [US-003 — Tab: Forms](user-stories/us-003-tab-forms.md)
- [US-004 — Tab: Logger](user-stories/us-004-tab-logger.md)
- [US-005 — Tab: Theme](user-stories/us-005-tab-theme.md)
- [US-006 — Tab: Auth (placeholder)](user-stories/us-006-tab-auth.md)
