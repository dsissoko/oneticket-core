# Slice 5 — Documentation & Runbook

## Goal

Provide comprehensive documentation and runbook for copying the AppShell skeleton to new projects, explaining patterns and configuration.

## Related Epic

[Epic 0 — AppShell MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

[US-006 — Documentation & Runbook](../../what/epics/epic-0-mvp/user-stories/us-006-documentation.md)

## Impacted Components

- `apps/appshell/README.md` — project overview and quick start guide
- `apps/appshell/docs/how/RUN-BOOK.md` — step-by-step instructions for reusing skeleton
- `.oneticket/runbooks/appshell-skeleton.md` — detailed runbook with examples
- Code comments in key files (JSDoc on public functions)
- Inline documentation in configuration files

## Interfaces

None (documentation only).

## Data Changes

None (documentation only).

## Sequence Flow

1. Create `apps/appshell/README.md` with:
   - Project description and OneTicket vision
   - Quick start commands (npm install, npm run dev, etc.)
   - Architecture overview
   - File structure explanation
   - Links to related documentation

2. Create `apps/appshell/docs/how/RUN-BOOK.md` with:
   - Step-by-step guide to copy skeleton to new project
   - Each adaptation step with examples
   - Common troubleshooting

3. Create `.oneticket/runbooks/appshell-skeleton.md` with detailed implementation steps

4. Add JSDoc comments to key components:
   - AppLayout, Header, Footer
   - useUsers, useTheme hooks
   - API client and query setup

5. Add inline comments in configuration files:
   - `vite.config.ts`
   - `tailwind.config.ts`
   - `tsconfig.json`

6. Create ARCHITECTURE.md overview (if not existing)

7. Test that documentation is accurate by following runbook steps

## Observability Impact

- README renders correctly on GitHub
- Documentation links are not broken (relative paths)
- Code examples compile and run
- TypeScript JSDoc visible in IDE autocomplete

## Acceptance Criteria

- [x] `apps/appshell/README.md` created with project overview
- [x] README includes "Quick Start" with npm commands
- [x] README explains Exclusive File Ownership model
- [x] README links to architecture.md and other docs
- [x] `RUN-BOOK.md` explains how to copy skeleton step-by-step
- [x] Runbook includes examples of file adaptations
- [x] `.oneticket/runbooks/appshell-skeleton.md` documents detailed steps
- [x] JSDoc comments added to AppLayout, Header, Footer components
- [x] JSDoc comments added to custom hooks (useUsers, useTheme, etc.)
- [x] Comments in vite.config.ts explain key settings
- [x] Comments in tailwind.config.ts explain design tokens
- [x] Comments in tsconfig.json explain strict mode
- [x] Links to Vite, React Router, React Query, MSW docs
- [x] Troubleshooting section for common issues
- [x] Documentation is verified by following the runbook
