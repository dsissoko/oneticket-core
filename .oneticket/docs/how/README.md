# How

The `how/` section describes the technical solution implementing the product needs defined in `what/`.

<!-- pr-preview-test -->

> **🚧 PR PREVIEW — this is a test build from PR #478, not the production site.**

It defines:
- the global architecture,
- the system structure,
- the technical boundaries,
- the components,
- the interfaces,
- the integration patterns,
- the implementation slices.

This section describes:
- how the system is designed,
- how responsibilities are distributed,
- and how product capabilities are implemented.

Main architectural views are documented using C4-style models:
- system context,
- containers,
- components,
- deployment views.

Implementation work is progressively refined using vertical slices.

A slice represents:
- a small,
- testable,
- incremental,
- end-to-end implementation unit.

The `how/` section remains independent from specific delivery pipelines or runtime operations.

## Templates

- Architecture: `.oneticket/templates/architecture.md`
- Slice: `.oneticket/templates/slice.md`
