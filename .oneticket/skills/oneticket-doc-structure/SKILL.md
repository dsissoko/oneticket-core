---
name: oneticket-doc-structure
description: Know and maintain the documentation structure for any project managed by OneTicket. Use to initialize, complete, or extend project documentation.
version: 1.0.0
---

# doc-structure

## Purpose

This skill gives the agent full knowledge of the documentation structure used by OneTicket projects.

Use it to:
- initialize a documentation structure that does not exist yet,
- add a missing artifact (epic, user story, slice, etc.),
- complete or extend an existing structure,
- verify that a document is in the right place.

The agent never resolves `docs_path` — it is always provided in the prompt as a resolved value.

---

## Reference Structure

Every project documentation lives under `<docs_path>/` with the following structure:

```
<docs_path>/
├── what/
│   ├── README.md
│   ├── product-spec.md
│   └── epics/
│       └── epic-0-mvp/
│           ├── epic.md
│           └── user-stories/
│               ├── us-001-<name>.md
│               └── us-002-<name>.md
├── how/
│   ├── README.md
│   ├── architecture.md
│   ├── c4/
│   │   ├── system-context.md
│   │   ├── containers.md
│   │   ├── components.md
│   │   └── deployment.md
│   └── slices/
│       └── slice-1-<name>/
│           └── slice.md
├── ship/
│   └── README.md
└── run/
    └── README.md
```

---

## Section Roles

| Section | Describes |
|---|---|
| `what/` | Product and business needs — technology-agnostic |
| `what/product-spec.md` | Global product vision |
| `what/epics/` | Functional epics and their user stories |
| `how/` | Technical solution implementing `what/` |
| `how/architecture.md` | Macro architecture |
| `how/c4/` | C4 architectural views |
| `how/slices/` | Vertical implementation slices |
| `ship/` | Build, packaging, CI/CD, release pipelines |
| `run/` | Infrastructure, operations, observability |

---

## File Templates

All templates are located in `.oneticket/templates/`:

| Document | Template |
|---|---|
| Product specification | `.oneticket/templates/product-spec.md` |
| Architecture | `.oneticket/templates/architecture.md` |
| Epic | `.oneticket/templates/epic.md` |
| User Story | `.oneticket/templates/us.md` |
| Slice | `.oneticket/templates/slice.md` |

Always use the corresponding template when creating a new document.
Copy the template content and fill in the sections — never create a document from scratch.

---

## Placement Rules

| Artifact | Location |
|---|---|
| Product specification | `<docs_path>/what/product-spec.md` |
| Epic | `<docs_path>/what/epics/epic-N-<name>/epic.md` |
| User Story | `<docs_path>/what/epics/epic-N-<name>/user-stories/us-NNN-<name>.md` |
| Architecture | `<docs_path>/how/architecture.md` |
| C4 system context | `<docs_path>/how/c4/system-context.md` |
| C4 containers | `<docs_path>/how/c4/containers.md` |
| C4 components | `<docs_path>/how/c4/components.md` |
| C4 deployment | `<docs_path>/how/c4/deployment.md` |
| Slice | `<docs_path>/how/slices/slice-N-<name>/slice.md` |

---

## Naming Conventions

| Artifact | Pattern | Example |
|---|---|---|
| Epic directory | `epic-N-<kebab-name>` | `epic-0-mvp`, `epic-1-authentication` |
| User Story file | `us-NNN-<kebab-name>.md` | `us-001-login.md`, `us-002-logout.md` |
| Slice directory | `slice-N-<kebab-name>` | `slice-1-user-login`, `slice-2-dashboard` |

Numbers are zero-padded: `epic-0`, `epic-1`, `us-001`, `us-002`, `slice-1`, `slice-2`.

---

## Initialization

If the documentation structure does not exist yet at `<docs_path>`:

1. Run: `node src/init-doc.mjs <docs_path>`
   This creates the base directory structure with README files and empty placeholders.

2. Then create the content files as needed (product-spec, epics, architecture, etc.)
   using the templates in `.oneticket/templates/`.

---

## Completion

If the structure already exists at `<docs_path>`:

- Create only what is missing.
- Never overwrite existing content.
- Use the templates for any new document.
- Respect naming conventions and placement rules.

---

## Rules

- Never overwrite an existing file — always check before writing.
- Never create a document without using its template.
- Always place documents in their canonical location.
- Never invent content — only what the user explicitly provided.
- `docs_path` is always provided in the prompt — never resolve it yourself.
