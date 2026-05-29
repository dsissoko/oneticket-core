# US-005 — Agent Profile and Skill Extension

## Story

As a tech lead,
I want to define custom agent profiles and skills for my team,
so that I can extend the framework with domain-specific behavior without modifying the core pipeline.

## Status

✅ Done — delivered in `v0.1.0`

## Expected Behavior

- Agent profiles are Markdown files with APM-compatible frontmatter placed in `.oneticket/agents/<role>.agent.md`
- A profile declares: `name`, `description`, `model`, identity, skill loading rules, responsibilities, key processes
- Skills are Markdown files placed in `.oneticket/skills/<name>/SKILL.md`
- Skills contain declarative instructions only — no control flow logic
- `oneticket-install.mjs` installs `.oneticket/skills/` into `.agents/skills/` at CI runtime, making skills natively discoverable by opencode before the agent run
- 10 framework skills are provided out of the box: `oneticket-manifest-generation`, `oneticket-init-knowledge`, `oneticket-doc-structure`, `oneticket-c4`, `oneticket-vertical-slice`, `oneticket-epic-breakdown`, `oneticket-epic-hypothesis`, `oneticket-jobs-to-be-done`, `oneticket-user-story`, `oneticket-user-story-splitting`
- APM integration is planned for V1 — local skills persist alongside APM-distributed skills

## Acceptance Criteria

**Given** a file `.oneticket/agents/dev.agent.md` with valid frontmatter (`name: dev`),
**When** a developer comments `@dev <request>` on an issue,
**Then** the agent is invoked with the `dev` profile loaded in the system prompt.

**Given** a file `.oneticket/agents/unknown.agent.md` does not exist,
**When** a developer comments `@unknown <request>`,
**Then** `agent-dispatch.mjs` throws an explicit error and no agent is dispatched.

**Given** a skill file `.oneticket/skills/my-skill/SKILL.md` exists,
**When** `oneticket-install.mjs` runs in CI,
**Then** the skill is available at `.agents/skills/my-skill/SKILL.md` before the agent run.

**Given** the `@po` profile loads `oneticket-manifest-generation` before producing a manifest,
**When** the agent produces a manifest,
**Then** the manifest follows the exact JSON DAG format defined in the skill.

**Given** a skill wraps an external source ("wrapper"),
**Then** its frontmatter must declare: `source: external`, `source_url`, `source_skill`, and `install_native`.

Example:
```yaml
---
name: oneticket-react-best-practices
source: external
source_url: https://github.com/vercel-labs/agent-skills
source_skill: react-best-practices
install_native: npx skills add vercel-labs/agent-skills --skill react-best-practices
---
```

## Related Slices

- [Slice 1 — From GitHub comment to agent prompt](../../../how/slices/slice-1-dispatch.md)
