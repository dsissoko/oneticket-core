# US-006 — Autonomous Mode Switch and Simulated Routing/Handoff

## Story

As a team using OneTicket, I want to control whether agents propose or execute routing and handoff decisions, so that I can operate in supervised mode during setup and switch to fully autonomous mode when confident.

## Expected Behavior

### As-is — autonomous_mode: false (simulated mode)

- `autonomous_mode: false` is set in `.oneticket/config.yml`
- `AGENTS.md` defines the routing/handoff matrix for all agents
- When an agent reaches a routing or handoff decision point, it **proposes** the action in its GitHub comment using backtick references — never triggers a real invocation:
  ```
  Prochaine étape suggérée : handoff vers `architect` pour la documentation technique.
  ```
- This behavior applies in all contexts: doc production, code implementation, question answering
- `@user` reads the proposal and manually posts `@architect ...` to trigger the next agent

### To-be — autonomous_mode: true (autonomous mode)

- `autonomous_mode: true` is set in `.oneticket/config.yml`
- Same routing/handoff matrix in `AGENTS.md` — no change to the rules
- When an agent reaches a routing or handoff decision point, it **executes** the action by posting a real GitHub comment `@architect ...`
- The next agent is automatically dispatched by the pipeline
- The switch from false to true is the only required change — agent profiles and AGENTS.md are identical in both modes

## Acceptance Criteria

**Given** `autonomous_mode: false` and an agent reaching a handoff point,
**When** the agent responds,
**Then** the response contains backtick references (`architect`, `dev`) but no `@agent` invocation, and no new dispatch is triggered.

**Given** `autonomous_mode: true` and an agent reaching a handoff point,
**When** the agent responds,
**Then** the response contains a real `@agent` comment that triggers a new dispatch.

**Given** any agent in any context (doc, code, question),
**When** `autonomous_mode` is changed in `config.yml`,
**Then** the behavioral change applies without modifying any agent profile or AGENTS.md.

## Key Files

- `.oneticket/config.yml` — `autonomous_mode` switch
- `.oneticket/AGENTS.md` — routing/handoff matrix
- `src/agent-dispatch.mjs` — injects `autonomous_mode` into `## Mode` of every prompt
