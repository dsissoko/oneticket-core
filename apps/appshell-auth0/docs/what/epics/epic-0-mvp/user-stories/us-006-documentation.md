# US-006 — Documentation

## Story

As a developer, I want clear documentation so that I understand AppShell's purpose and how to adapt it for a new project.

## Expected Behavior

- `apps/appshell/README.md` explains the project purpose and quick start
- `docs/how/architecture.md` describes the full technical architecture aligned with delivered code
- `docs/what/product-spec.md` describes the product vision, capabilities, and roadmap
- `docs/what/epics/` contains all epics with user stories and acceptance criteria
- Documentation site deployed at `https://dsissoko.github.io/oneticket-core/appshell/docs/`
- `AboutScreen` describes AppShell intent and links to docs
- `HelpScreen` provides quick links and FAQ for developers

## Acceptance Criteria

- [x] `apps/appshell/README.md` exists with project overview and quick start
- [x] `docs/how/architecture.md` reflects delivered AppShell v1.0 stack — no outdated references
- [x] `docs/what/product-spec.md` describes delivered capabilities and roadmap epics
- [x] Documentation site accessible at production URL
- [x] `AboutScreen` displays AppShell tagline and description
- [x] `HelpScreen` has Quick Links section with working internal navigation links
- [x] No broken cross-references in documentation
