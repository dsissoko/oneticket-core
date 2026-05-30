# Epic 5 — Realtime (SSE)

## Goal

Demonstrate server-sent events (SSE) in AppShell so that derived projects have a reference pattern for streaming long-running process updates from server to client.

## Status

✅ Delivered — useEventSource hook + MSW SSE handler + Realtime tab in DemoScreen

## Business Value

- **Reference pattern** — SSE is the standard for one-way server-to-client streaming (progress, logs, notifications)
- **No extra dependencies** — uses the native browser `EventSource` API
- **Mockable in dev** — MSW simulates the SSE stream, identical behavior to a real backend
- **Directly applicable** — OneTicket pipeline agents already produce this kind of event stream

## Why SSE and not WebSocket

SSE is the right choice when the communication is **server → client only** (progress updates, log streaming, notifications). It is simpler, lighter on the server, supports reconnection natively, and works over standard HTTP.

WebSocket is needed only when the client also needs to send messages to the server in real time (chat, collaborative editing). That use case is out of scope for this epic.

## Scope

- `useEventSource(url)` hook — wraps the native `EventSource` API with React state
- MSW SSE handler — simulates a long-running process emitting progress events
- Tab "Realtime" added to `DemoScreen` — progress bar + live log stream
- Clear label "simulated via MSW" in the UI — transparent about the mock

## Related User Stories

- [US-001 — useEventSource Hook](user-stories/us-001-use-event-source.md)
- [US-002 — MSW SSE Handler](user-stories/us-002-msw-sse-handler.md)
- [US-003 — Realtime Tab in DemoScreen](user-stories/us-003-realtime-tab.md)
