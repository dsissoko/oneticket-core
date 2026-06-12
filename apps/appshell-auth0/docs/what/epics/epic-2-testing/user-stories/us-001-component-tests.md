# US-001 — Component Tests

## Story

As a developer, I want unit tests for core components so that regressions in Header, Footer, AppLayout, and ErrorBoundary are caught automatically.

## Expected Behavior

- Tests cover rendering, props, and key interactions of locked components
- Tests run with `npm run test` in under 5 seconds

## Acceptance Criteria

- [ ] `Header.test.tsx` — renders logo, navigation links, ThemeToggle
- [ ] `Footer.test.tsx` — renders N1 (copyright, links) and N2 (social icons)
- [ ] `AppLayout.test.tsx` — renders Header + Outlet + Footer
- [ ] `ErrorBoundary.test.tsx` — catches render errors and displays fallback
- [ ] All tests pass with `npm run test`
