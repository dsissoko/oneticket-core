# US-004 — Initialize OneTicket Pipeline

## Story

As a developer, I want to initialize the OneTicket pipeline for my new project so that agents can start working on it immediately.

## Expected Behavior

- `.oneticket/config.yml` updated with `current_project: {project}`
- `apps/{project}/docs/` initialized with the standard documentation structure
- CI/CD workflow recognizes the new project
- Preview and production URLs work for the new project

## Open Question — Tooling Form

The implementation of this initialization is not yet decided. Candidates:

- **Deterministic script** — `node src/init-app.mjs {project}` that copies AppShell, updates config, initializes doc structure
- **Agentique skill** — `oneticket-init-appshell` loaded by `@po` that executes the steps via agent actions
- **Hybrid** — deterministic copy script + agent for doc initialization and customization

Decision to be made at implementation time. See `run/appshell-reuse.md` for the operational runbook.

## Acceptance Criteria

- [ ] `current_project` updated in `.oneticket/config.yml`
- [ ] `apps/{project}/docs/` initialized with `what/`, `how/`, `ship/`, `run/` structure
- [ ] CI workflow deploys app to `https://dsissoko.github.io/oneticket-core/{project}/app/`
- [ ] CI workflow deploys docs to `https://dsissoko.github.io/oneticket-core/{project}/docs/`
- [ ] Agent dispatch recognizes `{project}` as `current_project`
