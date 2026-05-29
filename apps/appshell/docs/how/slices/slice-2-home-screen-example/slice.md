# Slice 2 — Home Screen Example

## Goal

Implement a data fetching example using React Query + MSW on the Home screen. This slice demonstrates how to build components that fetch, cache, and display data from a mock API with proper loading, error, and empty states—establishing a pattern for all subsequent feature screens.

## Related Epics

- [../../../what/epics/epic-0-mvp/epic.md](../../../what/epics/epic-0-mvp/epic.md) — AppShell MVP

## Related User Stories

- [../../../what/epics/epic-0-mvp/user-stories/us-002-design-tokens.md](../../../what/epics/epic-0-mvp/user-stories/us-002-design-tokens.md) — Design tokens and components (context for UI patterns)
- [../../../what/epics/epic-0-mvp/user-stories/us-003-exclusive-ownership.md](../../../what/epics/epic-0-mvp/user-stories/us-003-exclusive-ownership.md) — Exclusive ownership (establishing ownership for HomeScreen.tsx and useUsers.ts)

## Impacted Components

1. **src/screens/HomeScreen.tsx** — Main component displaying a list of users with loading and empty states
2. **src/hooks/useUsers.ts** — Custom React Query hook for fetching users from `/api/users`
3. **src/mocks/handlers.ts** — MSW handler for `GET /api/users` returning mock user data
4. **src/mocks/data/users.ts** — Mock data array containing user fixtures
5. **src/mocks/browser.ts** — MSW worker setup using `setupWorker(handlers)`
6. **src/main.tsx** — Integration point for MSW initialization in development mode
7. **tailwind.config.ts** + **styles/globals.css** — Token usage for spacing, colors, and typography

## Interfaces

### Data Contract: `GET /api/users`
```typescript
// Request: GET /api/users
// Response (200):
{
  "users": [
    { "id": 1, "name": "Alice Johnson" },
    { "id": 2, "name": "Bob Smith" },
    { "id": 3, "name": "Carol Davis" }
  ]
}
```

### Hook Export: `src/hooks/useUsers.ts`
```typescript
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      return data.users;
    },
  });
}
```

### MSW Handler
```typescript
http.get('/api/users', async () => {
  return HttpResponse.json({ users: mockUsers });
})
```

## Data Changes

1. **New mock data file:** `src/mocks/data/users.ts` — Array of user objects with `id` and `name` fields
2. **New MSW handler:** `src/mocks/handlers.ts` — GET /api/users handler (created or updated)
3. **MSW worker registration:** `src/mocks/browser.ts` — setupWorker call includes handlers

No database changes; all data is mock-based for development.

## Sequence Flow

```
1. Browser loads app (main.tsx)
2. MSW worker starts (import.meta.env.DEV check)
3. App renders AppLayout + HomeScreen route
4. HomeScreen mounts → calls useUsers()
5. useUsers() calls useQuery with fetch('/api/users')
6. In dev: MSW intercepts fetch, returns mockUsers
7. React Query caches response
8. HomeScreen renders Card list with users
9. User can refresh, MSW returns same mock data (demo-safe)
10. In production: fetch('/api/users') hits real API endpoint (no code changes)
```

## Observability Impact

- **Console logging** — useUsers hook logs fetch start/completion for debugging
- **React Query DevTools** — Optional devtools component can be added to inspect query state
- **Error handling** — Failed fetches display error message in HomeScreen
- **Loading indicator** — Skeleton or spinner shown while query.isLoading is true
- **Empty state** — Message displayed when query returns empty users array

## Implementation Checklist

### 1. Mock Data (src/mocks/data/users.ts)
- [ ] Array of user objects: `[{ id: 1, name: "..." }, ...]`
- [ ] Exported as `mockUsers` constant
- [ ] At least 3 mock users for realistic demo

### 2. MSW Handler (src/mocks/handlers.ts)
- [ ] HTTP GET handler for `/api/users`
- [ ] Returns `{ users: mockUsers }` via `HttpResponse.json()`
- [ ] Handler added to exported `handlers` array

### 3. MSW Worker (src/mocks/browser.ts)
- [ ] `setupWorker(...handlers)` initialized with all handlers
- [ ] Worker exported as default
- [ ] Worker ready for start() in main.tsx

### 4. Custom Hook (src/hooks/useUsers.ts)
- [ ] Imports `useQuery` from `@tanstack/react-query`
- [ ] Defines queryKey: `['users']`
- [ ] Fetches from `/api/users`
- [ ] Parses JSON response and extracts users array
- [ ] Error thrown if response not ok
- [ ] Hook exported and ready for use in components

### 5. Home Screen Component (src/screens/HomeScreen.tsx)
- [ ] Calls `useUsers()` hook
- [ ] Renders loading state (spinner or skeleton) while `isLoading`
- [ ] Renders error message if `isError`
- [ ] Renders empty state message if `data?.length === 0`
- [ ] Renders Card list with user names when data available
- [ ] Uses Tailwind classes and design tokens (no inline styles)
- [ ] Uses shadcn/ui Card component from `src/components/ui/card`

### 6. MSW Integration in main.tsx
- [ ] Worker imported: `import worker from './mocks/browser'`
- [ ] Conditional initialization: `if (import.meta.env.DEV) { await worker.start() }`
- [ ] Happens before ReactDOM.createRoot()

### 7. Route Registration (App.tsx)
- [ ] `/` route maps to `HomeScreen` component
- [ ] Route wrapped by AppLayout

### 8. Styling
- [ ] Card uses token-based spacing and colors
- [ ] Loading spinner/skeleton uses Tailwind from globals.css
- [ ] Error message styled with warning/error token colors
- [ ] Empty state message styled with neutral token colors

## Success Criteria

- [ ] App loads without console errors
- [ ] HomeScreen displays "Loading..." while query is pending
- [ ] Mock data fetches via MSW (check Network tab)
- [ ] User list renders with all 3+ mock users in cards
- [ ] Empty state message appears if mockUsers array is emptied
- [ ] Error handling works (e.g., if handler throws)
- [ ] Page refresh preserves cached data (React Query caching)
- [ ] All Tailwind classes resolve; no undefined tokens
- [ ] No inline `style={{}}` attributes in HomeScreen
- [ ] ESLint passes with no warnings

## Files Owned by This Slice

**Exclusive ownership** (one task only):
- `src/screens/HomeScreen.tsx`
- `src/hooks/useUsers.ts`

**Shared ownership** (modified by this slice, but may be touched by others):
- `src/mocks/handlers.ts` — Append GET /api/users handler
- `src/mocks/data/users.ts` — Create new file
- `src/mocks/browser.ts` — Ensure setupWorker is present (may already exist from Slice 1)
- `src/main.tsx` — Ensure MSW worker.start() is called (may already exist from Slice 1)
- `App.tsx` — Ensure `/` route maps to HomeScreen (may already exist from Slice 1)

## Dependencies

**Depends on:**
- Slice 1 (Foundation) — AppLayout, routing structure, MSW setup, React Query provider, Tailwind tokens

**Enables:**
- Slice 3+ (Additional screens) — Reusable pattern for data fetching, error handling, loading states
