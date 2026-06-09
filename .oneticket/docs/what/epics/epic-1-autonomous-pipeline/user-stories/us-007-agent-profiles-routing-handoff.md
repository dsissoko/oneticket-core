# US-007 — Agent Profiles with Routing/Handoff Awareness

## Story

As a team using OneTicket, I want each agent profile to correctly implement the routing and handoff matrix in both simulated and autonomous mode, so that agent-to-agent chaining works consistently regardless of the context (doc, code, question).

## Expected Behavior

### As-is — all profiles

- Every profile has `## Routing` and `## Handoff` sections pointing to `.agents/AGENTS.md`
- Every profile has `### Team` in `## Identity` pointing to `.agents/AGENTS.md`
- In `autonomous_mode: false`, agents propose routing/handoff with backtick references
- The `## Mode` section is injected by `agent-dispatch.mjs` into every prompt

### To-be — profiles must respect autonomous_mode

- In `autonomous_mode: false`:
  - `@po` — after manifest execution, proposes handoff to `analyst` or `architect` with backticks
  - `@analyst` — after producing doc files, proposes handoff to `po` for summary
   - `@architect` — after producing architecture/C4, proposes handoff to `po` for sprint Technical Notes
  - `@qa` — after reviewing a PR, proposes handoff to `user` with findings
  - `@dev` — after completing implementation, proposes handoff to `qa`

- In `autonomous_mode: true`:
  - Same agents execute real `@agent` invocations instead of proposals

### Special focus — @qa and @analyst

- `@qa` — reviews PRs (code or doc), posts structured findings (blockers, warnings, approvals)
- `@analyst` — performs surface quality control on doc: coherence, richness, structure, H1 presence, SITE_DESCRIPTION filled

## Acceptance Criteria

**Given** any agent profile and `autonomous_mode: false`,
**When** the agent reaches a handoff point,
**Then** the response uses backtick references without triggering a real dispatch.

**Given** any agent profile and `autonomous_mode: true`,
**When** the agent reaches a handoff point,
**Then** the response posts a real `@agent` comment that triggers the next dispatch.

**Given** `@analyst` reviewing a doc pipeline output,
**When** invoked for surface quality control,
**Then** it checks coherence between product-spec, US and architecture, verifies H1 presence, SITE_DESCRIPTION, and internal links — and posts a structured comment with findings.

**Given** `@qa` reviewing a PR,
**When** invoked after implementation,
**Then** it posts structured findings with blockers, warnings, and an explicit approval or rejection.

## Key Files

- `.oneticket/agents/po.agent.md`
- `.oneticket/agents/architect.agent.md`
- `.oneticket/agents/dev.agent.md`
- `.oneticket/agents/qa.agent.md`
- `.oneticket/agents/analyst.agent.md`
- `.oneticket/AGENTS.md`
