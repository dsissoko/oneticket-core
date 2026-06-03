---
name: oneticket-slice-for-vite-react-primer
description: Decompose a user story implementation into sequential technical lots to keep each agent session focused, buildable, and within timeout limits.
---

# Vertical Slice Decomposition

## Purpose

Guide the `/dev` agent in decomposing a user story into small, sequential technical lots before implementing anything.

The fundamental principle:

> The quality of decomposition is often more important than the raw power of the model.

Small models (Minimax, Qwen, Gemma, small Llama) fail when they must maintain a large context, modify many files, or reason across layers simultaneously. Micro-lots reduce context, limit dependencies, and increase success rate.

---

## When to apply

Apply this skill when the user story touches **more than 2 technical layers**.

Technical layers for the `stack-vite-react-primer` stack:

| Layer | Typical files |
|-------|--------------|
| Scaffold | `package.json`, `vite.config.ts`, `tsconfig.json`, `main.tsx`, `src/test/setup.ts`, `src/test/smoke/app.smoke.test.tsx` |
| Model | `src/types/*.ts`, `src/models/*.ts` |
| Service | `src/services/*.ts`, `src/hooks/*.ts` |
| UI | `src/components/*.tsx`, `src/pages/*.tsx`, `src/App.tsx` |
| Tests | `*.test.ts`, `*.test.tsx` |

**If the US touches 1 or 2 layers → implement in one lot, no decomposition needed.**
**If the US touches 3 or more layers → decompose into sequential lots.**

---

## Lot constraints

Each lot must respect:

- **1 objective** — one sentence describing what the lot delivers
- **≤ 3 files** created or modified
- **≤ 200 lines** changed
- **No global refactor** — structural changes only if strictly required by the lot
- **Always deliverable** — the codebase must build AND pass `npm run test:smoke` after the lot

**Special rule for the Scaffold lot:** the smoke test file (`src/test/smoke/app.smoke.test.tsx`) is mandatory — it mounts `<App />` and asserts it does not throw. Without it, `npm run test:smoke` finds no files and exits with code 1, breaking CI.

---

## Dependency-First order

Always implement in this order — never skip a layer to implement a higher one first:

```
1. Scaffold (if not already initialized)
2. Model    (interfaces, types, DTOs)
3. Service  (business logic, storage, hooks)
4. UI       (components, pages, App wiring)
5. Tests    (unit tests per layer, smoke test last)
```

Rationale: small models are unreliable when discovering architecture implicitly. If types and service contracts exist first, UI implementation becomes a simple completion task.

---

## Incremental validation loop

After each lot, before starting the next:

```
Build → Test → Fix → Commit
```

Apply skill `frontend-runtime-sanity` after each lot:
- `npm run build` — blocking if it fails
- `npm run test:smoke` — blocking if it fails

**Never start the next lot if the current one does not build and pass tests.**

---

## Scaffold-First within each lot

Inside a lot, always in this order:

1. Create empty files with the right structure
2. Add TODO comments for logic to implement
3. Add type stubs and function signatures
4. Implement the logic
5. Remove TODOs

Rationale: small models succeed at local completions, not large cognitive jumps.

---

## How to present lots to the user

When decomposition applies, present the full lot plan before acting:

```
## Decomposition plan — <US name>

**Lot 1 — <layer name>**
Objective: <one sentence>
Files: <list>
Validation: npm run build + npm run test:smoke

**Lot 2 — <layer name>**
Objective: <one sentence>
Files: <list>
Depends on: Lot 1
Validation: npm run build + npm run test:smoke

...

**A** — Execute Lot 1 now, wait for confirmation before each subsequent lot
**B** — Execute all lots sequentially without interruption

> If you choose A, I'll do my best to respond as quickly as possible — but each lot may take a few minutes.
```

---

## Mode dégradé (no hooks)

In the current OneTicket v1 architecture, hooks are not enforced technically. This skill operates as a textual constraint — the agent reads and applies the rules by compliance.

When hooks are supported (see issue #52), the lot boundary will be enforced technically via `PreToolUse` hooks blocking edits outside the current lot's file scope.
