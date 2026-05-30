# US-005 — End-to-End Tests (Playwright)

## Story

As a developer, I want end-to-end tests covering the critical user journeys so that regressions in real browser behavior are caught automatically.

## Why Playwright in addition to Vitest

Vitest + RTL tests run in jsdom — a simulated DOM. They cannot verify:
- Real browser rendering and CSS
- Sub-path routing with `basename` on GitHub Pages
- MSW Service Worker registration in a real browser
- Network tab behavior
- Cross-browser compatibility

Playwright tests run in real Chromium/Firefox/Safari and complement unit tests.

## Scope

| Journey | What is verified |
|---|---|
| Home → About | Navigation works, About content renders |
| Home → Demo | `/demo` route works, 4 tabs render |
| Demo Users tab | List renders, create form submits, user appears |
| Theme toggle | Dark mode applies `.dark` class, persists after reload |
| 404 | Unknown route renders NotFoundScreen |

## Setup

```bash
npm install -D @playwright/test
npx playwright install chromium
```

`playwright.config.ts` at app root:
```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './src/test/e2e',
  use: {
    baseURL: 'http://localhost:5173',
  },
});
```

## Acceptance Criteria

- [ ] `@playwright/test` installed in devDependencies
- [ ] `playwright.config.ts` at `apps/appshell/app/`
- [ ] `src/test/e2e/` directory with test files
- [ ] `npm run test:e2e` script in `package.json`
- [ ] Home → About navigation test passes in Chromium
- [ ] Home → Demo navigation + 4 tabs test passes
- [ ] Demo Users CRUD test passes (create user visible in list)
- [ ] Theme toggle test passes (`.dark` class on `<html>`)
- [ ] 404 route test passes
- [ ] All tests pass with `npm run dev` running locally
