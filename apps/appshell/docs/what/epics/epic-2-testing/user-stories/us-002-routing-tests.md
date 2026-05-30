# US-002 — Routing Tests

## Story

As a developer, I want integration tests for all routes so that navigation and 404 handling are verified automatically.

## Expected Behavior

- Tests use `MemoryRouter` to simulate navigation
- Each route renders its expected screen
- 404 route renders `NotFoundScreen`

## Acceptance Criteria

- [ ] Route `/` renders `HomeScreen` with AppShell title
- [ ] Route `/about` renders `AboutScreen`
- [ ] Route `/help` renders `HelpScreen`
- [ ] Route `/nonexistent` renders `NotFoundScreen` with 404 message
- [ ] `Back Home` buttons navigate correctly
- [ ] All tests pass with `npm run test`
