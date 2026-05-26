# US-001 — Direct Agent Response

## Story

As a developer,
I want to invoke `@po` on a GitHub issue with a question or analysis request,
so that I receive a direct GitHub comment response without triggering a pipeline.

## Status

✅ Done — delivered in `v0.1.0`

## Expected Behavior

- Commenting `@po <question>` on a GitHub issue triggers `on-issue-comment.yml`
- `agent-dispatch.mjs` parses the role, resolves project context, builds the system prompt
- The agent reads the request, classifies it as a question (no manifest needed)
- The agent posts a GitHub comment prefixed with `**[Agent: @po]**`
- No manifest is created, no branch is created beyond `feature/issue-N`, no FAN-OUT occurs

## Acceptance Criteria

**Given** a GitHub issue exists and `current_project` is set in `config.yml`,
**When** a developer comments `@po <question>` on the issue,
**Then** the agent posts a GitHub comment with a relevant answer within the GitHub Actions run duration.

**Given** the agent has completed its response,
**When** the job ends,
**Then** no `manifest.json` is present in `.oneticket/tasks/issue-N/` and no FAN-OUT workflow is triggered.

**Given** the comment does not start with `@`,
**When** the issue_comment event fires,
**Then** the Comment Dispatcher skips the job without dispatching any agent.

## Related Slices

- [Slice 1 — From GitHub comment to agent prompt](../../../how/slices/slice-1-dispatch.md)
