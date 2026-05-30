# US-004 — Tab: Logger

## Story

As a developer, I want a Logger tab so that I can see the logging system in action and understand how to use it in derived projects.

## Expected Behavior

- Instructions to open browser DevTools console
- Four buttons: one per log level (Debug, Info, Warn, Error)
- Clicking each button triggers the corresponding `logger` call
- Current log level displayed (from `VITE_LOG_LEVEL`)
- Note about remote dispatch if `VITE_OTLP_ENDPOINT` is configured

## Acceptance Criteria

- [ ] Tab renders instructions: "Open your browser DevTools console (F12)"
- [ ] Button "Debug" triggers `logger.debug('[demo] debug message')`
- [ ] Button "Info" triggers `logger.info('[demo] info message')`
- [ ] Button "Warn" triggers `logger.warn('[demo] warn message')`
- [ ] Button "Error" triggers `logger.error('[demo] error message')`
- [ ] Current effective log level displayed in UI
- [ ] All buttons use shadcn `Button variant="outline"`
