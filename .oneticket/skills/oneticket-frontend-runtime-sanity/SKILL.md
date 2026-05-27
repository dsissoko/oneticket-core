---
name: oneticket-frontend-runtime-sanity
description: Ensure a minimal runtime smoke-test setup exists for the frontend so the agent can verify the app renders without crashing after code changes.
---

# Frontend Runtime Sanity

## Objective

Ensure that:

- at least one **runtime smoke test** exists for the frontend, and
- the agent **runs** it after any significant frontend change before handing control back to the user.

---

## When to Use

Use this skill when:

- the project includes a graphical frontend, and
- the agent is generating a new frontend application or making non-trivial changes to existing frontend code (logic, components, routing, state, theming).

---

## Expected Baseline

A minimal runtime smoke test setup must include:

1. **A test runner** appropriate for the frontend stack (e.g. Vitest, Jest) configured in the project.
2. **A smoke test file** that:
   - mounts or renders the top-level component or entry point,
   - wraps it in any required providers (theme, router, query client, etc.),
   - asserts only that it does not throw — no UI detail assertions.
3. **An npm script** (or equivalent) to run the smoke test in CI mode (e.g. `test:smoke`).

---

## Process

### Step 1 — Confirm the frontend context

Read `architecture.md` and confirm the frontend stack and directory structure.

### Step 2 — Ensure a smoke test exists

- Read `architecture.md` to identify the frontend stack and its associated testing tools.
- Use exclusively the tools already defined in the stack (test runner, assertion library, DOM environment) — do not introduce new testing dependencies.
- If no smoke test exists, create a minimal one following the baseline above.

### Step 3 — Run after significant changes

After any significant frontend change, the agent must run in order:

1. The build command (e.g. `npm run build`)
2. The smoke test command (e.g. `npm run test:smoke`)

Any failure is **blocking** — fix the issue or explicitly report why it cannot be resolved.

### Step 4 — Keep it minimal

This skill does not require full test coverage or complex CI pipelines. Its only goal is to verify that the app starts and the root component mounts without a runtime error.

---

## Common Runtime Error Patterns to Watch

Even when the smoke test passes, treat the following as blocking:

- `Unexpected token '<'` or `is not valid JSON` — a fetch call received HTML instead of JSON (misconfigured mock or wrong API URL)
- `Failed to register the Service Worker` — MSW not correctly set up
- `404` for a mock worker script — missing or misplaced service worker file
