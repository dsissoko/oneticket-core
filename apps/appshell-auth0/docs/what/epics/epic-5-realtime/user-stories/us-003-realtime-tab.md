# US-003 — Realtime Tab in DemoScreen

## Story

As a developer, I want a "Realtime" tab in DemoScreen so that I can see SSE streaming in action with a progress bar and live log output.

## Expected Behavior

- New tab "Realtime" added to `DemoScreen` tabs
- [▶ Start] button opens the SSE connection to `/api/stream`
- Progress bar fills as events arrive (step / total)
- Each event appended to a live log list (most recent first)
- [■ Stop] button closes the connection at any time
- Label "simulated via MSW" visible in the UI — transparent about the mock
- After `done` event: progress bar full, buttons reset

## UI sketch

```
Realtime                          [▶ Start]  [■ Stop]

━━━━━━━━━━━━━━━░░░░░  60%  (simulated via MSW)

• Processing batch 6/10...
• Processing batch 5/10...
• Processing batch 4/10...
```

## Acceptance Criteria

- [ ] Tab "Realtime" added to `DemoScreen`
- [ ] `useEventSource('/api/stream')` used
- [ ] Progress bar updates on each `progress` event
- [ ] Log list shows last N events (most recent first)
- [ ] [Start] disabled while stream is open
- [ ] [Stop] closes the stream and resets state
- [ ] "simulated via MSW" label visible
- [ ] Stream auto-stops on `done` event
