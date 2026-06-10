---
title: 'US-011 — Session Flow with Selected Theme'
---

# US-011 — Session Flow with Selected Theme

## Story

As a learner, I want my study session to use cards from the theme I selected so that I practice the specific category of capitals I chose.

## Expected Behavior

When the user starts a session after selecting a theme, the session screen loads cards exclusively from that theme's dataset. The flip interaction, scoring (Know/Don't Know), progress indicator, and results screen all work correctly with the selected theme's cards.

## Acceptance Criteria

- **Given** the user has selected a theme on the home screen
- **When** the user taps Start
- **Then** the session screen loads cards from the selected theme's dataset only

- **Given** the user is in a session with a selected theme
- **When** the user flips cards and answers
- **Then** scoring and progress tracking work correctly for that theme's cards

- **Given** the user completes a session
- **When** the results screen is displayed
- **Then** the score reflects only the cards from the selected theme

- **Given** the user taps Replay on the results screen
- **Then** a new session starts with the same theme's cards

## Related Epic

[Epic 2 — Theme Reorganization: World Capitals into 12 Themes](epic-2-theme-reorganization/epic.md)

## Related Sprints

<!-- @po fills this section after producing sprints -->
