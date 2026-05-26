# Slice 1 — From GitHub Comment to Agent Prompt

## Goal

Deliver a fully formed system prompt to `agent-execute.yml` from a raw GitHub comment containing `@role`, with all project context resolved deterministically.

## Status

✅ Done — delivered in `v0.1.0`

## Related Epics

- [Epic 0 — GitHub-Native Agent Pipeline](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-001 — Direct agent response](../../what/epics/epic-0-mvp/user-stories/us-001-direct-agent-response.md)
- [US-003 — Multi-trigger support](../../what/epics/epic-0-mvp/user-stories/us-003-multi-trigger.md)
- [US-004 — Project context isolation](../../what/epics/epic-0-mvp/user-stories/us-004-project-context.md)
- [US-005 — Agent profile and skill extension](../../what/epics/epic-0-mvp/user-stories/us-005-agent-profile-skills.md)

## Impacted Components

- `on-issue-comment.yml` / `on-pr-comment.yml` / `on-pr-review-comment.yml` — trigger workflows
- `src/agent-dispatch.mjs` — entry point, prompt builder
- `src/config.mjs` — config loader
- `.oneticket/agents/<role>.agent.md` — agent profile
- `.oneticket/config.yml` — source of truth

## Interfaces

**Input (environment variables from trigger workflow):**
```
COMMENT_BODY         — raw comment text containing @role
ISSUE_NUMBER         — GitHub issue number
REPO                 — owner/repo
GITHUB_TOKEN         — PAT
CONTEXT_BLOCK        — base64-encoded context (title, body, diff hunk)
ORIGIN_TYPE          — issue_comment | pull_request_comment | pull_request_review_comment
PR_NUMBER            — (PR triggers only)
REPLY_TO_COMMENT_ID  — (inline review trigger only)
```

**Output (dispatched to agent-execute.yml):**
```
prompt        — full system prompt (profile + language + mode + project context + agent contract + request)
branch        — feature/issue-N
role          — parsed @role
model         — from config.yml agent_config.<cli>.model
```

## Sequence Flow

```
GitHub event (issue_comment / pull_request_review_comment)
        │
        ▼
Trigger workflow (on-issue-comment.yml etc.)
    ├── Filter: comment starts with @  AND  correct issue/PR type
    ├── Build CONTEXT_BLOCK (base64 — title, body, diff hunk)
    └── Set ORIGIN_TYPE, PR_NUMBER, REPLY_TO_COMMENT_ID
        │
        ▼
agent-dispatch.mjs
    ├── parseComment()        → extracts role + request from COMMENT_BODY
    ├── loadConfig()          → reads .oneticket/config.yml
    ├── loadProfile()         → reads .oneticket/agents/<role>.agent.md
    ├── resolveProjectContext() → docs_path + app_path from current_project
    │       ├── absent  → error comment + exit(1)
    │       ├── empty   → Gate 0 comment + exit(0)
    │       └── set     → docs_path + app_path resolved
    ├── setupGit()            → configures git identity
    ├── create feature/issue-N branch (if not exists)
    └── buildPrompt()
            ├── FIRST ACTION git checkout (anomalyco switched=true)
            ├── Agent profile content
            ├── ## Language (if set)
            ├── ## Mode (autonomous_mode)
            ├── ## Project context (issue_number, repo, docs_path, app_path, current_project)
            ├── ## Agent contract (ALWAYS respond + exact gh command per ORIGIN_TYPE)
            └── ## Request + CONTEXT_BLOCK
        │
        ▼
dispatchWorkflow('agent-execute.yml', { prompt, branch, role, model })
```

## Observability Impact

- Gate 0 violations post a GitHub comment on the issue — visible to the developer
- Profile not found throws an explicit error in the Actions log
- Prompt length logged: `[agent-dispatch] Prompt built (N chars)`
