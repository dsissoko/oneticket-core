---
title: 'Sprint 2 — Theme Reorganization'
---

# Sprint 2 — Theme Reorganization

Reorganize the single "World Capitals" theme (currently 12 random capitals) into 12 distinct themed datasets organized by geography and economic alliances: Africa, Antarctica, Asia, Europe East, Europe West, North America, South America, Australia, BRICS Alliance, NATO Alliance, 20 biggest GDP, and 20 lowest GDP. Each dataset provides accurate country-capital pairs with flags. The home screen theme picker is updated to display all 12 themes, replacing the single "World Capitals" option.

This sprint covers both US-009 (dataset creation) and US-010 (picker update) since they are tightly coupled — the picker cannot function without the datasets, and the datasets have no value without the picker.

## Cross-references
- Epic: [Epic 2 — Theme Reorganization: World Capitals into 12 Themes](epic-2-theme-reorganization/epic.md)
- US-009 — [US-009 — Define 12 Themed Capital Datasets](us-009-themed-datasets.md) — pending
- US-010 — [US-010 — Update Theme Picker with 12 Themes](us-010-theme-picker-update.md) — pending

---

## Technical Notes

### Architecture Impact

This sprint is **purely additive data work** — no architectural decisions, no new patterns, no interface changes. The existing architecture already supports this:

- `useTheme.ts` loads JSON files as `Theme[]` via static imports
- `ThemePicker` in `HomeScreen.tsx` renders dynamically from the `themes` array
- `CardSide` format with `{ data, renderEngineId }` is already established (see [ADR-003 — CardSide Union Type](../adr-003-card-side-union-type.md))
- No component, hook, context, or type changes are required

**No ADR is needed for this sprint.**

### Implementation Guidance

#### 1. Create 12 Theme Data Files

Location: `apps/flashcards/app/src/data/themes/`

| File | Theme Name | Approx. Cards |
|---|---|---|
| `africa.json` | Africa | ~54 |
| `antarctica.json` | Antarctica | ~4 |
| `asia.json` | Asia | ~48 |
| `europe-east.json` | Europe East | ~22 |
| `europe-west.json` | Europe West | ~22 |
| `north-america.json` | North America | ~23 |
| `south-america.json` | South America | ~12 |
| `australia.json` | Australia | ~14 |
| `brics-alliance.json` | BRICS Alliance | ~10 |
| `nato-alliance.json` | NATO Alliance | ~32 |
| `gdp-biggest-20.json` | 20 biggest GDP | 20 |
| `gdp-lowest-20.json` | 20 lowest GDP | 20 |

Each file must follow the established CardSide format:

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

Rules:
- `id` matches filename (kebab-case): `africa`, `europe-east`, `brics-alliance`, `gdp-biggest-20`, etc.
- `name` is the display label: `Africa`, `Europe East`, `BRICS Alliance`, `20 biggest GDP`, etc.
- Each card `id` must be unique within the file
- Flag images use `https://flagcdn.com/w80/{iso-code}.png` (2-letter ISO country codes)
- Back side uses `renderEngineId: "markdown"` for flag images
- No duplicate country entries within a theme

#### 2. Delete `world-capitals.json`

Remove `apps/flashcards/app/src/data/themes/world-capitals.json` — its 12 random capitals are distributed across the new themed files.

#### 3. Update `useTheme.ts`

```typescript
// Current (3 imports):
import worldCapitalsTheme from '@/data/themes/world-capitals.json';
import multiplicationTablesTheme from '@/data/themes/multiplication-tables.json';
import conjugaisonsFrTheme from '@/data/themes/conjugaisons-fr.json';

// Replace with (14 imports — 12 new + 2 existing non-capital themes):
import africaTheme from '@/data/themes/africa.json';
import antarcticaTheme from '@/data/themes/antarctica.json';
import asiaTheme from '@/data/themes/asia.json';
import europeEastTheme from '@/data/themes/europe-east.json';
import europeWestTheme from '@/data/themes/europe-west.json';
import northAmericaTheme from '@/data/themes/north-america.json';
import southAmericaTheme from '@/data/themes/south-america.json';
import australiaTheme from '@/data/themes/australia.json';
import bricsAllianceTheme from '@/data/themes/brics-alliance.json';
import natoAllianceTheme from '@/data/themes/nato-alliance.json';
import gdpBiggest20Theme from '@/data/themes/gdp-biggest-20.json';
import gdpLowest20Theme from '@/data/themes/gdp-lowest-20.json';
import multiplicationTablesTheme from '@/data/themes/multiplication-tables.json';
import conjugaisonsFrTheme from '@/data/themes/conjugaisons-fr.json';
```

Update the `themes` array to include all 14 themes. Place the 12 capital themes first, followed by multiplication-tables and conjugaisons-fr.

The static import approach is preferred over dynamic `import()` because:
- Theme data is small (~10-100 KB per file), well within bundle limits
- Static imports enable tree-shaking and build-time validation
- No async loading complexity needed — all themes load at app startup

#### 4. localStorage Migration

Current code in `useTheme.ts` already handles the fallback:

```typescript
const currentTheme = selectedThemeId
  ? themes.find((t) => t.id === selectedThemeId) ?? null
  : themes[0] ?? null;
```

If a user has `"world-capitals"` stored in localStorage, `themes.find()` returns `null` (the theme no longer exists), and `currentTheme` falls back to `themes[0]` (Africa). This is the correct behavior — no code change needed.

#### 5. Existing Tests

- `useTheme.test.ts` — must be updated for 14 themes instead of 3, and to verify that the `world-capitals` fallback defaults to Africa
- `ThemeToggle.test.tsx` — no changes needed (this component handles color/display theme, not flashcard themes)
- `HomeScreen.test.tsx` — update expected text from "World Capitals" to "Africa" (or whichever is `themes[0]`)

### Components — No Changes Required

| Component | Change |
|---|---|
| `ThemePicker` (in `HomeScreen.tsx`) | None — renders dynamically from `themes` array |
| `FlashcardDisplay` | None — already uses `currentTheme.cards` via context |
| `SessionScreen` | None — session flow unchanged |
| `ResultsScreen` | None — scoring unchanged |
| `ThemeContext` / `ThemeDataProvider` | None — interface unchanged |

### Related Architecture

- See [architecture.md](../architecture.md) — Components, Key Types, and Hooks sections
- See [containers.md](../c4/containers.md) — Component Details table
