# US-003 — Multi-Trigger Support

## Story

As a developer,
I want to invoke `@role` from a GitHub issue comment, a PR comment, or an inline PR review comment,
so that agents respond in the appropriate channel for each context.

## Status

✅ Done — delivered in `v0.1.0`

## Expected Behavior

- **Issue comment** → `on-issue-comment.yml` → agent responds via `gh issue comment`
- **PR comment** → `on-pr-comment.yml` → agent responds via `gh pr comment`
- **Inline review comment** → `on-pr-review-comment.yml` → agent replies inline via `gh api .../comments --field in_reply_to=<comment_id>`
- Each trigger passes `ORIGIN_TYPE` as an environment variable to `agent-dispatch.mjs`
- `buildPrompt()` injects the exact response command for the detected origin type in `## Agent contract`
- The agent never guesses the response channel — it reads the exact command from the prompt

## Acceptance Criteria

**Given** a developer comments `@po <question>` on a GitHub issue,
**When** the agent responds,
**Then** the response appears as a comment on the issue, not on a PR.

**Given** a developer comments `@po <question>` on a PR (not inline),
**When** the agent responds,
**Then** the response appears as a PR comment via `gh pr comment`.

**Given** a developer comments `@po <question>` on a specific line in a PR diff,
**When** the agent responds,
**Then** the response appears as an inline reply in the same review thread via `gh api in_reply_to`.

**Given** a PR comment that does not start with `@`,
**When** the PR comment event fires,
**Then** the PR Comment Dispatcher skips the job without dispatching any agent.

## Related Slices

- [Slice 1 — From GitHub comment to agent prompt](../../../how/slices/slice-1-dispatch.md)
