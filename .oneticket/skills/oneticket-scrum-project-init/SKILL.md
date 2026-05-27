---
name: oneticket-scrum-project-init
description: Initialize a GitHub Project v2 with a structured Scrum backlog - epics, user stories, and sprint planning.
compatibility: opencode
---
# Skill: scrum-project-init

## Purpose

Initialize a GitHub Project v2 with a structured Scrum backlog (epics + user stories)
from existing product knowledge and specs.

Invoked via natural language by the `/po` agent — e.g. "/po initialise le projet GitHub".

---

## Important: stateless execution

This skill is invoked multiple times across a dialogue. At each invocation, the agent
must re-read the issue history (provided in context) to determine the current step
in the process. Never assume state from a previous run.

The process has 5 sequential gates. Identify which gate was last completed and resume
from the next one.

---

## Gate 1 — Precondition check

Read `business.md` and `architecture.md`.

A file is considered **valid** if it:
- exists and is not empty
- contains concrete, product-specific content (not just placeholders or generic text)
- for `business.md`: has a real Vision statement, at least one Product feature, and a Roadmap with phases
- for `architecture.md`: has a defined stack, a project structure, and quality/tooling decisions

**If either file is missing or invalid:**
- Post a comment in the issue proposing the content you would write for the missing file(s)
- Ask the user to validate or adjust

**⛔ STOP — HARD GATE — DO NOT PROCEED.**
After posting this comment, your run is COMPLETE. Stop all execution immediately.
Do NOT write any file. Do NOT commit. Do NOT create a branch or PR.
Gate 2 will be triggered by the user's next comment validating the proposed content.
There is NOTHING more to do in this run. Post the comment. Stop.

**If both files are valid:** proceed directly to Gate 2 without stopping.
---

## Gate 2 — Discovery + Gap analysis

### Step 2a — Inventory existing specs

Read `docs/specs/functional/` to inventory existing epics and user stories.

- Each subdirectory is an epic (e.g. `epic-01-tags-journal/`)
- Each `epic.md` contains the epic description and scope
- Each `us-<nn>-<name>.md` is a user story

### Step 2b — Gap analysis

Using `deanpeters/epic-breakdown-advisor` patterns and your domain knowledge,
compare the inventory against:
1. `business.md` — Vision, Product features, Roadmap phases
2. `architecture.md` — Technical structure (features, components, quality)
3. Your general knowledge of similar products in this domain

Identify what is **missing** from the backlog relative to what the product
description implies. Apply the epic-breakdown-advisor's 9 splitting patterns
to check whether existing epics are well-split and whether important user
journeys are covered.

**Generate candidate epics/US for functional gaps:**
- An epic is missing if a significant product area described in `business.md`
  has no corresponding epic
- A US is missing if an epic exists but important CRUD operations, workflow
  steps, or user roles are not covered
- Mark all generated items as `[TODO]` — title only, no body required
- Keep scope to Phase 1 unless the user explicitly requests more

**Generate technical epics from `architecture.md` (mandatory):**

Read `architecture.md` and generate one technical epic per significant
infrastructure or tooling area that requires setup work. These epics have
`is_gap: true` and represent the engineering foundation needed before or
alongside functional development.

Derive technical epics by reading the following sections of `architecture.md`:
- **Minimal stack** → one epic for stack initialization (scaffolding, dependencies,
  folder structure, configuration files)
- **Backend / mock layer** → one epic if a backend or mock layer is defined
- **Quality & tooling → Tests** → one epic per test level defined (unit, integration, E2E)
- **Quality & tooling → CI/CD** → one epic if a pipeline or deployment is described
- **Quality & tooling → Theming / design system** → one epic if a UI library or
  theme system is defined

Rules for technical epics:
- Only generate what is explicitly described in `architecture.md`
- Do not invent technical epics not grounded in the actual stack
- Titles must be generic and stack-agnostic at the epic level
  (e.g. "[TODO] Initialisation de la stack technique", not "[TODO] Setup React + Vite")
- US under technical epics may reference specific technologies
  (e.g. "[TODO] Configurer Vite et TypeScript") since they are derived from
  `architecture.md` content, not invented
- Each technical US should be independently deliverable

**If `docs/specs/functional/` is empty or does not exist:**
- Derive all epics from the Roadmap Phase 1 items in `business.md`
- Generate user stories using the epic-breakdown-advisor patterns
- Still generate technical epics from `architecture.md`

**Scope rule:** default to Phase 1 only. Include other phases only if the user
explicitly requests it in the invocation comment or in a subsequent reply.

### Step 2c — Build inventory

Build the complete inventory (existing + gaps):
```
epics:
  - id: epic-01
    title: <title>
    source: specs | derived | gap
    user_stories:
      - id: us-01
        title: <title>
        source: specs | derived | gap
```

The `gap` items will be presented in the Gate 3 dialogue and included in the
plan as `[TODO]` issues with no body content.

**Maximum:** 10 epics, 30 user stories total across all sources.

Proceed to Gate 3.

---

## Gate 3 — Board configuration dialogue

Post a comment in the issue with the following structure (adapt language to match
the language of the issue). Include the gap items in the scope line:

```
## Configuration du projet

Voici ce que je propose pour initialiser le projet. Confirme ou ajuste.

**Nom du projet**
<suggested name derived from business.md Vision>

**Colonnes du board (statuts)**
- Backlog
- Ready
- In Progress
- Review
- Done

**Champs personnalisés**
- Priority (High / Medium / Low)
- Type (Epic / Story / Task)
- Epic (lien vers l'epic parent — utilisé pour grouper les US dans le board)

**Périmètre**
Phase 1 — <N> epics (<X> issues existantes, <Y> gaps [TODO])
Total : <M> user stories (<A> existantes, <B> gaps [TODO])

**Structure visuelle**
Les US seront groupées par Epic dans le board.
Chaque US aura le titre de son epic dans le champ "Epic".

---
Réponds avec tes ajustements ou écris **OK** pour valider.
```

**⛔ STOP — HARD GATE — DO NOT PROCEED.**
After posting this comment, your run is COMPLETE. Stop all execution immediately.
Do NOT move to Gate 4. Do NOT write any file. Do NOT execute any command.
Gate 4 will be triggered by the user's next comment on this issue.
There is NOTHING more to do in this run. Post the comment. Stop.

---

## Gate 4 — Plan A/B

**CRITICAL: Your response at this gate must contain the FULL plan inline.**
**Do NOT summarize. Do NOT say "I have prepared". Show everything.**
**The user must be able to read and validate the complete backlog in this comment.**

Post a detailed plan comment in the issue (same language as the issue).
The comment must contain every epic and every user story explicitly listed:

```
## Plan d'initialisation Scrum

### Project v2
- Nom : <project name>
- Colonnes : Backlog → Ready → In Progress → Review → Done
- Champs : Priority, Type, Epic

### Backlog complet

#### 🔧 Epics techniques

**[TECH-01] <title>**
- [TECH-01-US-01] <title>
- [TECH-01-US-02] <title>

**[TECH-02] <title>**
- [TECH-02-US-01] <title>

#### ✨ Epics fonctionnelles

**[FEAT-01] <title>** *(existant)*
- [FEAT-01-US-01] <title> *(existant)*
- [FEAT-01-US-02] <title> *(existant)*
- [FEAT-01-US-03] [TODO] <title>

**[FEAT-02] <title>** *([TODO])*
- [FEAT-02-US-01] [TODO] <title>

### Ordre de mise en place suggéré

| # | Ref | Epic | Dépend de | Raison |
|---|-----|------|-----------|--------|
| 1 | TECH-01 | <title> | — | <rationale> |
| 2 | TECH-02 | <title> | TECH-01 | <rationale> |
| 3 | FEAT-01 | <title> | TECH-01 | <rationale> |
| 4 | FEAT-02 | <title> | FEAT-01 | <rationale> |

Total : <N> epics (<X> techniques, <Y> fonctionnelles), <M> user stories

---

**A — Exécution complète**
Je crée tout : labels, issues, project, champs, et j'alimente le board.

**B — Première étape seulement**
Je crée uniquement les epics (issues), sans les US ni le project.
Je posterai un résumé et attendrai ta validation pour continuer.

Réponds **A** ou **B** pour lancer l'exécution.
```

**⛔ STOP — HARD GATE — DO NOT PROCEED.**
After posting this comment, your run is COMPLETE. Stop all execution immediately.
Do NOT move to Gate 5. Do NOT write any manifest. Do NOT execute any command.
Gate 5 will only be triggered when the user replies **A** or **B** in a new comment.
There is NOTHING more to do in this run. Post the comment. Stop.

- Reply is **A** → execute full plan (Gate 5, all steps)
- Reply is **B** → execute Gate 5 steps 1–3 only, then post a summary and stop
- Reply is ambiguous → ask for clarification, do not guess

---

## Gate 5 — Produce and upload execution manifest

Build the manifest JSON and upload it as a GitHub Actions artifact so the
post-run step in `run-agent.yml` can execute it deterministically.

### Step 1 — Build the manifest JSON

Build the manifest as a JSON string in memory. Use the same structure as below.
**Epic and US titles must match exactly the names validated in Gate 4.**

```json
{
  "version": "1",
  "type": "scrum-init",
  "issue_number": 93,
  "project_name": "<current_project>",
  "mode": "A",
  "epics": [
    {
      "title": "[TECH-01] Initialisation de la stack technique",
      "is_gap": true,
      "user_stories": [
        { "title": "[TECH-01-US-01] Initialiser le projet frontend", "is_gap": true },
        { "title": "[TECH-01-US-02] Configurer le backend mocké", "is_gap": true }
      ]
    },
    {
      "title": "[FEAT-01] Tags sur les entrées du journal",
      "is_gap": false,
      "user_stories": [
        { "title": "[FEAT-01-US-01] Ajouter un tag sur une entrée", "is_gap": false },
        { "title": "[FEAT-01-US-02] Supprimer un tag sur une entrée", "is_gap": false },
        { "title": "[FEAT-01-US-03] [TODO] Afficher tous les tags existants", "is_gap": true }
      ]
    }
  ],
  "planning": [
    {
      "order": 1,
      "epic_title": "[TECH-01] Initialisation de la stack technique",
      "type": "technical",
      "rationale": "Débloque toutes les autres epics — doit être livré en premier",
      "depends_on": []
    },
    {
      "order": 2,
      "epic_title": "[FEAT-01] Tags sur les entrées du journal",
      "type": "functional",
      "rationale": "Fonctionnalité principale, dépend de la stack",
      "depends_on": ["[TECH-01] Initialisation de la stack technique"]
    }
  ]
}
```

### Step 2 — Write the manifest to disk

Use your Bash tool to write the manifest file in the current working directory.
The `RUN_ID` is available from the environment variable `$GITHUB_RUN_ID`.

```bash
cat > "manifest-${GITHUB_RUN_ID}.json" << 'EOF'
{ ... your manifest JSON here ... }
EOF
```

The post-run step in the active runner (`run-agent-anomalyco.yml` or `run-agent-generic-cli.yml`)
reads the manifest directly from the workspace filesystem — no artifact upload needed.

### Step 3 — Post a confirmation comment

After uploading, post a brief confirmation on the issue:

```bash
gh issue comment {issue_number} \
  --body "Manifest généré et uploadé. Le job d'initialisation va démarrer automatiquement."
```

### Rules

- `type` must be `"scrum-init"` — used by the post-run step to identify the correct handler
- `issue_number`: exact number of the current issue (from context)
- `project_name`: use `current_project` from the prompt context
- `mode`: `"A"` for full execution, `"B"` for epics only (user_stories = `[]`)
- `is_gap: true` on gap items — bash will create them with a `[TODO]` label
- Valid JSON — no trailing commas, no unescaped quotes

---

## Rules

- Never create more than 10 epics and 30 user stories in a single init
- Use `business.md`, `architecture.md`, `docs/specs/`, and domain knowledge for gap analysis
- Always respond in the same language as the issue
