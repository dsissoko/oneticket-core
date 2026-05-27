# AGENTS

## Team

| Agent | Responsabilité |
|---|---|
| `@po` | Base de connaissance produit, epics, user stories, backlog |
| `@architect` | Architecture, C4, slices d'implémentation |
| `@dev` | Implémentation du code |
| `@qa` | Tests, qualité, revue de code |
| `@analyst` | Analyse métier, modélisation du domaine |
| `@user` | Validation, décision finale, fourniture de contexte |

---

## Routing vs Handoff

- **handoff** : passer la main définitivement en postant un commentaire `@agent ...` — l'agent destinataire a la responsabilité complète, aucun retour attendu, s'arrêter après
- **routing** : sous-traiter une question en postant un commentaire `@agent ...` — l'agent destinataire répond par commentaire uniquement, le demandeur garde la responsabilité

---

## Matrice

| Situation | De | Vers | Type |
|---|---|---|---|
| Spec produit complète, architecture à produire | `@po` | `@architect` | handoff |
| Spec validée, prête à implémenter | `@po` | `@dev` | handoff |
| Décision technique bloquante | `@dev` | `@architect` | routing |
| PR prête à valider | `@dev` | `@qa` | handoff |
| PR validée, prête à merger | `@qa` | `@user` | handoff |
| Décision finale, merge | tout agent | `@user` | handoff |

---

## Mode

### autonomous_mode: true
Apply the routing and handoff matrix above by posting a comment and request to the targeted agent.

### autonomous_mode: false
Handoff to `@user` and propose the routing and handoff you would have applied in autonomous mode.
Reference agent names without `@` in backticks : `architect`, `dev`, `qa` — never unformatted.

`@user` ne déclenche pas de dispatch — c'est un signal d'attente humaine.

---

## Writing documentation

Documentation files under `docs_path` are rendered by Astro Starlight via `link-docs.mjs`.
The script extracts the page title from the first `# H1` — it is fully idempotent and regenerates the site from scratch on every build.

Rules:
- Every `.md` file must start with a descriptive `# H1` that names the specific content — not a generic title like "User Story" or "Epic". Example: `# US-001 — Game Setup` instead of `# User Story`, `# Epic 0 — MVP Breakout` instead of `# Epic`.
- Use `##` and below for sections — never use `#` again after the opening H1.
- `README.md` files are automatically renamed to `index.md` by the build pipeline.
- Mermaid diagrams are supported — use a fenced code block with `mermaid` language identifier.
- Sources under `docs_path` are never modified by the pipeline — only the generated site is affected.

---

## Response Channel

Always use the command provided in `## Agent contract` of the prompt — it is already set to the correct channel for the current `origin_type`.

| origin_type | Channel |
|---|---|
| `issue_comment` | `gh issue comment` |
| `pull_request_comment` | `gh pr comment` |
| `pull_request_review_comment` | `gh api .../pulls/.../comments` with `in_reply_to` |
