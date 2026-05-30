# Epic 2 — Test Coverage

## Goal

Ensure AppShell is a trustworthy foundation by providing meaningful test coverage for core components, routing, data fetching, and theme behavior.

## Status

✅ Delivered — 32 tests passing (Vitest + RTL + MSW)

## Business Value

- **Foundation credibility** — a skeleton without tests is not production-grade
- **Regression safety** — tests catch regressions when AppShell is updated
- **Pattern reference** — tests show derived projects how to test React components with Vitest + RTL + MSW
- **Acceptance validation** — user story acceptance criteria become executable tests

## Scope

- Unit tests for core locked components (Header, Footer, AppLayout, ErrorBoundary)
- Integration tests for all routes (/, /about, /help, 404)
- Data fetching tests for `useUsers()` hook with MSW
- Theme toggle tests (system/light/dark persistence)

## Infrastructure (already in place)

- `vitest.config.ts` — jsdom environment, `@/` alias, `vitest.setup.ts`
- `vitest.setup.ts` — Testing Library matchers + MSW server setup
- `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`

## Related User Stories

- [US-001 — Component Tests](user-stories/us-001-component-tests.md)
- [US-002 — Routing Tests](user-stories/us-002-routing-tests.md)
- [US-003 — Data Fetching Tests](user-stories/us-003-data-fetching-tests.md)
- [US-004 — Theme Tests](user-stories/us-004-theme-tests.md)
- [US-005 — End-to-End Tests (Playwright)](user-stories/us-005-e2e-tests.md)
