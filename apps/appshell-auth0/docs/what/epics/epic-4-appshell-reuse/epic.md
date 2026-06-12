# Epic 4 — AppShell Reuse

## Goal

Enable developers to create a new application from AppShell quickly and correctly, with minimal manual steps.

## Status

🔲 Planned

## Business Value

- **Zero setup time** — a new project based on AppShell should be running in minutes, not hours
- **Consistency** — every derived app starts from the same proven foundation
- **Reduced human error** — initialization steps are automated or clearly documented

## Scope

- Copy the AppShell skeleton to a new project directory
- Customize branding and placeholders (app name, About/Help screen content)
- TypeScript configuration reference for manual setup or troubleshooting
- Initialize the OneTicket pipeline for the new project (`config.yml`, `current_project`)

## Implementation — Open Question

The form of the initialization tooling is not yet decided:

- **Option A — Deterministic script** — a shell/Node script called via a GitHub Actions workflow, similar to how doc templates are copied today
- **Option B — Agentique workflow** — a skill (`oneticket-init-appshell`) that an agent executes step by step
- **Option C — Hybrid** — deterministic copy + agent for customization

The decision will be made when this epic is implemented. US-004 carries this decision.

## Related User Stories

- [US-001 — Copy AppShell Skeleton](user-stories/us-001-copy-skeleton.md)
- [US-002 — Customize Branding and Placeholders](user-stories/us-002-customize-placeholders.md)
- [US-003 — TypeScript Configuration Reference](user-stories/us-003-typescript-config.md)
- [US-004 — Initialize OneTicket Pipeline](user-stories/us-004-init-pipeline.md)
