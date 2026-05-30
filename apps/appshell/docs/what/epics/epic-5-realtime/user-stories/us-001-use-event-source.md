# US-001 — useEventSource Hook

## Story

As a developer, I want a `useEventSource(url)` hook so that I can consume an SSE stream with React state without managing the `EventSource` lifecycle manually.

## Expected Behavior

- Hook opens an `EventSource` connection on mount
- Exposes `{ events, status, start, stop }` — events accumulate in an array
- `status`: `'idle' | 'connecting' | 'open' | 'closed' | 'error'`
- `start()` opens the connection, `stop()` closes it
- Connection is closed and cleaned up on unmount
- Works identically with a real backend or MSW mock

## Acceptance Criteria

- [ ] `src/hooks/useEventSource.ts` created
- [ ] Returns `events: string[]`, `status`, `start()`, `stop()`
- [ ] Connection closed on component unmount (no memory leak)
- [ ] Error state handled gracefully — no unhandled exceptions
- [ ] TypeScript strict — no `any`
