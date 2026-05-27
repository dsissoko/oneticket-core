---
name: oneticket-stack-vite-react-primer
description: Manifest for the vite-react-primer stack - React + Vite + TypeScript + Primer UI + MSW + localStorage.
---
# Skill: stack-vite-react-primer

## Purpose

Manifest for the `vite-react-primer` stack — React + Vite + TypeScript + Primer UI + MSW + localStorage.
This skill defines the canonical `package.json` content, scripts, and project conventions
for all projects using this stack.

All rules from `stack-js-ts` apply in addition to the rules below.

---

## When to apply

Apply when `architecture.md` identifies a React + Vite + Primer UI stack.
This skill is the reference for the Scaffold layer — use it whenever creating or modifying `package.json`.

---

## Canonical `package.json`

When creating or updating `package.json` for this stack, use exactly this structure:

```json
{
  "name": "@<current_project>/frontend",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest run --passWithNoTests",
    "test:smoke": "vitest run --reporter=verbose src/test/smoke",
    "coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@primer/octicons-react": "^19.9.0",
    "@primer/react": "^36.27.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "styled-components": "^6.1.13"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/styled-components": "^5.1.34",
    "@typescript-eslint/eslint-plugin": "^7.13.0",
    "@typescript-eslint/parser": "^7.13.0",
    "@vitejs/plugin-react": "^4.3.1",
    "@vitest/coverage-v8": "^1.6.0",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.7",
    "jsdom": "^24.1.0",
    "typescript": "^5.5.2",
    "vite": "^5.3.1",
    "vitest": "^1.6.0"
  }
}
```

## Rules

- **Never put build/lint/test tools in `dependencies`** — they belong in `devDependencies`
- **`styled-components`** is required by `@primer/react` — always include it in `dependencies`
- **`@primer/css`** is not needed when using `@primer/react` with `styled-components` — do not add it
- **React 18** — do not use React 19 unless `architecture.md` explicitly specifies it
- **`tsc &&`** prefix in the `build` script ensures TypeScript errors are caught before bundling
- **`--max-warnings 0`** in the lint script ensures CI fails on any warning, not just errors
- **`--passWithNoTests`** is mandatory in the `test` script — prevents CI failure during scaffold phase before any test files exist
- **`.gitignore` is mandatory** — create it as the first file of any scaffold, before any other file. Missing `.gitignore` = broken commit. Use the canonical content below.

## Canonical `.gitignore`

Create this file at the root of the frontend project (e.g. `apps/<current_project>/frontend/.gitignore`) **before any other scaffolding step**:

```
# Dependencies
node_modules/

# Build output
dist/
dist-ssr/

# Local env
.env
.env.local
.env.*.local

# Vite cache
.vite/

# Test coverage
coverage/

# Editor
.DS_Store
*.local
```

## `tsconfig.json` canonical content

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## `vite.config.ts` canonical content

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
})
```

**`base` is mandatory** — `process.env.VITE_BASE_PATH || '/'` ensures the app loads assets from the correct path when deployed to a sub-path (GitHub Pages PR preview or production). Without it, assets resolve from `/` and the app renders blank on any non-root deployment.

## `src/test/setup.ts` canonical content

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

**Critical:** never use `window as any` or `CSS as any` — `Object.defineProperty` is natively typed and avoids the `@typescript-eslint/no-explicit-any` ESLint error. Copy this block exactly.

---

## Source

Local skill — stack manifest for React + Vite + Primer UI projects.
