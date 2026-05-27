---
name: oneticket-e2e-for-playwright
description: Minimal browser-based E2E smoke test for any frontend, so the agent can automatically detect client-side console errors and page-load issues.
---

# Frontend E2E Sanity

## Objective

Provide a **lightweight end-to-end sanity check** for the frontend so that the agent can:

- open the running application in a real browser (via Playwright),
- capture browser console errors (including Service Worker/MSW issues),
- and fail fast if critical client-side errors occur, even when build and unit/smoke tests pass.

This skill complements:

- bundler checks (e.g. build command), and
- runtime smoke tests (e.g. unit/component test runner),

by adding a **real-browser smoke test** focused on page load and console errors.

---

## When to Use

Use this skill when:

- the project includes a web frontend, and
- the agent needs to validate that the application:
  - loads without hard errors in the browser (no blank screen due to runtime JS errors), and
  - does not emit critical console errors on initial load.

It is particularly important **after**:

- significant changes to frontend bootstrapping (e.g. service worker setup, theming, routing),
- changes to mocking logic,
- changes to global configuration or environment handling.

---

## Principle

The E2E smoke test must:

1. **Serve the built app** using the project's preview/serve command.
2. **Open the app** in a headless Chromium browser via Playwright.
3. **Listen for critical errors** on the browser console and page error events.
4. **Fail** if any critical pattern is detected; **pass** otherwise.

The list of critical patterns to detect:

- `Failed to register the Service Worker`
- `Uncaught`
- `Unexpected token`
- `is not valid JSON`
- `404 (Not Found)`

---

## Implementation

The concrete implementation depends on the project stack (build tool, serve command, script runtime). The agent must:

1. Identify the build and preview commands from `architecture.md` or `package.json`.
2. Install Playwright locally inside the project (not globally).
3. Install the Chromium browser via Playwright's install command.
4. Create a minimal smoke script that follows the principle above.
5. Run the script after every significant frontend change, alongside the build and unit smoke test.

If the environment does not allow installing Playwright (unavailable runtime, non-writable cache, etc.):

- consider E2E as **not executed** for this iteration,
- clearly document in the response why E2E was not run and which commands the maintainer must run locally to activate it.

