---
name: oneticket-safety-for-vite-react-primer
description: Ensure every new application created from this template has a minimal, generic error boundary at startup and at the UI/root level, based on cross-language error handling patterns.
---

# App First-Generation Safety

## Objective

When creating a **new application** (frontend, backend, CLI) from this template, always provide a **minimal but robust safety net**:

- a global error boundary around the startup/bootstrap path, and  
- for UI frameworks that support it, a top-level UI error boundary,

so that:

- unexpected errors do not result in silent crashes or blank screens, and  
- users still see a controlled fallback message plus copyable technical details.

This skill complements the generic patterns from `wshobson/error-handling-patterns` and specializes them for this template.

---

## When to Use

Use this skill whenever:

- `architecture.md` defines a new application (web frontend, backend service, CLI, worker, etc.), and  
- you are implementing its **first generation** (initial bootstrap / entrypoint).

Examples:

- creating a new SPA frontend under `apps/<current_project>/frontend/`,
- adding a new backend service under `apps/<current_project>/backend/`,
- adding a new CLI entrypoint.

---

## Core Principles

1. **Single boundary per layer**
   - Each application should have:
     - one **startup boundary** that wraps the main bootstrap path, and
     - if applicable, one **UI boundary** at the top of the visual tree.

2. **Generic, not feature-specific**
   - Boundaries are generic: they transform *any* unexpected error into:
     - a clean fallback message for users, and
     - detailed logs / technical details for developers.
   - Do **not** special-case particular features (e.g. MSW vs something else) inside the boundary.

3. **Separation of concerns**
   - Local error handling (e.g. validation errors, expected failures) is still handled near the source.
   - Boundaries are a last resort for unexpected, unrecoverable errors.

---

## Process

### Step 1 – Identify application type and entrypoint(s)

1. Read `architecture.md` to determine:
   - whether the app is a frontend, backend service, CLI, etc.,
   - what the main entrypoints are (e.g. `main.tsx`, `server.ts`, `cli.ts`).
2. For each new application, choose the appropriate boundary mapping:
   - **Web frontend (React, etc.)**:
     - Startup boundary around the bootstrap function (`main()` / `bootstrap()`),
     - UI boundary (top-level Error Boundary component).
   - **Backend HTTP service**:
     - Startup boundary around the server bootstrap (e.g. `main()` / `startServer()`),
     - Global error handler / middleware for HTTP requests.
   - **CLI / worker**:
     - Startup boundary around `main()` that converts unexpected errors into:
       - exit codes,
       - concise terminal output with copyable technical details.

### Step 2 – Apply startup boundary (all app types)

For any new application:

1. Wrap the main bootstrap path in a `main()` (or equivalent) that:
   - calls lower-level `bootstrap()` / `run()` functions, and  
   - is wrapped in a `try { ... } catch (error) { ... }` (or language-idiomatic equivalent).
2. In the `catch`:
   - log a generic message and the error details (stack, context),
   - produce a safe fallback output:
     - web UI → error screen with generic message + `<details><pre>` or equivalent for copyable details,
     - backend → structured error (e.g. JSON) plus reliable HTTP status,
     - CLI → human-readable message plus enough detail that can be copy–pasted.
3. Do **not** silently swallow errors; boundaries must be observable (log + fallback).

### Step 3 – Apply UI error boundary (for frontends)

For frontends using a UI framework that supports error boundaries (e.g. React):

1. Create a top-level Error Boundary component (for example `AppErrorBoundary` in React) that:
   - catches rendering / lifecycle errors,  
   - logs a generic “Unexpected UI error” and technical details,  
   - renders a generic error screen with:
     - a short explanation for users,  
     - a toggle (`<details>`, dialog, or similar) containing copyable technical details (message + stack).
2. Wrap the root app component with this boundary in the entrypoint:
   - React example:
     - `createRoot(...).render(<AppErrorBoundary><App /></AppErrorBoundary>)`
3. Keep the boundary **generic**:
   - no feature-specific logic inside (`if (error is from MSW) ...`),
   - it simply transforms arbitrary exceptions into an understandable fallback.

### Step 4 – Keep boundaries aligned with `error-handling-patterns`

When implementing boundaries:

1. Use `wshobson/error-handling-patterns` to guide:
   - how you structure error types (ApplicationError, ValidationError, etc.),  
   - what is considered recoverable vs unrecoverable.
2. Position boundaries at the **edges**:
   - process boundaries (startup / main),
   - user-visible boundaries (UI root, HTTP global handler),
   - not deep inside local feature code.

---

## React + Vite Frontend Mapping (current stack)

For the React + Vite SPA described in `docs/<current_project>/architecture.md` and implemented under `apps/<current_project>/frontend/`:

- **Startup boundary**:
  - Implement a `main()` function in `apps/<current_project>/frontend/src/main.tsx` that:
    - calls `bootstrap()` (which may include MSW setup and React rendering),
    - wraps the call in a `try/catch` and renders an "Unexpected startup error" screen with copyable technical details.

- **UI boundary**:
  - Implement an `AppErrorBoundary` component under `apps/<current_project>/frontend/src/root/` (or equivalent),
  - Wrap `<App />` with `<AppErrorBoundary>` in the React root.

This pattern ensures:

- no silent blank screen on unexpected errors,
- consistent error surfaces with both user-friendly text and copyable debug info.

