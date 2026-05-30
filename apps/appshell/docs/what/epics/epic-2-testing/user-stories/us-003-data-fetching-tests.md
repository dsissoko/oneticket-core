# US-003 — Data Fetching Tests

## Story

As a developer, I want tests for the `useUsers()` hook so that the React Query + MSW integration is verified automatically.

## Expected Behavior

- Tests use MSW `setupServer` from `vitest.setup.ts`
- Hook renders loading state, then data state
- Error state tested by overriding MSW handler

## Acceptance Criteria

- [ ] `useUsers.test.ts` — renders loading state initially
- [ ] `useUsers.test.ts` — renders list of 5 users after fetch
- [ ] `useUsers.test.ts` — renders error state when MSW returns 500
- [ ] MSW handlers reset between tests (handled by `vitest.setup.ts`)
- [ ] All tests pass with `npm run test`
