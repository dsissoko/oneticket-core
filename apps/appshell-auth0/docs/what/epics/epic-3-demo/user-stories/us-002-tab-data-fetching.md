# US-002 — Tab: Data Fetching

## Story

As a developer, I want a Data Fetching tab so that I can see React Query + MSW working with real UI components.

## Expected Behavior

- Tab renders the list of mock users from `useUsers()`
- Loading state shown while fetching
- Error state shown if fetch fails
- Each user displayed in a shadcn `Card`

## Acceptance Criteria

- [ ] `useUsers()` called — users list rendered in Cards
- [ ] Loading spinner shown during fetch
- [ ] Error message shown if MSW returns error
- [ ] User data: name, email, role displayed per card
- [ ] Cache invalidation visible — refresh button triggers refetch
