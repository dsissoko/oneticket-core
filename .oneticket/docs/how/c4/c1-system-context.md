# C1 — System Context

## Summary

High-level view of OneTicket and its external actors and systems.

## Diagram

```mermaid
C4Context
  title System Context — OneTicket Core

  Person(developer, "Developer / Tech Lead", "Invokes agents via GitHub issue comments, reviews PRs")
  Person(entrepreneur, "Entrepreneur", "Describes product intent in natural language, validates deliverables")
  Person(editor, "OneTicket Editor", "Maintains agent profiles and skill catalog")

  System(oneticket, "oneticket-core", "GitHub-native multi-agent orchestration framework — deterministic pipeline, agent profiles, skills")

  System_Ext(github, "GitHub", "Issues, Actions runners, API, Pull Requests, GitHub Pages")
  System_Ext(opencode, "opencode / anomalyco", "LLM invocation runtime — generates content inside agent-execute jobs")
  System_Ext(apm, "APM — Microsoft Agent Package Manager", "Versioned skill and agent profile distribution — planned V1")
  System_Ext(llm, "LLM Providers", "minimax, claude, gemini, etc. — accessed via opencode zen")

  Rel(developer, oneticket, "Invokes agents via @role comments")
  Rel(entrepreneur, oneticket, "Describes intent, validates PRs")
  Rel(editor, oneticket, "Publishes profiles and skills")
  Rel(oneticket, github, "Reads events, creates branches/PRs, posts comments, runs workflows")
  Rel(oneticket, opencode, "Dispatches agent prompts via anomalyco action")
  Rel(opencode, llm, "Routes requests to LLM providers")
  Rel(apm, oneticket, "Installs versioned skills and profiles at CI runtime")
```

## Notes

- APM integration is planned for V1 — profiles and skills are currently installed via `oneticket-install.mjs` at CI runtime
- LLM provider is configurable via `config.yml` — `opencode/minimax-m2.7` is the current default
- GitHub is the only required external dependency for V1 — no cloud infrastructure needed
