# US-003 — Multi-Trigger Support

## Story

As a developer,
I want to invoke `@role` from a GitHub issue comment, a PR conversation comment, or a PR review (inline or body),
so that agents respond in the appropriate channel for each context.

## Status

✅ Done — delivered in `v1.0.0`

## Trigger Map

Three workflows handle all entry points — no overlap:

| Workflow | GitHub event | Condition |
|---|---|---|
| `on-issue-comment.yml` | `issue_comment` | `issue.pull_request == null` |
| `on-pr-comment.yml` | `issue_comment` | `issue.pull_request != null` |
| `on-pr-review.yml` | `pull_request_review: submitted` | always |

## The 4 UX Cases

### Case 1 — Issue comment

User posts `@role <request>` in the comment thread of a GitHub issue.

- Workflow: `on-issue-comment.yml`
- Response: `gh api .../issues/{N}/comments` → appears on the issue thread

---

### Case 2 — PR conversation comment

User posts `@role <request>` in the **Conversation tab** of a pull request.

- Workflow: `on-pr-comment.yml`
- `head.ref` resolved via API → `issue_number` extracted from `feature/issue-N`
- Response: `gh api .../issues/{N}/comments` → appears in PR Conversation tab

---

### Case 3 — Inline diff comment (no pending review)

User clicks the `+` icon on a diff line → types `@role <request>` → clicks **"Comment"**.

GitHub auto-creates and submits a single-comment review → emits `pull_request_review: submitted`.

- Workflow: `on-pr-review.yml` → `dispatch-review-agents.mjs`
- 1 thread detected, last comment starts with `@role` → 1 agent dispatched
- Response: `gh api .../pulls/{N}/comments --field in_reply_to={thread_root_id}` → appears inline in the diff thread
- **DO NOT use other command** — `gh pr comment` or `gh issue comment` post in the wrong place

---

### Case 4 — Submit review (pending inline comments + body)

User clicks `+` on multiple diff lines → types comments → clicks **"Add review comment"** (no event emitted yet) → clicks **"Submit review"** with optional `@role` in the review body.

GitHub emits `pull_request_review: submitted` with all pending inline comments attached.

- Workflow: `on-pr-review.yml` → `dispatch-review-agents.mjs`
- For each inline thread: checks last comment → if starts with `@role` → dispatch inline agent
- For review body: if starts with `@role` → dispatch agent in PR Conversation tab
- All agents dispatched in parallel (`Promise.all`)

**Important UX note:** "Add review comment" (pending state) emits **no event** — agent response is deferred until Submit review.

## Routing Logic in `dispatch-review-agents.mjs`

```
GET /pulls/{N}/comments?pull_request_review_id={review_id}
  → group by thread_root_id
  → for each thread:
      last = thread sorted by created_at desc [0]
      if last.body starts with @ → parseComment → dispatch inline agent
  → if review_body starts with @ → dispatch PR conversation agent
  → Promise.all(all dispatches)
```

## Response Commands

| Context | Command |
|---|---|
| Issue comment | `gh api repos/{repo}/issues/{N}/comments --method POST` |
| PR conversation | `gh api repos/{repo}/issues/{N}/comments --method POST` |
| Inline diff reply | `gh api repos/{repo}/pulls/{N}/comments --method POST --field in_reply_to={id}` |

## Acceptance Criteria

**Given** `@role` in an issue comment,
**Then** agent responds on the issue thread.

**Given** `@role` in a PR Conversation tab comment,
**Then** agent responds in the PR Conversation tab.

**Given** `@role` as last comment in an inline diff thread (no pending review),
**Then** agent responds inline in the diff thread via `in_reply_to`.

**Given** a Submit review with N inline threads where last comment starts with `@role` + body with `@role`,
**Then** N inline agents + 1 PR conversation agent are dispatched in parallel.

**Given** a Submit review where no thread last comment starts with `@` and body does not start with `@`,
**Then** no agent is dispatched — `dispatch-review-agents.mjs` logs "nothing dispatched" and exits cleanly.

**Given** "Add review comment" click (pending review, no submit yet),
**Then** no event is emitted — no agent dispatched until Submit review.

## Related

- [Slice 1 — From GitHub comment to agent prompt](../../../how/slices/slice-1-dispatch.md)
- `src/dispatch-review-agents.mjs`
- `src/agent-dispatch.mjs` — `buildPrompt()`
- `.github/workflows/on-pr-review.yml`
