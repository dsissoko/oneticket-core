# Slice 3 — About and Help Screens

## Goal

Implement About and Help screens to provide application context and guidance to users. The About screen describes AppShell as the reference skeleton for oneticket-core projects, with links to documentation and repository. The Help screen offers a quickstart guide with 7 steps for reusing AppShell in new projects.

## Related Epics

- [../../../what/epics/epic-0-mvp/epic.md](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [../../../what/epics/epic-0-mvp/user-stories/us-001-skeleton-setup.md](../../../what/epics/epic-0-mvp/user-stories/us-001-skeleton-setup.md)
- [../../../what/epics/epic-0-mvp/user-stories/us-002-design-tokens.md](../../../what/epics/epic-0-mvp/user-stories/us-002-design-tokens.md)
- [../../../what/epics/epic-0-mvp/user-stories/us-003-exclusive-ownership.md](../../../what/epics/epic-0-mvp/user-stories/us-003-exclusive-ownership.md)

## Impacted Components

- `src/screens/AboutScreen.tsx` — New screen describing AppShell, its purpose, documentation, and repository links
- `src/screens/HelpScreen.tsx` — New screen with quickstart guide for reusing AppShell in new projects

## Interfaces

### AboutScreen.tsx

```tsx
export default function AboutScreen(): JSX.Element
```

**Layout:**
- `PageHeader` — Title "About AppShell"
- `Card` container with Tailwind classes — Describes AppShell as the reference skeleton for oneticket-core
- Content sections:
  - **What is AppShell?** — Overview of AppShell's role
  - **Documentation** — Link to https://dsissoko.github.io/oneticket-core/appshell/docs/
  - **Repository** — Link to https://github.com/dsissoko/oneticket-core

### HelpScreen.tsx

```tsx
export default function HelpScreen(): JSX.Element
```

**Layout:**
- `PageHeader` — Title "Help & Quickstart"
- `Card` container with Tailwind classes — 7-step quickstart guide for reusing AppShell
- Content sections:
  - **Getting Started** — Introduction to reusing AppShell
  - **7-Step Quickstart** — Step-by-step instructions
  - **Full Runbook** — Link to `.oneticket/docs/run/appshell-reuse.md`

## Data Changes

No data changes. Both screens are presentational with static content and external links.

## Sequence Flow

1. User navigates to `/about` or `/help` route
2. Corresponding screen (`AboutScreen` or `HelpScreen`) renders
3. Screen displays `PageHeader` and `Card` components styled with Tailwind classes
4. User can click external links to documentation or repository

## Observability Impact

No observability impact. Screens are informational and do not trigger API calls or state mutations.
