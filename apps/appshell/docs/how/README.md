---
title: How — Technical Architecture
---

# How — AppShell Technical Architecture

The `how/` section describes the technical architecture and implementation approach for AppShell.

## Quick Navigation

- **[Architecture](./architecture.md)** — System design, technical decisions, and component boundaries
- **[C4 Diagrams](./c4/)** — Visual models of system structure, containers, and components
- **[Implementation Slices](./slices/)** — Vertical slices guiding incremental development

## AppShell Architecture Overview

AppShell is the reference skeleton for OneTicket app projects. It enforces:

- **Exclusive file ownership** — eliminating merge conflicts by assigning each file to exactly one owner
- **Design tokens** — ensuring visual consistency across the entire UI
- **Conventions** — standardized patterns for screens, components, and state management

The architecture separates concerns across UI, domain rules, validation, API integration, and view models, enabling teams to work in parallel with minimal friction.

See [architecture.md](./architecture.md) for the full technical specification.
