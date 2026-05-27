---
name: oneticket-msw-setup-for-vite-react-primer
description: Canonical MSW setup for React + Vite frontends (worker script, Vite integration, and bootstrap rules).
---

# MSW + Vite Setup

## Objective

Provide a **repeatable, zero-surprise setup** for Mock Service Worker
with a React + Vite frontend, so that:

- `/api/...` calls are consistently handled by MSW in **dev** and
  **preview/build** modes, and  
- agents do not need to guess the right commands or bootstrap pattern.

This skill complements `openclaw/msw-for-js-ts` by encoding the concrete
choices for this repo (Vite + `/public`).

---

## When to Use

- The frontend uses MSW to mock its backend (as described in
  `architecture.md`), and  
- the agent is:
  - enabling MSW for the first time in a new app, or  
  - troubleshooting MSW registration / 404 / JSON parse errors.

---

## Step 1 – Ensure the worker script exists

For Vite, MSW expects the worker script to be served from the public
directory at `/mockServiceWorker.js`.

Canonical command (from the repository root):

```bash
cd frontend
npx msw init public --save
```

This must result in:

- `apps/<current_project>/frontend/public/mockServiceWorker.js` being present, and  
- `apps/<current_project>/frontend/package.json` containing:

```jsonc
{
  "msw": {
    "workerDirectory": ["public"]
  }
}
```

If the worker is missing or moved, MSW will log:

- `Failed to register the Service Worker`  
- or the browser will show  
  `Failed to load resource: the server responded with a status of 404 (Not Found)`  
  for `/mockServiceWorker.js`.

Treat these messages as **blocking** until the worker is restored.

---

## Step 2 – Browser bootstrap pattern

The browser entrypoint must enable MSW whenever the code runs in a real
browser (dev and preview/build), not only when `import.meta.env.DEV` is
true.

Canonical pattern for `apps/<current_project>/frontend/src/main.tsx`:

```ts
async function bootstrap() {
  if (typeof window !== 'undefined') {
    const { enableMocking } = await import('./mocks/browser');
    await enableMocking();
  }

  const container = document.getElementById('root');
  // ...
}
```

This ensures that:

- `npm run dev` and `npm run preview` both use MSW,  
- `/api/...` endpoints are consistently intercepted by MSW,
  and  
- `fetch(...).json()` calls receive JSON from handlers instead of the
  HTML shell.

---

## Step 3 – Node/test setup reminder

For tests (Vitest, JSDOM), use `setupServer` from `msw/node` in a
dedicated `server.ts` plus a test setup file:

- `apps/<current_project>/frontend/src/mocks/server.ts` – defines `server = setupServer(...handlers)`
- `apps/<current_project>/frontend/src/test/setup.ts` – calls:

  - `beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))`
  - `afterEach(() => server.resetHandlers())`
  - `afterAll(() => server.close())`

When this skill is applied, do **not** change this pattern unless
`openclaw/msw-for-js-ts` explicitly requires it.

---

## Step 4 – Error patterns to treat as blocking

While working with MSW + Vite, the agent must treat the following as
immediate blockers:

- `[MSW] Failed to register the Service Worker` in the browser console.
- `Failed to load resource: the server responded with a status of 404
  (Not Found)` for `/mockServiceWorker.js` or `/api/...`.
- `Unexpected token '<'` or `"is not valid JSON"` thrown from
  `response.json()` calls when the app expects JSON from mocked
  endpoints.

These errors almost always indicate:

- missing worker script,  
- MSW not started in the current runtime, or  
- a route that is not handled and falls back to the HTML shell.

The agent should:

1. Apply **Step 1** (ensure worker) and **Step 2** (bootstrap pattern),
2. Re-run `cd apps/<current_project>/frontend && npm run build && npm run test:smoke`, and  
3. Re-run the E2E smoke (see `e2e-for-playwright`) until these
   messages disappear.

