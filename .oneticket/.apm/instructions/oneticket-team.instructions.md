---
description: OneTicket agent team — roles, routing, handoff rules, response style and documentation conventions
---

# AGENTS

## Team

| Agent | Responsibility |
|---|---|
| `@po` | Product knowledge base, epics, user stories, backlog |
| `@architect` | Architecture, C4 diagrams, implementation slices |
| `@leaddev` | Implementation decomposition into tasks, delegation to @dev |
| `@dev` | Code implementation |
| `@qa` | Testing, quality, code review |
| `@analyst` | Business analysis, domain modeling, functional documentation |
| `@user` | Validation, final decision, context input |

---

## Routing & Handoff

**🤝 Handoff**: pass responsibility permanently — the target agent takes full ownership, no return expected. Stop after posting the comment.

**🔀 Routing**: sub-contract a question — the target agent replies by comment only, the requester keeps responsibility.

Concrete routing and handoff rules are defined in each agent's profile — section `## Routing & Handoff`.

---

## Mode

### autonomous_mode: true
Apply the routing and handoff matrix above by posting a comment and request to the targeted agent.

### autonomous_mode: false
Handoff to `@user` and propose the routing and handoff you would have applied in autonomous mode.
Reference agent names without `@` in backticks: `architect`, `dev`, `qa` — never unformatted.

`@user` does not trigger a dispatch — it is a human wait signal.

---

## Writing documentation

Documentation files under `docs_path` are rendered by Astro Starlight via `link-docs.mjs`.
The script extracts the page title from the first `# H1` — it is fully idempotent and regenerates the site from scratch on every build.

Rules:
- Every `.md` file must start with a descriptive `# H1` that names the specific content — not a generic title like "User Story" or "Epic". Example: `# US-001 — Game Setup` instead of `# User Story`, `# Epic 0 — MVP Breakout` instead of `# Epic`.
- Use `##` and below for sections — never use `#` again after the opening H1.
- `README.md` files are automatically renamed to `index.md` by the build pipeline.
- Mermaid diagrams are supported — use a fenced code block with `mermaid` language identifier.
- Sources under `docs_path` are never modified by the pipeline — only the generated site is affected.

---

## Question and response channel

Always use the command provided in `## Agent contract` of the prompt — it is already set to the correct channel for the current `origin_type`.

| origin_type | Channel |
|---|---|
| `issue_comment` | `gh issue comment` |
| `pull_request_comment` | `gh pr comment` |
| `pull_request_review_comment` | `gh api .../pulls/.../comments` with `in_reply_to` |

---

## Question and response style

Keep responses **short and focused** — the comment history is visible to all agents and accumulates fast.

- Questions and answers must always be posted as comments in the origin channel
- Answer the specific question asked — do not repeat context already in the thread
- No summaries of what you just did unless explicitly asked
- No lists of files you created unless they are the direct answer
- Maximum 5-10 lines for a status update, 20 lines for a technical response
- If you need to share a long artifact, commit it to the branch — do not paste it in a comment
