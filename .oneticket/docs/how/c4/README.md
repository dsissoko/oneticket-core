# C4 Architecture Diagrams

Architecture is documented using the [C4 model](https://c4model.com) — a pragmatic,
hierarchical approach to visualising software at four levels of abstraction.
Created by Simon Brown, it answers a simple question at each level:
where does the system sit, what does it contain, and how is it structured inside?

Diagrams here are written in [Mermaid C4 syntax](https://mermaid.js.org/syntax/c4.html)
and rendered directly in this site — no separate tooling needed to read them.

## Tools & Resources

- [c4model.com](https://c4model.com) — the official C4 model site, with notation, examples and FAQ
- [Mermaid C4 syntax](https://mermaid.js.org/syntax/c4.html) — how to write C4 diagrams in Mermaid
- [Structurizr DSL editor](https://structurizr.com/dsl) — online editor for C4 diagrams using the Structurizr DSL (more expressive than Mermaid, great for larger models)
- [Structurizr Lite](https://docs.structurizr.com/lite) — self-hosted single-workspace version, free, runs as a Docker container

## Diagrams

- **[C1 — System Context](./c1-system-context)** — OneTicket in its environment : humans, GitHub, LLMs
- **[C2 — Containers](./c2-containers)** — major runtime components and their interactions
- **[C3 — Components](./c3-components)** — internal structure of the orchestration engine
