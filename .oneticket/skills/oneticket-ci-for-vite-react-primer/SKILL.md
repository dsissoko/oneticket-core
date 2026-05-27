---
name: oneticket-ci-for-vite-react-primer
description: Create and maintain the frontend CI workflow based on the stack defined in architecture.md
---

# CI Workflow Manager

## Purpose

Create and maintain `.github/workflows/frontend-vite-react.yml` based on the stack defined in `docs/<current_project>/architecture.md`.

This skill is applied by `/dev` when initializing the first frontend implementation, and by `/architect` when the stack evolves.

---

## When to apply

Apply this skill when:
- `/dev` is implementing the first frontend user story AND `architecture.md` defines a React + Vite stack AND `.github/workflows/frontend-vite-react.yml` does not exist yet
- `/architect` updates the stack in `architecture.md` AND the existing workflow needs to be updated

Do NOT apply if:
- The workflow already exists and the stack has not changed
- The stack is not `stack-vite-react-primer`

---

## Supported stack

This skill covers the `stack-vite-react-primer` stack only:
- React 18 + Vite + TypeScript + Primer UI
- npm as package manager
- Vitest for tests
- ESLint for linting
- `apps/<current_project>/frontend/` as the working directory

For other stacks, create a dedicated workflow and document it in `architecture.md`.

---

## Workflow structure

The workflow `.github/workflows/frontend-vite-react.yml` follows this sequential structure:

```
npm ci → npm run lint → npm run test → npm run build → deploy
```

Single job — no parallelization. Simple to maintain, sufficient for V1.

**Triggers:**
- `push` on `main` paths `apps/*/frontend/**` → production deploy to `<current_project>/app/`
- `pull_request` (opened/synchronize/reopened) paths `apps/*/frontend/**` → PR preview to `<current_project>/pr/<N>/app/`
- `pull_request` (closed) → cleanup preview

**Single parameter:** `project_name` read from `.oneticket/config.yml` via `yq`.

---

## Rules

- Never modify this workflow directly on `main` — always via a PR
- The workflow file lives in `.github/workflows/frontend-vite-react.yml`
- If the stack changes, propose a new workflow adapted to the new stack — do not patch the existing one beyond recognition
- `VITE_BASE_PATH` must match the GitHub Pages URL structure:
  - PR preview: `/<repo>/<current_project>/pr/<N>/app/`
  - Production: `/<repo>/<current_project>/app/`
  `vite.config.ts` must consume it via `base: process.env.VITE_BASE_PATH || '/'` — canonical definition in `stack-vite-react-primer`.
