---
title: 'US-014 — Solfège Theme Integration in ThemePicker'
---

# US-014 — Solfège Theme Integration in ThemePicker

## Story

As a learner, I want to select the Solfège theme from the home screen theme picker so that I can start a solfège study session.

## Expected Behavior

The solfège theme appears in the `ThemePicker` on the home screen alongside the existing 14 themes. The theme name is displayed bilingually (FR/EN). Selecting it and starting a session loads the 21 solfège cards. The session flow (flip, score, results) works unchanged.

The theme is registered in `useTheme.ts` by importing `solfege.json` and adding it to the `themes` array.

## Acceptance Criteria

- Solfège theme visible in `ThemePicker` on home screen
- Theme name: "Solfège" (FR) / "Solfège" (EN) — consistent bilingual label
- Selecting solfège and starting a session loads all 21 cards
- Session flip, score, and results flow work without modification
- Existing tests unaffected — no changes to test files for other themes
- `useTheme.ts` imports `solfege.json` and includes it in the `themes` array
- Build passes with `npm run build`

## Related Epic

[Epic 3 — Solfège Theme](epic-3-solege-theme/epic.md)

## Related Sprints

[Sprint 3 — Solfège Theme](sprint-3-solege-theme/sprint.md)
