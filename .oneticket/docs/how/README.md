# How

The `how/` section describes the technical solution implementing the product needs defined in `what/`.

It defines:
- the global architecture,
- the system structure,
- the technical boundaries,
- the components,
- the interfaces,
- the integration patterns,
- the implementation sprints.

This section describes:
- how the system is designed,
- how responsibilities are distributed,
- and how product capabilities are implemented.

Main architectural views are documented using C4-style models:
- system context,
- containers,
- components,
- deployment views.

Implementation work is progressively planned and delivered using sprints.

A sprint represents:
- a time-boxed iteration,
- a selection of user stories from the backlog,
- a set of technical notes added by @architect,
- the unit of delivery tracked via a GitHub Milestone.

Architectural decisions are documented as ADRs (Architecture Decision Records),
referenced from the sprint they belong to.

The `how/` section remains independent from specific delivery pipelines or runtime operations.

## Templates

- Architecture: `.oneticket/templates/architecture.md`
- Sprint: `.oneticket/templates/sprint.md`
- ADR: `.oneticket/templates/adr.md`
