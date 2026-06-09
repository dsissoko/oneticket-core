<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

# Slice 1 — Data Foundation

## Overview

This foundational slice establishes the core data models and persistence layer for MonJournal. It is the **walking skeleton** that all other feature slices depend on.

The slice implements:
1. Thought data model definition with immutable properties
2. Tag data model with deterministic color assignment
3. `useThoughts` hook for lifecycle management and localStorage persistence
4. Tag color assignment utility with fixed color palette
5. LocalStorage schema and serialization/deserialization logic

This slice is prerequisite for all other slices. It is **not user-facing** but enables all user-facing features.

## Technical Scope

### Data Models

**Thought**
- `id` (string, UUID) — immutable, auto-generated on creation
- `title` (string) — required, immutable
- `content` (string) — required, immutable
- `createdAt` (number, timestamp in ms) — auto-generated, immutable
- `tags` (string[] or empty) — optional, immutable

**Tag**
- `name` (string) — derived from thought.tags, immutable
- `color` (string, hex) — deterministically computed from name, immutable

### Modules & Exports

1. **thoughtModel.ts**
   - Type: `Thought` interface
   - Function: `createThought(title: string, content: string, tags: string[]): Thought`
   - Function: `validateThought(t: any): boolean`

2. **tagModel.ts**
   - Type: `Tag` interface
   - Function: `deriveTags(thoughts: Thought[]): Tag[]`
   - Function: `getTagColor(tagName: string): string`

3. **colorPalette.ts**
   - Export: `COLORS: string[]` — fixed array of 8–12 distinct, WCAG AA compliant hex colors
   - Each index represents a color slot for tag hash assignment

4. **useThoughts.ts** (React hook)
   - Returns: `{ thoughts: Thought[], addThought(t: Thought): void, getTags(): Tag[], getThoughts(): Thought[] }`
   - Implementation: reads/writes localStorage under key `monjournal_thoughts`
   - Side effects: loads data on mount, persists on addThought

5. **useLocalStorage.ts** (React hook, internal)
   - Helper: `getItem(key: string): any`
   - Helper: `setItem(key: string, value: any): void`
   - Error handling: graceful fallback if storage unavailable

6. **filterLogic.ts** (utility module)
   - Function: `applyFilters(thoughts: Thought[], filters: FilterState): Thought[]`
   - Function: `matchesTextSearch(thought: Thought, query: string): boolean`
   - Function: `matchesDateRange(thought: Thought, start: number | null, end: number | null): boolean`
   - Function: `matchesTags(thought: Thought, selectedTags: string[]): boolean`

### LocalStorage Schema

```json
{
  "monjournal_thoughts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Morning reflection",
      "content": "Woke up early today, feeling productive.",
      "createdAt": 1717459200000,
      "tags": ["personal", "morning"]
    }
  ]
}
```

**Read Strategy** (app startup):
- Check if `monjournal_thoughts` key exists
- If not, initialize empty array `[]`
- Parse JSON, validate structure
- Load into `useThoughts` state

**Write Strategy** (after `addThought`):
- Serialize updated array to JSON
- Write to localStorage
- Log on error (localStorage unavailable is rare)

**Data Validation** (on load):
- Validate `id`, `title`, `content`, `createdAt` present
- Validate `createdAt` is number (milliseconds)
- Validate `tags` is array of strings (or empty)

### Tag Color Assignment

**Algorithm**:
```
tagColorIndex = hashCode(tagName) % colorPalette.length
color = colorPalette[tagColorIndex]
```

**Hash Function**: Consistent, deterministic hash of tag name (example: `charCodeAt(0) % length` or better hash).

**Reproducibility**: Same tag name always produces same color across browser sessions and device reloads.

**Palette**: 8–12 visually distinct colors, WCAG AA compliant for text contrast.

## Implementation Steps

1. **Create data type definitions** (`src/models/types.ts`)
   - `Thought` interface
   - `Tag` interface
   - `FilterState` interface

2. **Implement color palette** (`src/utils/colorPalette.ts`)
   - Export `COLORS` array with 8–12 hex colors
   - Ensure WCAG AA contrast for readability

3. **Implement thoughtModel** (`src/models/thoughtModel.ts`)
   - `createThought()`: generate UUID, set createdAt
   - `validateThought()`: check required fields

4. **Implement tagModel** (`src/models/tagModel.ts`)
   - `deriveTags()`: collect unique tag names from thoughts, compute colors
   - `getTagColor()`: hash tag name to color

5. **Implement useLocalStorage** (`src/hooks/useLocalStorage.ts`)
   - Serialize/deserialize JSON
   - Error handling for unavailable storage

6. **Implement useThoughts** (`src/hooks/useThoughts.ts`)
   - Load from localStorage on mount
   - Provide `addThought()`, `getThoughts()`, `getTags()`
   - Persist on state change

7. **Implement filterLogic** (`src/utils/filterLogic.ts`)
   - Text search matching (case-insensitive substring)
   - Date range matching (inclusive)
   - Tag matching (at least one tag selected)
   - Compose all filters with AND logic

## Acceptance Criteria

1. ✅ Thought model supports id, title, content, createdAt, tags
2. ✅ Thoughts are immutable (no update/delete exports)
3. ✅ Tag model supports name and color properties
4. ✅ `useThoughts` hook initializes from localStorage on app startup
5. ✅ `addThought()` persists new thought to localStorage
6. ✅ `deriveTags()` collects all unique tag names and computes colors
7. ✅ Tag colors are deterministically assigned (same name → same color)
8. ✅ Color palette has 8–12 visually distinct colors
9. ✅ LocalStorage serialization/deserialization works correctly
10. ✅ Data validation passes on load, reset to empty on corruption
11. ✅ Filter logic applies text, date, and tag filters with AND composition

## Testing Strategy

- **Unit tests**: thoughtModel, tagModel, colorPalette, filterLogic (pure functions)
- **Hook tests**: useThoughts, useLocalStorage (isolated, mock localStorage)
- **Integration tests**: useThoughts + localStorage (verify read/write cycle)
- **Edge cases**:
  - Empty thoughts array
  - Corrupted localStorage data (JSON.parse failure)
  - localStorage quota exceeded
  - Duplicate tags with different casing

## Related Epics

- [Epic 0 — MonJournal MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-001 — Thought List](../../../what/epics/epic-0-mvp/user-stories/us-001-thought-list.md)
- [US-002 — Multi-Filter](../../../what/epics/epic-0-mvp/user-stories/us-002-multi-filter.md)
- [US-003 — Timeline View](../../../what/epics/epic-0-mvp/user-stories/us-003-timeline-view.md)
- [US-004 — Add Thought](../../../what/epics/epic-0-mvp/user-stories/us-004-add-thought.md)
- [US-005 — Tag Colors](../../../what/epics/epic-0-mvp/user-stories/us-005-tag-colors.md)