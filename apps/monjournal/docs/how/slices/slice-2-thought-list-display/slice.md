<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

# Slice 2 — Thought List Display

## Overview

This slice implements the user-facing thought display layer for MonJournal. It enables users to view their stored thoughts in multiple formats (list and timeline) and interact with them through filtering and exploration.

Slice 2 depends on **Slice 1 (Data Foundation)** which provides the core data models, persistence, and tag management. This slice consumes data from the `useThoughts` hook and renders it with multiple view modes, formatting options, and visual styling.

The slice implements:
1. **ThoughtList component** — renders thoughts as compact cards (title, truncated content, date, tags)
2. **TimelineView component** — groups thoughts by creation date with day separators
3. **View mode toggle control** — switches between list and timeline views
4. **TagDisplay component** — renders tags with assigned colors (from Slice 1)
5. **Date formatting utilities** — supports both relative and absolute date display
6. **Integration with useThoughts hook** — fetches and displays thought data

This slice is **user-facing** and directly implements the core viewing experience of MonJournal.

## Technical Scope

### Components

#### 1. ThoughtList
- **Purpose**: Display a flat list of thoughts as cards, ordered by most recent first
- **Props**:
  - `thoughts: Thought[]` — array of thoughts to render
  - `onSurpriseClick?: (thought: Thought) => void` — optional callback when surprise/highlight is triggered
- **Rendering**:
  - Each thought displays: title, truncated content (~100 characters), creation date, tags
  - Cards use compact layout for horizontal scrolling on mobile
  - Sorted in descending order by `createdAt` (most recent first)
  - Empty state message displayed when `thoughts.length === 0`
- **Sub-components**: Uses `ThoughtCard` (repeat) and `TagDisplay`

#### 2. ThoughtCard
- **Purpose**: Individual thought display unit
- **Props**:
  - `thought: Thought` — single thought data
  - `onHighlight?: () => void` — optional callback (for surprise feature)
- **Content**:
  - Title as card header (bold)
  - Truncated content (100 characters, with ellipsis if longer)
  - Creation date (formatted by `formatDate()`)
  - Tags rendered via `TagDisplay` component
  - Optional highlight/selected state for surprise feature
- **Styling**: Card-based layout with padding, border, shadow (from AppShell CSS)

#### 3. TimelineView
- **Purpose**: Display thoughts grouped by creation date with day separators
- **Props**:
  - `thoughts: Thought[]` — array of thoughts to group and render
  - `onSurpriseClick?: (thought: Thought) => void` — optional callback
- **Rendering**:
  - Groups thoughts by `createdAt` date (ignoring time)
  - Day separator for each group: "June 4, 2026" format (absolute date)
  - Displays thoughts within each group in reverse chronological order (newest first within day)
  - Empty state when no thoughts exist
- **Sub-components**: Uses `TimelineGroup` (repeat) with `ThoughtCard` children

#### 4. TimelineGroup
- **Purpose**: Container for one day's thoughts with separator
- **Props**:
  - `date: number` — timestamp of the day (in ms)
  - `thoughts: Thought[]` — thoughts for this day
  - `onSurpriseClick?: (thought: Thought) => void`
- **Content**:
  - Day separator header (e.g., "June 4, 2026")
  - List of `ThoughtCard` components for that day
- **Styling**: Separator with horizontal line and date label

#### 5. ViewModeToggle
- **Purpose**: Control to switch between list and timeline views
- **Props**:
  - `currentMode: 'list' | 'timeline'` — current view mode
  - `onChange: (mode: 'list' | 'timeline') => void` — callback on mode change
- **Rendering**:
  - Two buttons or toggle switch: "List" and "Timeline"
  - Active button/segment highlighted
  - Label indicating current mode
- **State**: Managed by parent (`Home` component)

#### 6. TagDisplay
- **Purpose**: Render tags with assigned colors (reused from Slice 1)
- **Props**:
  - `tags: string[]` — array of tag names
  - `compact?: boolean` — optional compact size (default false)
- **Rendering**:
  - Each tag as colored chip element
  - Background color from `getTagColor(tagName)` (computed in Slice 1)
  - Text label with contrast-friendly color (black or white based on background)
  - Responsive sizing (larger on desktop, compact on mobile if `compact=true`)
- **Styling**: Inline chip layout, 4px–8px padding, rounded corners

### Utilities

#### dateFormat.ts
- **Function**: `formatDate(timestamp: number, format: 'relative' | 'absolute'): string`
  - **Relative**: "2 hours ago", "yesterday", "3 days ago" (humanized)
  - **Absolute**: "June 4, 2026" (locale-aware formatting, ISO-like)
  - **Implementation**: Use `Intl.DateTimeFormat` or date library
  - Uses relative for thought cards (compact)
  - Uses absolute for timeline separators

#### groupByDate.ts
- **Function**: `groupThoughtsByDate(thoughts: Thought[]): Map<string, Thought[]>`
  - Groups thoughts by creation date (normalized to midnight)
  - Returns Map of `[dateKey: string] → Thought[]`
  - `dateKey` format: `YYYY-MM-DD` for stable grouping
  - Thoughts within each group sorted by `createdAt` descending

### Integration with useThoughts Hook

- **Data Source**: `const { thoughts, getTags } = useThoughts()`
- **Home component** retrieves `thoughts` array
- **Applies filters** via `filterThoughts(filterState)` (from Slice 1)
- **Passes filtered thoughts** to `ThoughtList` or `TimelineView` depending on view mode
- **View mode state**: Managed locally in Home component via `useState('list' | 'timeline')`

## Implementation Steps

1. **Create date formatting utility** (`src/utils/dateFormat.ts`)
   - `formatDate(timestamp, format: 'relative' | 'absolute'): string`
   - Relative dates: "2 hours ago", "yesterday", "3 days ago"
   - Absolute dates: "June 4, 2026"

2. **Create grouping utility** (`src/utils/groupByDate.ts`)
   - `groupThoughtsByDate(thoughts: Thought[]): Map<string, Thought[]>`

3. **Create TagDisplay component** (`src/components/TagDisplay.tsx`)
   - Input: `tags: string[]`, optional `compact?: boolean`
   - Output: Colored chip elements using `getTagColor()` from Slice 1
   - Styling: inline flex layout, responsive

4. **Create ThoughtCard component** (`src/components/ThoughtCard.tsx`)
   - Input: `thought: Thought`, optional `onHighlight?: () => void`
   - Truncate content to ~100 characters
   - Display title, content, date (relative), tags via `TagDisplay`
   - Card-based layout with hover state

5. **Create ThoughtList component** (`src/components/ThoughtList.tsx`)
   - Input: `thoughts: Thought[]`, optional `onSurpriseClick?: (thought) => void`
   - Render array of `ThoughtCard` components
   - Sort by `createdAt` descending (pre-sort or let parent handle)
   - Empty state message

6. **Create TimelineGroup component** (`src/components/TimelineGroup.tsx`)
   - Input: `date: number`, `thoughts: Thought[]`, optional `onSurpriseClick`
   - Render day separator + `ThoughtCard` list

7. **Create TimelineView component** (`src/components/TimelineView.tsx`)
   - Input: `thoughts: Thought[]`, optional `onSurpriseClick`
   - Use `groupThoughtsByDate()` to organize
   - Render array of `TimelineGroup` components
   - Empty state message

8. **Create ViewModeToggle component** (`src/components/ViewModeToggle.tsx`)
   - Input: `currentMode: 'list' | 'timeline'`, `onChange: (mode) => void`
   - Two toggle buttons, active state styling

9. **Update Home component** (if it exists, or create `src/pages/Home.tsx`)
   - Initialize `useThoughts()` hook
   - Fetch filtered thoughts (via `filterThoughts` from Slice 1)
   - Manage `viewMode` state with `useState`
   - Conditionally render `ThoughtList` or `TimelineView`
   - Include `ViewModeToggle` control
   - Pass `onSurpriseClick` handler (for future surprise feature)

## Acceptance Criteria

1. ✅ ThoughtList component renders thoughts as compact cards with title, truncated content, date, and tags
2. ✅ Thoughts in ThoughtList are ordered by `createdAt` descending (most recent first)
3. ✅ TimelineView groups thoughts by creation date with day separators
4. ✅ Timeline displays groups in reverse chronological order (newest to oldest)
5. ✅ ViewModeToggle control switches between list and timeline views
6. ✅ Active view mode is visually indicated in toggle
7. ✅ TagDisplay renders tags with colors from `getTagColor()` (Slice 1)
8. ✅ Date formatting shows relative dates in cards ("2 hours ago") and absolute dates in timeline ("June 4, 2026")
9. ✅ Empty state messages display when no thoughts exist in current view
10. ✅ All components integrate with `useThoughts` hook to fetch data
11. ✅ View mode toggle persists in component state during session
12. ✅ Content truncation at ~100 characters with visual ellipsis indicator
13. ✅ Tag chips display with assigned colors and good text contrast (WCAG AA)

## Testing Strategy

- **Unit tests**:
  - `dateFormat.ts`: relative/absolute formatting, edge cases (recent vs. old dates)
  - `groupByDate.ts`: grouping logic, empty array, same-day thoughts
  - Component snapshot tests (ThoughtCard, ThoughtList, TimelineGroup, TimelineView)

- **Integration tests**:
  - Home component with `useThoughts` hook
  - View mode toggle switches between ThoughtList and TimelineView
  - Filtered thoughts display correctly in both views
  - Tags render with correct colors

- **Visual/E2E tests**:
  - Cards display correctly on mobile and desktop
  - Timeline groups are visually distinct
  - Toggle control is accessible and responsive
  - Empty states render properly

- **Edge cases**:
  - Empty thoughts array
  - Single thought
  - Many thoughts (performance)
  - Thoughts with no tags
  - Thoughts with multiple tags
  - Very long titles/content (truncation)
  - Same-day thoughts (timeline grouping)

## Dependencies

- **Slice 1 (Data Foundation)**: Provides `useThoughts`, `Thought`, `Tag`, `getTagColor()`, `deriveTags()`, `FilterState`
- **React**: useState, useEffect hooks
- **AppShell**: CSS base styles, Layout component, responsive design utilities

## Related Epics

- [Epic 0 — MonJournal MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-001 — Thought List](../../../what/epics/epic-0-mvp/user-stories/us-001-thought-list.md)
- [US-003 — Timeline View](../../../what/epics/epic-0-mvp/user-stories/us-003-timeline-view.md)