# US-007 — Observability

## Story

As a developer, I want built-in observability so that I can monitor application behavior, track errors, and optionally forward logs to a remote collector without any additional setup.

## Expected Behavior

- All significant application events are logged via a centralized logger
- Errors are never silently swallowed — they are always captured and logged
- Log level is configurable via environment variable — no code change required
- Remote log dispatch is optional — activated by a single environment variable
- The observability stack is compatible with OpenTelemetry-compliant backends (Grafana Loki, Datadog, custom OTLP endpoint)

## Implementation — Delivered

### Logger (`src/lib/logger.ts`)
- **Library:** `loglevel` + `loglevel-plugin-remote`
- **Level:** controlled by `VITE_LOG_LEVEL` env var — default `debug`
- **Remote dispatch:** activated by `VITE_OTLP_ENDPOINT` — JSON format, 1s batch, 500 message queue, fire-and-forget
- **Fallback:** if `VITE_LOG_LEVEL` not set, warns in console and defaults to `debug`

### Global Error Boundary (`src/main.tsx`)
- `window.addEventListener('unhandledrejection')` → `logger.error`
- `window.addEventListener('error')` → `logger.error`
- App startup wrapped in `try/catch` → `logger.error` + fallback HTML if React fails to mount

### React Error Boundary (`src/components/ErrorBoundary.tsx`)
- Catches React render errors via `componentDidCatch`
- Logs via `logger.error('[ErrorBoundary]', error, errorInfo)`
- Displays graceful fallback UI with shadcn Button

### Auto-instrumented points

| Point | Mechanism | Level |
|---|---|---|
| App start | `main.tsx` | `info` |
| MSW enabled | `main.tsx` | `info` |
| Navigation | `AppLayout` `useEffect` on `location.pathname` | `info` |
| React Query fetch error | `QueryCache.onError` | `error` |
| React Query mutation error | `MutationCache.onError` | `error` |
| React render error | `ErrorBoundary.componentDidCatch` | `error` |
| Uncaught JS error | `window.onerror` | `error` |
| Unhandled promise rejection | `window.unhandledrejection` | `error` |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_LOG_LEVEL` | `debug` | `debug \| info \| warn \| error \| silent` |
| `VITE_OTLP_ENDPOINT` | _(empty)_ | Remote log endpoint — empty = console only |

## Acceptance Criteria

- [x] `logger.info`, `logger.warn`, `logger.error`, `logger.debug` available everywhere via `import { logger } from '@/lib/logger'`
- [x] Log level controlled by `VITE_LOG_LEVEL` — no code change required to adjust verbosity
- [x] Warning logged in console when `VITE_LOG_LEVEL` not set
- [x] Remote dispatch activated by `VITE_OTLP_ENDPOINT` — JSON payload, fire-and-forget
- [x] `window.onerror` and `unhandledrejection` captured globally in `main.tsx`
- [x] React render errors caught by `ErrorBoundary` and logged
- [x] React Query fetch and mutation errors logged via `QueryCache.onError` / `MutationCache.onError`
- [x] Navigation changes logged on every route transition
- [x] No silent failures — every error path has a `logger.error` call
