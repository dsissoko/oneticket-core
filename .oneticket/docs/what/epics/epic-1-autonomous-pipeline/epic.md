# Epic 1 — Autonomous Pipeline

## Goal

Enable fully autonomous agent-to-agent chaining — from doc production to implementation — controlled by `autonomous_mode` in `config.yml`. In simulated mode (`false`), agents propose routing and handoff decisions with backtick references. In autonomous mode (`true`), the same rules trigger real GitHub invocations, automatic merges, and chained issue creation.

## Business Value

Eliminates human coordination overhead for bounded, validated scenarios. A single `@po` invocation can produce the full knowledge base, have it quality-reviewed, merged, and trigger implementation — without manual intervention at each step.

## Scope

**In scope:**
- `autonomous_mode` switch and its behavioral impact on all agents
- Routing and handoff matrix enforcement in both modes
- Agent profiles awareness of autonomous mode
- Quality sequence after doc pipeline (analyst review → po summary → merge)
- `@leaddev` profile for implementation decomposition
- Auto-creation of implementation issue after doc merge in autonomous mode

**Out of scope:**
- UI/dashboard for autonomous pipeline monitoring
- Multi-project autonomous pipelines
- Rollback mechanisms after autonomous merge

## Related User Stories

- [US-006 — Autonomous Mode Switch and Simulated Routing](./user-stories/us-006-autonomous-mode-switch.md)
- [US-007 — Agent Profiles with Routing/Handoff Awareness](./user-stories/us-007-agent-profiles-routing-handoff.md)
- [US-008 — Quality Sequence, Auto-Merge and Implementation Trigger](./user-stories/us-008-quality-sequence-merge-impl.md)
- [US-009 — @leaddev Profile — Implementation Decomposition](./user-stories/us-009-leaddev-profile.md)
- [US-010 — Auto-Creation of Implementation Issue After Doc Merge](./user-stories/us-010-auto-implementation-issue.md)

## Related Slices

To be derived once architecture and US are validated.
