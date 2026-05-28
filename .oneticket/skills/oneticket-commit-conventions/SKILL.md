---
name: oneticket-commit-conventions
description: Commit message conventions for OneTicket — types, scopes, and release-please effects. Use when writing any commit in a OneTicket project.
source: local
---

# OneTicket Commit Conventions

## Purpose

Enforce consistent commit messages that drive automated versioning via release-please.
The framework changelog (`oneticket-core`) must only contain changes to the framework itself — never app code, pipeline tasks, or manifests.

## Format

```
<type>(<scope>): <short description>
```

## Scopes

| Scope | What it covers |
|---|---|
| `apps` | Any change under `apps/**` or `.oneticket/tasks/**` — app code, manifests, workflow files produced by the pipeline |
| `orchestrate` | Changes to `src/orchestrate.mjs` or related pipeline orchestration |
| `agents` | Changes to `.oneticket/agents/**` or `.oneticket/AGENTS.md` |
| `skills` | Changes to `.oneticket/skills/**` |
| `ci` | Changes to `.github/workflows/**` |
| `docs` | Changes to `.oneticket/docs/**` or `apps/**/docs/**` |
| `config` | Changes to `.oneticket/config.yml`, `release-please-config.json`, etc. |

## Types and release-please effects

| Type | When to use | release-please effect |
|---|---|---|
| `feat` | A new framework feature visible to users | MINOR bump |
| `fix` | A framework bug fix | PATCH bump |
| `feat!` or `BREAKING CHANGE:` | A breaking framework change | MAJOR bump |
| `docs` | Documentation only | No bump |
| `chore` | Tooling, config, pipeline internals | No bump |
| `refactor` | Code restructuring, no behavior change | No bump |
| `test` | Adding or updating tests | No bump |
| `ci` | CI/CD changes | No bump |

## OneTicket-specific rules

### Pipeline commits — always `chore(apps):`

These commits are internal to the pipeline and must NEVER appear in the framework changelog:

| Context | Type | Example |
|---|---|---|
| `@dev` task implementation | `chore(apps)` | `chore(apps): complete task F — useSearchEntries hook` |
| `@leaddev` manifest decomposition | `chore(apps)` | `chore(apps): decompose issue #766` |
| Manifest status updates (orchestrate) | `chore(apps)` | `chore(apps): mark task F as done in manifest` |

### Final PR — `feat(apps):`

The PR that closes the issue and merges all tasks appears once in the GitHub PR list. It uses `feat(apps):` so it is identifiable but excluded from the framework changelog via `exclude-paths`:

```
feat(apps): complete all tasks for issue #766
```

### Framework commits — functional scope

Any change to the framework itself uses a functional scope:

```
feat(orchestrate): post pipeline progress comment after each done/merge-failed
fix(ci): guard against invalid branch names in agent-execute workflow
docs(runbooks): add merge conflict recovery runbook
chore(config): exclude apps/ and .oneticket/tasks/ from release-please
```

## What never appears in the framework changelog

- `chore(apps):` — ignored by release-please (chore type)
- `feat(apps):` — ignored by release-please via `exclude-paths: ["apps/", ".oneticket/tasks/"]`
- Any commit touching only `apps/**` or `.oneticket/tasks/**`

## Examples

```
# Framework features — appear in changelog
feat(orchestrate): add progress bar comment after each done/merge-failed
feat(agents): add @leaddev — implementation planner
fix(ci): fix build-app — always use npm directly
docs(runbooks): add merge conflict recovery runbook

# App pipeline — never in changelog
chore(apps): complete task F — useSearchEntries hook
chore(apps): decompose issue #766 — 21 tasks manifest
chore(apps): mark task F as done in manifest
feat(apps): complete all tasks for issue #766
```
