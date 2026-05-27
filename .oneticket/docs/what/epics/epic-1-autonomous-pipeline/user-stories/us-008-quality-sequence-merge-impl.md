# US-008 — Quality Sequence, Auto-Merge and Implementation Trigger

## Story

As a team using OneTicket, I want the pipeline to automatically run a quality check after doc production, summarize the result, and trigger implementation — so that the transition from knowledge base to code is seamless and controlled.

## Expected Behavior

### Quality sequence — both modes

After all doc tasks are done and the final PR is created:

1. `@analyst` is invoked to perform a surface quality control on the PR:
   - Coherence between product-spec, epics, US and architecture
   - Content richness — no empty sections, no placeholder text
   - Structure — H1 present on all files, SITE_DESCRIPTION filled in product-spec
   - Internal links — US reference epics, slices reference US and architecture
2. `@analyst` posts a structured quality comment on the issue with findings
3. Handoff to `@po`
4. `@po` posts a summary comment on the issue with:
   - PR reference
   - Quality summary from `@analyst`
   - Explicit go/no-go signal

### autonomous_mode: false

- `@po` summary comment proposes next action to `@user`:
  ```
  PR #N est prête. Qualité validée par `analyst`.
  Prochaine étape suggérée : merger la PR puis invoquer `leaddev` pour l'implémentation.
  Décision → `user`
  ```
- `@user` merges manually and posts `@leaddev ...`

### autonomous_mode: true

- If quality check passes → auto-merge the PR (no conflicts, no blockers)
- After merge → auto-create a new implementation issue (see US-010)
- If quality check fails → PR remains open, `@po` posts findings and waits for `@user`

## Acceptance Criteria

**Given** all doc tasks done and PR created,
**When** the pipeline reaches completion,
**Then** `@analyst` is invoked and posts a structured quality comment on the issue.

**Given** `@analyst` quality check passes and `autonomous_mode: false`,
**When** `@po` posts the summary,
**Then** the comment proposes merge and `leaddev` invocation using backticks — no real action taken.

**Given** `@analyst` quality check passes and `autonomous_mode: true`,
**When** `@po` posts the summary,
**Then** the PR is merged automatically and a new implementation issue is created.

**Given** `@analyst` quality check fails (blockers found),
**When** in any mode,
**Then** the PR remains open and `@user` is notified with explicit findings.

## Key Files

- `src/orchestrate.mjs` — post-pipeline quality trigger
- `.oneticket/agents/analyst.agent.md` — surface quality control
- `.oneticket/agents/po.agent.md` — quality summary and go/no-go
