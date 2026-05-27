---
name: oneticket-structure-for-vite-react-primer
description: Minimal monorepo layout for this template, with explicit frontend/backend separation under apps/<current_project>/ and integration with product-spec.md, architecture.md, and docs/.
---

# Monorepo Simple Structure

## Objective

Define a **minimal monorepo layout** for this project with:

- an `apps/<current_project>/frontend/` directory for the React app,
- an `apps/<current_project>/backend/` directory reserved for a future backend,
- specifications centralized in `<docs_path>/`,
- full compatibility with `AGENTS.md`, `product-spec.md`, and `architecture.md`.

This skill is inspired by `monorepo-spec-kit-structure` but **only adopts directory structure conventions**.  
It does **not** prescribe tooling (Nx, Turborepo, workspaces, CI, etc.) or extra complexity.

---

## Existing conventions (from this template)

The following conventions are **authoritative**:

- `AGENTS.md` at repository root = main agent rules.
- `<docs_path>/product-spec.md` = product vision, scope, roadmap.
- `<docs_path>/architecture.md` = minimal stack, application architecture, quality/tooling.
- `<docs_path>/` = single place for detailed specifications.
- `skills/` = all skills (local and external) live here.
- `apps/<current_project>/` = application code for the active project (read `project_name` from `.oneticket/config.yml`).

No additional sources of truth are introduced (e.g. no `CLAUDE.md`, no `specs/overview.md`, no `specs/architecture.md`).

---

## Target monorepo layout

Once the monorepo structure is in place, the target layout is:

```text
/
  AGENTS.md
  agents/
    config.yml        ← project_name: <current_project>
  docs/
    <current_project>/
      product-spec.md
      architecture.md
      epics/         ← epics and user stories
      technical/     ← C4 diagrams
  skills/
    ... (local and external skills)
  apps/
    <current_project>/
      frontend/       ← React/Vite app
        AGENTS.md     (optional, frontend-specific rules)
        package.json
        src/
        ...
      backend/        ← future backend
        AGENTS.md     (optional, backend-specific rules)
        ...
```

### Key points

- `apps/<current_project>/frontend/` contains **all frontend code** (e.g. a React SPA).
- `apps/<current_project>/backend/` is **reserved** for a future backend (API, services, etc.), even if initially empty.
- `<docs_path>/` remains the **only** place for detailed specs.
- Multiple apps can coexist under `apps/` — one app is active at a time, defined by `project_name` in `.oneticket/config.yml`.
- Root `AGENTS.md` stays the global reference; `AGENTS.md` under `apps/<current_project>/frontend/` or `apps/<current_project>/backend/` may refine rules **without contradicting** the root.

---

## Placement rules

When creating or modifying files:

1. **Application code**
   - UI, frontend logic, frontend assets → always under `apps/<current_project>/frontend/`.
   - API / domain services / jobs, etc. → under `apps/<current_project>/backend/` (when it exists).

2. **Specifications**
   - Product specs, use cases, APIs, flows, UI, infra → under `<docs_path>/`.
   - `product-spec.md` and `architecture.md` are high-level synthesis documents under `<docs_path>/`.

3. **Agent rules**
   - Global rules → root `AGENTS.md` (already present).
   - Frontend-specific conventions → `apps/<current_project>/frontend/AGENTS.md` (optional).
   - Backend-specific conventions → `apps/<current_project>/backend/AGENTS.md` (optional, later).

---

## Progressive migration (when code already lives at repo root)

If frontend code already exists at the repository root (e.g. `src/`, `package.json`) or under `frontend/`:

1. **Do not infer intentions silently**  
   Always check `<docs_path>/product-spec.md` / `architecture.md` and the product goals first.

2. **Plan an explicit migration**  
   - Move code into `apps/<current_project>/frontend/`.
   - Update paths and scripts accordingly.

3. **Keep it simple**  
   - Do not introduce workspaces or advanced monorepo tooling unless explicitly requested in `architecture.md`.
   - The goal is a clear `apps/<current_project>/frontend/` / `apps/<current_project>/backend/` layout.

---

## Out of scope

This skill **does not cover**:

- workspace configuration (npm, pnpm, yarn, Nx, Turborepo, etc.),
- CI/CD, caching, multi-project pipelines,
- detailed API or database conventions.

For those topics, either:

- describe them in `<docs_path>/architecture.md`, or
- create dedicated skills (local or external) if/when needed.

