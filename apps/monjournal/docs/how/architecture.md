# MonJournal Technical Architecture

This document describes the technical architecture of MonJournal, a personal thought journal application. The architecture is designed for simplicity, performance, and complete data privacy with no backend services.

---

## 1. Tech Stack

MonJournal is built on the **AppShell template** foundation with the following technology choices:

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router (from AppShell)
- **State Management**: React hooks + Context API (no external state library)
- **Styling**: CSS (from AppShell theme)
- **Persistence**: Browser localStorage API
- **Runtime**: Browser only; no backend services

**Rationale**: This minimal stack keeps the application lightweight, fast to develop, and eliminates external dependencies. localStorage provides sufficient persistence for a single-device journaling app.

---

## 2. Persistence Strategy

MonJournal stores all data in the browser's **localStorage** with no backend or authentication layer.

### Storage Model

- **Key**: `monjournal_thoughts` — serialized JSON array of all thoughts
- **Scope**: Single browser on single device (no sync across devices)
- **Lifetime**: Persists until user clears browser data
- **Backup**: No automatic backup (V1 limitation; future could add export)

### V1 Constraints

- No authentication or user accounts
- No cloud sync or multi-device access
- No server-side storage
- All logic executes in the browser

### Serialization Format

See [LocalStorage Schema](#localstorage-schema-and-serialization) for detailed format.

---

## 3. State Management

MonJournal uses **React hooks and Context API** for state management. No external state library (Redux, Zustand, etc.) is needed.

### State Types

1. **Global Thought State**
   - Managed by `useThoughts` custom hook
   - Provides: `thoughts`, `addThought`, `getTags`, `filterThoughts`
   - Backed by localStorage

2. **Filter State**
   - Local component state (`useState`) in the main home/filter container
   - Includes: text search, date range, selected tags, view mode
   - Not persisted across sessions

3. **UI State**
   - Component-level: form inputs, toggles, selections
   - Managed locally with `useState`

### Why No External Store?

- Thought data is simple: array of immutable objects
- No async actions or side effects beyond localStorage
- Filters are transient (not saved)
- Single-page simplicity outweighs any organizational benefits

---

## 4. Key Components and Modules

### Components (React)

1. **ThoughtList** — displays thoughts as compact cards
   - Input: `thoughts: Thought[]`, `onSurpriseClick?: () => void`
   - Output: DOM rendering of thought cards with title, truncated content, date, tags
   - Styling: compact card layout with tag chips

2. **AddThought** — form for creating new thoughts
   - Input: `onSave: (thought: Thought) => void`
   - Output: Redirects to home on successful submission
   - Features: title/content inputs, tag autocomplete, chip display, validation

3. **FilterPanel** — multi-criteria filter UI
   - Input: `existingTags: Tag[]`, `onFilterChange: (filters: FilterState) => void`
   - Output: Text search input, date range picker, tag multi-select, surprise button
   - Local state: filter values (text, dateStart, dateEnd, selectedTags)

4. **TimelineView** — groups thoughts by date
   - Input: `thoughts: Thought[]`
   - Output: Day separators with grouped thought cards
   - Sorting: reverse chronological (newest group first)

5. **TagColorAssignment** — visual tag display with colors
   - Input: `tags: string[]`, `compact?: boolean`
   - Output: Colored chip elements for each tag
   - Styling: background color + text, responsive sizing

6. **Home** — main container
   - Composes: ThoughtList + TimelineView + FilterPanel
   - Logic: applies filters, manages view toggle, coordinates surprise selection
   - Routing: path `/`

7. **Layout** — root layout from AppShell
   - Navigation: links to Home and Add Thought
   - Content area: main page renderer

### Hooks (Composable Logic)

1. **useThoughts** — core data hook
   - Returns: `{ thoughts: Thought[], addThought: (t: Thought) => void, getTags: () => Tag[], filterThoughts: (filters: FilterState) => Thought[] }`
   - Implementation: reads/writes localStorage, derived tags
   - No dependencies: pure, reusable

2. **useLocalStorage** (internal utility)
   - Thin wrapper over window.localStorage
   - Provides: `getItem(key)`, `setItem(key, value)` with JSON serialization
   - Error handling: graceful fallback if storage unavailable

### Modules (Non-React)

1. **thoughtModel** — Thought data structure and utilities
   - Exports: `Thought` type, `createThought()`, `validateThought()`
   - Logic: ID generation (UUID), timestamp handling, immutability checks

2. **tagModel** — Tag derivation and color assignment
   - Exports: `Tag` type, `deriveTags(thoughts: Thought[])`, `getTagColor(tagName: string)`
   - Logic: hash function for color assignment (deterministic)

3. **filterLogic** — filtering and searching
   - Exports: `applyFilters(thoughts: Thought[], filters: FilterState)`, `matchesTextSearch()`, `matchesDateRange()`, `matchesTags()`
   - Logic: composable filter functions

4. **colorPalette** — tag color definitions
   - Exports: fixed array of 8–12 distinct colors (hex or RGB)
   - Format: color palette with good contrast and visual distinction

---

## 5. Routing with React Router

MonJournal uses **React Router** (from AppShell) with minimal routes:

```
/                    → Home (list/timeline view, filters)
/add                 → Add Thought form
/about (optional)    → About page (AppShell default)
```

**Routing Strategy**:
- Client-side routing (SPA)
- No query params for filters (filters are ephemeral)
- On successful thought creation: navigate to `/`
- Navigation via `<Link>` and `useNavigate()` hook

---

## 6. Data Model Implementation

### Thought Shape

```typescript
interface Thought {
  id: string;              // UUID, immutable
  title: string;          // required, immutable
  content: string;        // required, immutable
  createdAt: number;      // ISO 8601 timestamp (ms), auto-generated, immutable
  tags: string[];         // optional array of tag names, immutable
}
```

**Immutability Rules**:
- No `update()` function
- No `delete()` function
- Once created via `createThought()`, a Thought is never modified
- Serialization must preserve all fields exactly

### Tag Shape

```typescript
interface Tag {
  name: string;          // user-assigned string (derived from thoughts)
  color: string;         // hex color string (e.g., "#FF6B6B", computed deterministically from tagName hash)
}
```

**Derivation**:
- Tags are objects with both `name` and `color` properties
- Tags are computed from the union of all `thought.tags` arrays (in thoughts, tags are stored as strings, but when retrieved via `deriveTags()`, they become Tag objects)
- No separate storage; recomputed on demand
- Color is assigned deterministically on first tag creation (when a thought with that tag is first saved)
- Example: `deriveTags([thought1, thought2, ...])` returns all unique tag names, each with a computed color based on the hash of its name
- Same tag name always produces the same color across all browser sessions

---

## 7. Tag Derivation

Tags are **not** stored separately as entities; they are **derived** as Tag objects from all thoughts.

### Algorithm

```
1. Collect all tag names from all thoughts (thoughts.tags arrays contain string names)
2. Deduplicate (convert to Set)
3. For each unique tag name, compute color using deterministic hash function
4. Return array of Tag objects: { name: string, color: string } 
```

### Tag Structure

A tag is always an object with two properties:
- **name**: The string identifier (e.g., "work", "personal")
- **color**: A hex color code (e.g., "#FF6B6B") computed deterministically from the name
- The color is assigned automatically; no user customization

### Benefits

- Single source of truth: the thoughts array
- Automatic cleanup: a tag disappears when no thought references it
- No tag management UI needed
- Colors are deterministic and consistent across sessions

### Implementation Location

- **Function**: `deriveTags()` in `tagModel.ts`
- **Input**: Array of Thought objects
- **Output**: Array of Tag objects (name + color)
- **Called From**: `useThoughts` hook when needed, filter UI for tag list
- **Memoization**: Optional `useMemo` to avoid recomputation on every render

---

## 8. LocalStorage Schema and Serialization

### Storage Key

```
monjournal_thoughts: Thought[]
```

### Serialization Format

```json
{
  "thoughts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Morning reflection",
      "content": "Woke up early today, feeling productive.",
      "createdAt": 1717459200000,
      "tags": ["personal", "morning"]
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Work deadline",
      "content": "Finished the project milestone on time.",
      "createdAt": 1717545600000,
      "tags": ["work", "achievement"]
    }
  ]
}
```

### Read/Write Strategy

**Read** (on app startup):
1. Check if `monjournal_thoughts` key exists in localStorage
2. If not, initialize empty array: `[]`
3. Parse JSON and validate structure
4. Load into `useThoughts` state

**Write** (after `addThought`):
1. Serialize thoughts array to JSON
2. Write to localStorage under `monjournal_thoughts`
3. No error handling beyond logging (localStorage unavailable is rare)

### Data Validation

- Validate `id`, `title`, `content`, `createdAt` are present on load
- Validate `createdAt` is a number (milliseconds timestamp)
- Validate `tags` is an array of strings (or empty)

---

## 9. Filter State Management

Filter state is **local to the home page** and **not persisted** across sessions.

### FilterState Type

```typescript
interface FilterState {
  text?: string;                    // text search query
  dateStart?: number;               // timestamp in ms (or null)
  dateEnd?: number;                 // timestamp in ms (or null)
  selectedTags?: string[];          // array of tag names
  viewMode?: 'list' | 'timeline';   // current view toggle (optional, defaults to 'list')
}
```

### Application Logic

**AND Composition**:
- Text search AND date range AND tag filter are combined
- A thought passes all active filters to appear in results
- If no filters are set, all thoughts are shown

**Filter Functions** (in `filterLogic.ts`):
```
applyFilters(thoughts, filters) → Thought[]
  ├─ matchesTextSearch(thought, query) → boolean
  ├─ matchesDateRange(thought, start, end) → boolean
  └─ matchesTags(thought, selectedTags) → boolean
```

**Surprise Filter**:
- Select one random thought from current filtered results
- Highlight it or scroll into view
- Button click: `randomThought = filteredThoughts[Math.random() * filteredThoughts.length]`

### Why No Persistence?

- Filters are exploratory; users expect a fresh state on reload
- Reduces localStorage churn
- Simplifies component logic (no hydration needed)

---

## 10. Non-Functional Requirements

### Performance

1. **Startup Time**: App should load in < 1 second
   - localStorage read is synchronous and fast
   - No network delays (local-only)

2. **Thought Capture**: Form submission < 2 seconds
   - Validation and serialization are instant
   - localStorage write is synchronous

3. **Filtering**: Real-time updates (< 100ms)
   - In-memory filtering on small datasets (target: thousands of thoughts)
   - Re-render on filter change

4. **Memory**: Scaling to thousands of thoughts
   - Rough estimate: 1 KB per thought (title + content + metadata)
   - 1000 thoughts = 1 MB in-memory + serialized
   - Acceptable for browser runtime

### Immutability

- **Thoughts**: Once created, never modified or deleted
- **Implementation**: No `update()` or `delete()` exports in `useThoughts`
- **Validation**: Type system prevents accidental mutation (object freezing optional)
- **Benefits**: Predictable state, easier debugging, no edit/delete UX needed

### Deterministic Color Assignment

- **Hash Function**: Consistent hash of tag name → color index (0–11)
- **Reproducibility**: Same tag name always produces same color across all browser sessions
- **Assignment**: Color is determined on tag creation (when a thought with that tag name is first saved) and never changes
- **Algorithm**: `colorIndex = hash(tagName) % colorPalette.length` (e.g., `tagName.charCodeAt(0) % colorPalette.length` or better hash)
- **Palette**: 8–12 visually distinct colors (sufficient for typical journaling use)
- **Example**: `"work"` → always `#FF6B6B`, `"personal"` → always `#4ECDC4`
- **User Control**: Users never pick or customize colors; the system handles all color assignment automatically

### Accessibility & Responsiveness

- **Mobile Web**: Responsive design for touch devices (via AppShell)
- **Color Contrast**: Tag colors must pass WCAG AA (included in palette definition)
- **Keyboard Navigation**: Filter inputs and form controls fully keyboard-accessible

---

## 11. Component Hierarchy

```
<Layout>                           (AppShell root)
  ├─ <Header>
  │   └─ Navigation links (Home, Add)
  └─ <Main>
      ├─ <Home>                   (path: /)
      │   ├─ <FilterPanel>
      │   │   ├─ Text search input
      │   │   ├─ Date range picker
      │   │   ├─ Tag multi-select
      │   │   └─ Surprise button
      │   ├─ View toggle (List ↔ Timeline)
      │   ├─ <ThoughtList>        (if viewMode: 'list')
      │   │   └─ <ThoughtCard>    (repeat)
      │   │       └─ <TagColorAssignment>
      │   └─ <TimelineView>       (if viewMode: 'timeline')
      │       └─ <TimelineGroup>  (repeat by date)
      │           └─ <ThoughtCard>
      │               └─ <TagColorAssignment>
      └─ <AddThought>             (path: /add)
          ├─ Form: title, content
          ├─ Tag input w/ autocomplete
          │   └─ <TagColorAssignment> (for chip preview)
          └─ Submit button
```

---

## 12. Data Flow Examples

### WF1: Capture a Thought

1. User navigates to `/add`
2. User enters title, content, selects tags
3. User clicks "Save"
4. **AddThought** validates inputs
5. **CreateThought** (thoughtModel) creates Thought with UUID + timestamp
6. **useThoughts.addThought()** adds to array
7. **useLocalStorage.setItem()** writes new array to localStorage
8. **useNavigate()** redirects to `/`
9. **Home** renders, **useThoughts** reads from localStorage, shows new thought at top

### WF2: Filter and View

1. User is on Home page, sees all thoughts (list view)
2. User enters text search "deadline"
3. **FilterPanel** updates local state
4. **Home** calls `filterThoughts(filterState)`
5. **filterLogic.applyFilters()** returns matching thoughts
6. **ThoughtList** re-renders with filtered subset
7. User clicks "Timeline" toggle
8. **Home** switches viewMode state
9. **TimelineView** renders, groups filtered thoughts by createdAt date
10. User clicks "Surprise"
11. **Home** selects random thought from filtered results
12. **ThoughtList** scrolls to and highlights that thought

### WF3: Tag Derivation

1. App loads, `useThoughts` initializes
2. Calls `deriveTags(allThoughts)` on mount
3. **tagModel.deriveTags()** collects all unique tag names
4. For each tag, computes color via hash: `tagColor = getTagColor(tagName)`
5. Returns `Tag[]` with names and colors
6. **FilterPanel** displays tags in multi-select
7. **ThoughtCard** displays tags with computed colors
8. New thought added with tag "newTag"
9. `deriveTags()` recomputed, "newTag" auto-included with deterministic color

---

## 13. Error Handling & Edge Cases

### localStorage Unavailable

- **Detection**: Try/catch on write, or quota exceeded error
- **Behavior**: Log warning, allow app to continue with in-memory state
- **Recovery**: User data lost on page reload (acceptable for V1)

### Corrupted localStorage Data

- **Detection**: JSON.parse fails
- **Behavior**: Log error, reset to empty array
- **UX**: User sees empty state, can start fresh

### Duplicate Tag Names (Different Cases)

- **Current Design**: "Work" and "work" treated as different tags
- **Rationale**: Keep it simple; users responsible for consistency
- **Future**: Could normalize to lowercase in V2

### Performance Degradation

- **Threshold**: 10K+ thoughts in localStorage
- **Mitigation**: Consider pagination or indexing in future
- **V1 Scope**: No optimization needed (target: thousands)

---

## 14. Deployment & Build

- **Build Tool**: Vite (from AppShell)
- **Output**: Static SPA (HTML + JS + CSS)
- **Hosting**: Any static file server (GitHub Pages, Netlify, Vercel)
- **Browser Support**: Modern browsers with localStorage support (all current versions)
- **No Build-Time Configuration**: No environment variables needed (no backend)

---

## Related User Stories

(To be populated by @po)

---

## Architecture Decisions Log

| Decision | Rationale | Trade-off |
|---|---|---|
| localStorage only, no backend | Privacy, simplicity, fast MVP | No multi-device sync |
| React hooks + Context, no Redux | Minimal dependencies, sufficient for simple state | Harder scaling if state becomes complex |
| Tags derived, not stored | Single source of truth, auto-cleanup | Tag deletion happens automatically |
| Deterministic color hash | Consistent UX, no DB needed | No user customization |
| Immutable thoughts in V1 | Encourages authentic journaling, no edit UI | Can't correct mistakes |
| No filter persistence | Stateless, simpler logic | User loses filter state on reload |

---

## Future Considerations (Out of V1 Scope)

- [ ] Edit/Delete with version history
- [ ] Cloud sync with authentication
- [ ] Advanced search (regex, fuzzy matching)
- [ ] Bulk export (CSV, JSON)
- [ ] Sharing (read-only links)
- [ ] Mobile native app
- [ ] Dark mode toggle
- [ ] Full-text indexing for performance
- [ ] Collaborative journaling (multi-user)
