# US-002 — MSW SSE Handler

## Story

As a developer, I want a MSW handler for `GET /api/stream` that simulates a long-running process so that I can develop and demo the SSE pattern without a real backend.

## Expected Behavior

- `GET /api/stream` returns `Content-Type: text/event-stream`
- Emits 10 progress events at 500ms intervals:
  ```
  event: progress
  data: {"step": 1, "total": 10, "message": "Processing batch 1/10..."}
  ```
- Emits a final `done` event:
  ```
  event: done
  data: {"duration": "5s"}
  ```
- Uses `ReadableStream` — no real timer on the server side

## Acceptance Criteria

- [ ] Handler added to `src/mocks/handlers.ts`
- [ ] Returns correct `Content-Type: text/event-stream` header
- [ ] 10 progress events + 1 done event
- [ ] Stream closes cleanly after `done` event
- [ ] Visible in browser DevTools Network tab as EventStream
