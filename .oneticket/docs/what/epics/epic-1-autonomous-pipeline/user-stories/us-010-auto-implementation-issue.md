# US-010 — Auto-Creation of Implementation Issue After Doc Merge

## Story

As a team using OneTicket in autonomous mode, I want an implementation issue to be automatically created after the doc PR is merged, so that `@leaddev` can start implementation without any manual step.

## Expected Behavior

### autonomous_mode: false

- No auto-creation — `@user` decides when to start implementation
- `@po` summary comment (US-008) suggests invoking `@leaddev` manually

### autonomous_mode: true

After auto-merge of the doc PR:

1. `orchestrate.mjs` creates a new GitHub issue with:
   - **Title:** `feat: implement <current_project>`
   - **Body:**
     ```
     Knowledge base is complete and merged — PR #N.

     docs_path: apps/<project>/docs
     app_path: apps/<project>/app

     ## Sprint content
     <active sprint from docs_path/how/sprints/>

     @leaddev please decompose and implement.
     ```
2. The issue creation triggers `agent-dispatch.mjs` via `on-issue-comment.yml`
3. `@leaddev` is dispatched with its full profile and the issue context
4. `@leaddev` reads `docs_path/how/sprints/` and produces an implementation manifest

### Issue body generation

The body is built deterministically by `orchestrate.mjs`:
- `current_project` and `docs_path` from `config.yml`
- Sprint content from `docs_path/how/sprints/` — directory listing, not LLM-generated
- The `@leaddev` invocation at the end triggers the dispatch

## Acceptance Criteria

**Given** doc PR merged in `autonomous_mode: true`,
**When** merge completes,
**Then** a new GitHub issue is created with the implementation context and `@leaddev` invocation.

**Given** the new implementation issue created,
**When** `agent-dispatch.mjs` processes the `@leaddev` comment,
**Then** `@leaddev` is dispatched with its full profile on a new `feature/issue-N` branch.

**Given** `autonomous_mode: false`,
**When** doc PR is created,
**Then** no implementation issue is auto-created — `@user` decides.

**Given** `docs_path/how/sprints/` is empty at merge time,
**When** the implementation issue is created,
**Then** the body notes that the sprint is missing and `@leaddev` should ask `@po` to create it first.

## Key Files

- `src/orchestrate.mjs` — auto-merge + issue creation after all tasks done
- `.oneticket/config.yml` — `autonomous_mode`, `current_project`
- `.oneticket/agents/leaddev.agent.md` (see US-009)
