---
name: oneticket-init-knowledge
description: Initialize and validate the mandatory knowledge base before any documentation or development cycle. Enforces sequential human-gated validation of product-spec.md, architecture.md, and epic-0-mvp.
compatibility: opencode
---

# oneticket-init-knowledge

Generate the mandatory project knowledge files from all available context.
At each run: read `docs_path` to know what exists, read the issue body and previous comments for available information.
File creation and updates are always done through a manifest — never directly in this session.
Ask questions only for what is genuinely missing after reading everything.
One run = one manifest produced, or one question set if information is insufficient.

`docs_path` is always provided in the prompt — never resolve it yourself.

---

## Files to generate

| File | Purpose |
|---|---|
| `<docs_path>/what/product-spec.md` | Product vision, users, capabilities, business rules |
| `<docs_path>/how/architecture.md` | Technical stack, components, interfaces, constraints |
| `<docs_path>/what/epics/epic-0-mvp/epic.md` | MVP scope and goal |
| `<docs_path>/what/epics/epic-0-mvp/user-stories/us-001-*.md` | MVP user stories |

These files are generated from human answers — never invented, never copied from placeholders.
Use templates in `.oneticket/templates/` when creating files.

---

## Sequence

1. Check which files are missing or empty (read before acting)
2. Post ONE question set for the first missing file using the exact bash command below
3. Done — the human's reply triggers the next run

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
- After creating any documentation file, immediately commit and push it:
  ```bash
  git add <file_path>
  git commit -m "docs: add <filename> for <current_project>"
  git push origin <current_branch>
  ```
