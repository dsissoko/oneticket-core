<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

# Slice 2 — Home Screen

Home screen implementation: theme picker, mode selector, Start button, and AppShell nav adaptation.

## Context

Epic: [Epic 0 — MVP Flashcard App (World Capitals)](epic-0-mvp/epic.md)

User Story: [US-001 — Home Screen Theme and Mode Selection](us-001-home-screen.md)

## Files

| File | Purpose |
|---|---|
| `src/screens/HomeScreen.tsx` | Theme picker, mode selector, Start button — navigates to /session |
| `src/App.tsx` | AppShell nav adaptation: keep Home, About; remove Help, Demo |

## Implementation

- Implement ThemePicker component showing "World Capitals"
- Implement ModeSelector component showing "flip" (default)
- Start button uses routing to navigate to /session
- Adapt AppShell navigation: retain Home and About routes
- Expose selected theme and mode via context or props for downstream slices

## Verification

- Home screen renders theme picker with World Capitals
- Mode selector shows "flip"
- Start button navigates to /session on tap/click
- Navigation reflects AppShell adaptation

## Related Epics

[Epic 0 — MVP](../epics/epic-0-mvp/epic.md)

## Related User Stories

[US-001 — Home Screen Theme and Mode Selection](../us-001-home-screen.md)