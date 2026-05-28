# US-006 — Issue Lifecycle Labels

## Use Case

- **As a** developer using OneTicket
- **I want to** see the current state of an issue reflected by a GitHub label at all times
- **so that** I can instantly identify which issues need my attention without reading comments or checking Actions runs

## Acceptance Criteria

- **Scenario:** Agent dispatched
- **Given:** A developer posts `@role` on an issue
- **When:** `agent-dispatch.mjs` dispatches the agent
- **Then:** The issue is labeled `in progress`

---

- **Scenario:** Pipeline completes — PR ready
- **Given:** All tasks in the manifest are done
- **When:** `orchestrate.mjs` creates the final PR
- **Then:** The issue is labeled `ready for review` and `in progress` is removed

---

- **Scenario:** Merge conflict
- **Given:** A task branch cannot be merged into the feature branch
- **When:** `orchestrate.mjs` detects a git conflict
- **Then:** The issue is labeled `merge error` — human intervention required

---

- **Scenario:** Agent definitively failed
- **Given:** The agent has failed `retry_max` times consecutively
- **When:** `retry-dispatch.mjs` reaches the retry limit
- **Then:** The issue is labeled `blocked` — human intervention required

## Label Reference

| Label | Color | Posed by | Removed by | Meaning |
|---|---|---|---|---|
| `in progress` | `0075ca` blue | `agent-dispatch.mjs` at dispatch | `orchestrate.mjs` at final PR | Pipeline is running |
| `ready for review` | `0e8a16` green | `orchestrate.mjs` at final PR | Human at merge | PR is ready — human review needed |
| `merge error` | `b60205` red | `orchestrate.mjs` at git conflict | Human | Unresolvable merge conflict — human must intervene |
| `blocked` | `d93f0b` orange | `retry-dispatch.mjs` at retry max | Human | Agent definitively failed — human must investigate |

## Implementation Notes

- Labels are created automatically in the repo if they do not exist (`ensureLabel` in `src/utils.mjs`)
- `applyLabel` and `removeLabel` are shared utilities in `src/utils.mjs` — used by all scripts
- Labels are applied via the GitHub REST API using `ONETICKET_GH_PAT`
- `merge error` and `blocked` are never removed automatically — they require explicit human action
- `in progress` is removed only on success (final PR created) — it stays if the pipeline fails
