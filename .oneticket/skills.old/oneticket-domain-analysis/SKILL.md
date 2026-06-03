---
name: oneticket-domain-analysis
description: Analyze a business domain to identify entities, relationships, rules, and process flows.
compatibility: opencode
---

## Configuration

`docs_path` and `current_project` are always provided in the prompt — never resolve them yourself.

## Purpose

Produce a structured analysis of a business domain by identifying its key entities, relationships, business rules, and process flows. The output feeds `product-spec.md` and provides the raw material for `@po` to structure into epics and user stories.

Use this skill when:
- A new feature area needs to be understood before spec writing
- Business requirements are vague or ambiguous
- Gaps exist between the described domain and existing specs in `<docs_path>/what/epics/`
- A process needs to be mapped before implementation

## Key Concepts

### Entities
The core objects of the domain (users, resources, states, events). Each entity has:
- **Identity** — what makes it unique
- **Attributes** — its properties
- **Lifecycle** — its possible states and transitions

### Relationships
How entities interact:
- **Association** — entity A relates to entity B (1-to-1, 1-to-many, many-to-many)
- **Dependency** — entity A requires entity B to exist
- **Aggregation** — entity A is composed of entity B

### Business Rules
Constraints and invariants that govern the domain:
- Validation rules (what is allowed)
- Computation rules (how values are derived)
- Process rules (what must happen in what order)

### Process Flows
The sequence of steps actors take to accomplish a goal:
- **Happy path** — the standard, expected flow
- **Alternative paths** — valid variations
- **Exception paths** — error and edge cases

## Process

1. **Read existing context**
   - Read `<docs_path>/what/product-spec.md` for product vision and existing domain knowledge
   - Read `<docs_path>/how/architecture.md` for technical constraints
   - Read `<docs_path>/what/epics/` for existing functional scope

2. **Identify the domain scope**
   - Name the domain area being analyzed
   - List the actors involved (users, external systems, agents)
   - Define the boundaries (what is in scope vs. out of scope)

3. **Map entities and relationships**
   - List all domain entities
   - Define their attributes and lifecycle states
   - Map relationships between entities

4. **Extract business rules**
   - List validation constraints
   - Identify computed or derived values
   - Note ordering and sequencing requirements

5. **Produce process flows**
   - Draw the happy path as a Mermaid flowchart or sequence diagram
   - Note alternative and exception paths

6. **Identify gaps**
   - Compare the domain model against existing specs in `<docs_path>/what/epics/`
   - List missing specs, ambiguous requirements, or undocumented rules

7. **Propose output**
   - Post findings as a structured comment — never modify files without human validation
   - Suggest updates to `<docs_path>/what/product-spec.md` or new spec fragments for `@po`

## Output Format

```markdown
## Domain Analysis — [Domain Name]

### Actors
- [Actor 1] — [role description]
- [Actor 2] — [role description]

### Entities
| Entity | Key Attributes | States |
|--------|---------------|--------|
| [Name] | [attr1, attr2] | [state1, state2] |

### Relationships
- [Entity A] → [Entity B] : [relationship type and cardinality]

### Business Rules
1. [Rule description]
2. [Rule description]

### Process Flow (happy path)
[Mermaid diagram]

### Gaps Identified
- [Gap 1 — missing spec / ambiguous requirement]
- [Gap 2]
```

## Rules

- Never fabricate domain knowledge — only model what is described or observable
- Always identify the source of each business rule (stated requirement, inferred, assumption)
- Mark assumptions explicitly — they require human validation
- Mermaid diagrams are preferred for process flows — keep them simple and readable
- The output is a proposal — never commit changes without explicit human validation
