---
title: 'US-009 — Define 12 Themed Capital Datasets'
---

# US-009 — Define 12 Themed Capital Datasets

## Story

As a learner, I want access to themed capital datasets organized by continent and economic alliance so that I can study capitals in focused, meaningful categories.

## Expected Behavior

The app provides 12 distinct themed datasets, each containing relevant country-capital pairs:

1. **Africa** — African country capitals
2. **Antarctica** — Research station territories (educational)
3. **Asia** — Asian country capitals
4. **Europe East** — Eastern European country capitals
5. **Europe West** — Western European country capitals
6. **North America** — North American country capitals
7. **South America** — South American country capitals
8. **Australia** — Oceania/Australia region capitals
9. **BRICS Alliance** — BRICS member country capitals
10. **NATO Alliance** — NATO member country capitals
11. **20 biggest GDP** — Top 20 GDP country capitals
12. **20 lowest GDP** — Bottom 20 GDP country capitals

Each theme contains an appropriate number of cards (not limited to 12 — use all relevant capitals for the theme).

## Acceptance Criteria

- **Given** the app has themed datasets defined
- **When** a theme is referenced by its identifier
- **Then** the correct set of country-capital pairs is returned

- **Given** a themed dataset
- **When** the dataset is loaded
- **Then** each card has a country (question) and capital (answer) pair

- **Given** the 12 themes
- **When** reviewed for completeness
- **Then** each theme contains relevant, accurate country-capital pairs with no duplicates within a theme

## Related Epic

[Epic 2 — Theme Reorganization: World Capitals into 12 Themes](epic-2-theme-reorganization/epic.md)

## Related Sprints

<!-- @po fills this section after producing sprints -->
