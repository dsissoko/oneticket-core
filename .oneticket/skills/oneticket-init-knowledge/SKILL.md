---
name: oneticket-init-knowledge
description: Initialize and validate the mandatory knowledge base before any documentation or development cycle. Enforces sequential human-gated validation of product-spec.md, architecture.md, and epic-0-mvp.
compatibility: opencode
---

# oneticket-init-knowledge

Generate the mandatory project knowledge files from all available context.
At each run: read `docs_path` to know what exists, read the issue body and previous comments for available information.
Ask questions only for what is genuinely missing after reading everything.
One run = one manifest produced, or one question set if information is insufficient.

`docs_path` is always provided in the prompt — never resolve it yourself.

---

## Production process

Refer to `oneticket-doc-structure` for all files to produce, their placement and naming conventions, and their templates.

**All 8 steps must be included in a single manifest — never split across multiple runs or handoffs.**

Respect these dependencies when building the manifest:

1. `<docs_path>/what/product-spec.md` — no dependency — role: analyst
2. `<docs_path>/what/epics/epic-0-mvp/epic.md` — depends on product-spec.md — role: analyst
3. `<docs_path>/what/epics/epic-0-mvp/user-stories/us-*.md` — depends on epic.md — role: analyst
4. `<docs_path>/how/architecture.md` — depends on product-spec.md + all us-*.md — role: architect
5. `<docs_path>/how/c4/system-context.md` — depends on architecture.md — role: architect
6. `<docs_path>/how/c4/containers.md` — depends on architecture.md — role: architect
7. `<docs_path>/how/slices/` — depends on architecture.md + all us-*.md — role: architect
   Produce one slice file per implementation unit — the set of slices must cover all user stories.
8. cross-references — depends on ALL slice task IDs from step 7 — role: architect
   Always the last task in the manifest — no exception.
   One single task — read all produced slice files and update:
   - `## Related Slices` in `epic.md`
   - `## Related Slices` in all `us-*.md`
   - `## Related Epics` and `## Related User Stories` in each `slice.md`

   The `depends_on` list must include every slice task ID produced in step 7.

   Cross-reference path table (relative links):

   | From file | To file | Relative path to use |
   |---|---|---|
   | `what/epics/epic-N/epic.md` | `how/slices/slice-N/slice.md` | `../../../how/slices/slice-N-<name>/slice.md` |
   | `what/epics/epic-N/user-stories/us-NNN.md` | `how/slices/slice-N/slice.md` | `../../../../how/slices/slice-N-<name>/slice.md` |
   | `how/slices/slice-N/slice.md` | `what/epics/epic-N/epic.md` | `../../what/epics/epic-N-<name>/epic.md` |
   | `how/slices/slice-N/slice.md` | `what/epics/epic-N/user-stories/us-NNN.md` | `../../what/epics/epic-N-<name>/user-stories/us-NNN-<name>.md` |

---

## Sequence

The goal is to complete the knowledge base under `docs_path`
following the structure defined in ## Production process.

Some files require the expertise of specialized agents to be produced correctly —
architecture.md is better handled by @architect who owns the technical decisions,
product-spec, epics and user stories are better handled by @analyst who owns the functional documentation.
Delegating to the right role produces better results than doing everything yourself.

All content is derived from what the user has provided.
If the available information is not sufficient to produce a file,
use the relevant question set to collect what is missing before producing anything.

Once the information is sufficient, delegate to the most competent role for each file
by producing a manifest as defined in ## Production process — do not create the files directly.
Assign roles to tasks as defined in ## Production process.

---

## Question sets

### For `product-spec.md`

```bash
gh issue comment {issue_number} --repo {repository} --body "**[Agent: \`@po\`]**

Pour générer la spécification produit, j'ai besoin de :

1. Quel est le nom du produit ?
2. Quel problème résout-il, et pour qui ? (2-3 phrases)
3. Quelles sont les 2-3 principales capacités pour la V1 ?
4. Qui sont les principaux utilisateurs ou acteurs ?
5. Y a-t-il des règles métier ou des contraintes à noter dès le départ ?"
```

### For `architecture.md`

```bash
gh issue comment {issue_number} --repo {repository} --body "**[Agent: \`@po\`]**

Pour générer le document d'architecture, j'ai besoin de :

1. Quel est le stack technique ? (langages, frameworks, persistence)
2. Quels sont les principaux composants du système ?
3. Quelles sont les interfaces ou points d'intégration clés ?
4. Y a-t-il des contraintes techniques ou exigences non-fonctionnelles ?"
```

### For `epic-0-mvp/epic.md` and user stories

```bash
gh issue comment {issue_number} --repo {repository} --body "**[Agent: \`@po\`]**

Pour générer l'epic MVP et les user stories, j'ai besoin de :

1. Ce périmètre MVP vous semble-t-il correct ?
   <proposer 2-3 phrases issues de ## Product Capabilities dans product-spec.md>
2. Quelles sont les 2-3 user stories les plus importantes ?
   (Format : En tant que <utilisateur>, je veux <action>, afin de <résultat>)"
```

---

## When all files exist and are valid

```bash
gh issue comment {issue_number} --repo {repository} --body "**[Agent: \`@po\`]**

Base de connaissance complète ✅

- \`what/product-spec.md\`
- \`how/architecture.md\`
- \`what/epics/epic-0-mvp/\` avec les user stories

Prochaines étapes suggérées :
- Décomposer d'autres épics → \`oneticket-epic-breakdown\`
- Documenter l'architecture → \`oneticket-c4\`
- Dériver les slices d'implémentation → \`oneticket-vertical-slice\`"
```

---

## Rules

- Read before writing — never overwrite a valid file
- Never invent content — only use what the human explicitly provided
- Use templates in `.oneticket/templates/` when creating files
- `docs_path` is always provided in the prompt — never resolve it yourself
- One question set per run — do not chain multiple question sets in one run
- When creating `product-spec.md`, replace the `<!-- SITE_DESCRIPTION: ... -->` placeholder with a real one-sentence description of the product (max 160 chars)
- After creating any documentation file, immediately commit and push it:
  ```bash
  git add <file_path>
  git commit -m "docs: add <filename> for <current_project>"
  git push origin <current_branch>
  ```
