---
title: 'US-010 — Update Theme Picker with 12 Themes'
---

# US-010 — Update Theme Picker with 12 Themes

## Story

As a learner, I want to see all 12 themed datasets in the theme picker on the home screen so that I can choose which category of capitals to study.

## Expected Behavior

The home screen theme picker displays all 12 themes with clear, readable labels. The user can select one theme before starting a session. The previous single "World Capitals" option is replaced by the 12 themed options.

## Acceptance Criteria

- **Given** the user is on the home screen
- **When** the theme picker is displayed
- **Then** all 12 themes are visible with descriptive labels (Africa, Asia, Europe East, Europe West, North America, South America, Australia, Antarctica, BRICS Alliance, NATO Alliance, 20 biggest GDP, 20 lowest GDP)

- **Given** the user is on the home screen
- **When** a theme is selected
- **Then** the selected theme is highlighted or visually indicated

- **Given** no theme has been selected yet
- **When** the home screen loads
- **Then** a default theme is pre-selected (e.g., Africa or first in list)

## Related Epic

[Epic 2 — Theme Reorganization: World Capitals into 12 Themes](epic-2-theme-reorganization/epic.md)

## Related Sprints

<!-- @po fills this section after producing sprints -->
