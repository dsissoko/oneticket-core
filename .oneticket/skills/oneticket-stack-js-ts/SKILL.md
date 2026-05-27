---
name: oneticket-stack-js-ts
description: Manifest for the js-ts stack - JavaScript/TypeScript projects regardless of framework or build tool.
---
# Skill: stack-js-ts

## Purpose

Manifest for the `js-ts` stack — JavaScript/TypeScript projects regardless of framework or build tool.
This skill defines the rules and conventions common to all JS/TS projects in this repository.

---

## When to apply

Apply when `architecture.md` identifies a JavaScript or TypeScript project.
This skill is a prerequisite for all more specific stacks (`stack-vite-react-primer`, etc.).

---

## Language and runtime rules

- **Language**: TypeScript preferred over JavaScript for all new files
- **Module system**: ESM (`"type": "module"` in `package.json`) — never CommonJS unless the project explicitly requires it
- **Target**: `ES2022` minimum in `tsconfig.json`
- **Strict mode**: `"strict": true` in all `tsconfig.json` files

## Type safety rules

- No `any` — use `unknown` and narrow explicitly
- No non-null assertion (`!`) unless the null case is structurally impossible
- Exported functions must have explicit return types
- Prefer `type` over `interface` for object shapes unless extension is needed

## Code style rules

- Named exports preferred over default exports
- No barrel files (`index.ts` re-exporting everything) unless explicitly required
- File names: `kebab-case.ts` for modules, `PascalCase.tsx` for React components
- Maximum line length: 100 characters

## Package management rules

- Package manager: **npm** (not yarn, not pnpm, unless `architecture.md` specifies otherwise)
- Lock file (`package-lock.json`) must be committed
- `devDependencies` rule: **all build tools, linters, test runners, and type definitions go in `devDependencies`** — never in `dependencies`
- `dependencies` rule: only packages required at runtime in production

## Versioning rules

- Versions pinned with `^` (compatible minor updates) — never `*` or `latest`
- Do not upgrade versions unless explicitly requested

---

## Source

Local skill — stack manifest for JS/TS projects.
