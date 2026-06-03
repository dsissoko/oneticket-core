---
name: oneticket-vitest-for-vite-react-primer
description: Bridge React + Primer with Vitest runtime smoke tests, reusing frontend-runtime-sanity while keeping tests robust when @primer/react imports CSS.
---

# Primer + Vitest Runtime Sanity

## Objective

Provide a **repeatable way** to combine:
- A React + Vite frontend using `@primer/react` (Primer), and
- the Vitest-based runtime smoke test described in `local/frontend-runtime-sanity`,

so that:
- the app can freely use Primer in runtime code, and
- the **runtime smoke test** stays simple and stable, without being blocked by `@primer/react` internal CSS imports.

This skill does **not** replace `frontend-runtime-sanity` — it **specializes** it for the React + Primer stack.

---

## Scope

- Stack: React + `@primer/react` + Vite + TypeScript.
- Tests: Vitest + Testing Library (`test:smoke`), JSDOM environment.
- Focus: interaction between `@primer/react` (design system) and Vitest in a Node environment.

Out of scope:
- E2E tests (covered by `e2e-for-playwright` + `anthropics/e2e-python-for-playwright`),
- MSW configuration (covered by `openclaw/msw-for-js-ts` + `msw-setup-for-vite-react-primer`),
- global architecture (covered by `architecture-for-vite-react-primer`).

---

## Core Principles

1. **HTML for layout, Primer for controls**
   - Follow `bas/design-for-vite-react-primer`:
     - global layout and structure → HTML + project CSS,
     - interactive controls (buttons, inputs, status labels, spinners) → `@primer/react`.

2. **Minimal Primer surface in the smoke test**
   - The smoke test's goal is not to test Primer, but to verify that **the app and its environment** start without crashing.
   - Avoid letting `@primer/react` internal CSS imports cause Vitest to fail.

3. **Reuse `frontend-runtime-sanity`**
   - Keep the test structure required by that skill (Vitest + `test:smoke`),
   - apply its "UI libraries that import CSS" guidance, specialized here for Primer.

---

## Pattern A — Primer-independent smoke test (recommended)

1. **Minimal smoke test**
   - Create a test file (e.g. `src/App.test.tsx`) that:
     - does **not** import `@primer/react` directly,
     - uses a mock component to verify that Vitest + JSDOM + Testing Library are wired correctly.

   Example:
   ```ts
   import { render } from '@testing-library/react'
   import { describe, it } from 'vitest'

   const MockApp = () => <div>app</div>

   describe('smoke', () => {
     it('test runner is configured', () => {
       render(<MockApp />)
     })
   })
   ```

2. **Real runtime**
   - The real app (entrypoint, features, theming, MSW) continues to use Primer freely.
   - The build command (`npm run build`) remains the strong validation that everything compiles, including Primer.

3. **When to apply this pattern**
   - When a Primer CSS import (`dist/*.css`) causes `Unknown file extension ".css"` errors in Vitest,
   - or when a full mock of `@primer/react` would be too fragile to maintain.

---

## Pattern B — Targeted Primer mock in Vitest (advanced option)

Use this when the smoke test needs to mount the real `App` that uses Primer:

1. In `src/test/setup.ts`:
   - **Mock `@primer/react`** with `vi.mock('@primer/react', () => ({ ... }))` for the components used by the smoke test (Button, TextInput, etc.),
   - return simple HTML wrappers that import no Primer CSS.

2. Essential rules:
   - The `vi.mock` factory must be **synchronous** (no `async` or dynamic imports),
   - it must return only the exports needed by the tested code,
   - it must not re-import the real module (otherwise Primer CSS re-enters the pipeline).

3. This pattern is more powerful but also more fragile — reserve it for cases where Pattern A is not sufficient.

---

## Process

1. **Follow `frontend-runtime-sanity`**
   - Install Vitest + Testing Library,
   - configure `vite.config.ts` (`test.environment = 'jsdom'`, `globals = true`, `setupFiles`),
   - add the `test` and `test:smoke` scripts.

   When `@primer/react` is in the project, extend `src/test/setup.ts` with this polyfill — `CSS.supports` is not implemented in jsdom and `@primer/react` calls it at runtime:

   ```typescript
   import '@testing-library/jest-dom'

   // Polyfill CSS.supports for jsdom — required by @primer/react
   if (typeof window !== 'undefined' && !window.CSS) {
     Object.defineProperty(window, 'CSS', {
       value: { supports: () => false },
       writable: true,
     })
   } else if (typeof window !== 'undefined' && !window.CSS.supports) {
     window.CSS.supports = () => false
   }
   ```

   Do not use `window as any` — `Object.defineProperty` is natively typed and avoids the `@typescript-eslint/no-explicit-any` ESLint error.

2. **Choose the smoke test pattern**
   - Default: Pattern A (Primer-independent smoke test).
   - Pattern B only if a User Story explicitly requires a smoke test on the real Primer `App`.

3. **Always run** after significant changes, as required by `AGENTS.md` and `frontend-runtime-sanity`:
   - build command
   - `test:smoke` command

---

## Rules

- Do not accumulate hacks in Vite/Vitest config: Primer adaptations must live in this skill and/or `src/test/setup.ts`.
- Do not block an iteration because a design system imports CSS: adapt the smoke test (Pattern A) or mock Primer (Pattern B).
- Use in conjunction with:
  - `bas/design-for-vite-react-primer` for UI design,
  - `bagustris/style-for-vite-react-primer` for style consistency,
  - `vitest-for-vite-react-primer` to keep runtime tests simple and robust.
