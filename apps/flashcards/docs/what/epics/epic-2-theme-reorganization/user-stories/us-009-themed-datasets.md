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

## Technical Notes

### Hook Refactoring: useTheme.ts

The `useTheme.ts` hook currently imports themes via hardcoded static imports (3 imports). With 12 new themed datasets, you have two options:

1. **Static imports** (simple, explicit): Add all 12 JSON imports to `useTheme.ts`
   ```typescript
   import africaTheme from '../data/themes/africa.json';
   import asiaTheme from '../data/themes/asia.json';
   // ... 10 more imports
   ```

2. **Dynamic imports** (more scalable): Refactor the hook to use dynamic `import()` and scan the themes directory
   ```typescript
   const loadTheme = async (themeId: string) => import(`../data/themes/${themeId}.json`);
   ```

### Data File Cleanup

- **Delete** `world-capitals.json` (being replaced by the 12 themed files)
- Create 12 new JSON files in `apps/flashcards/app/src/data/themes/`:
  - `africa.json`
  - `antarctica.json`
  - `asia.json`
  - `europe-east.json`
  - `europe-west.json`
  - `north-america.json`
  - `south-america.json`
  - `australia.json`
  - `brics-alliance.json`
  - `nato-alliance.json`
  - `gdp-biggest-20.json`
  - `gdp-lowest-20.json`

### Format Specification

Each JSON file follows the existing format:
```json
{
  "id": "africa",
  "name": "Africa",
  "cards": [
    {
      "id": "card-1",
      "front": { "data": "Egypt", "renderEngineId": "text" },
      "back": { "data": "Cairo\n\n![Egypt](https://flagcdn.com/w80/eg.png)", "renderEngineId": "markdown" }
    }
  ]
}
```

Each card has a unique `id`, a `front` object with the question and its rendering engine, and a `back` object with the answer (optionally including embedded markdown such as a flag image) and its rendering engine.

Flag codes map to [flagcdn.com](https://flagcdn.com/) — use the 2-letter ISO country code as the flag identifier.

### localStorage Migration

The app may persist the selected theme id in localStorage. If the stored id (e.g., `"world-capitals"`) is no longer available:
- Check if the theme exists in `useTheme().themes`
- If not found, fall back to the first available theme (e.g., Africa)
- This ensures users with old localStorage entries transition smoothly

## Related Epic

[Epic 2 — Theme Reorganization: World Capitals into 12 Themes](../epic.md)

## Related Sprints

<!-- @po fills this section after producing sprints -->
