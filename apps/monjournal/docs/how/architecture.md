# Architecture — MonJournal

**Project:** MonJournal (Personal Thought Journal)  
**Stack:** React + Vite + Primer UI + TypeScript + localStorage  
**Scope:** Single-page application for personal thought management  
**Last Updated:** 2026-05-31

---

## 1. Vision & Goals

MonJournal is a minimalist, elegant personal journal application that enables users to capture, organize, and explore their daily thoughts. The system prioritizes simplicity and immediate local storage without any cloud synchronization or multi-user support.

## 2. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | React 18 + TypeScript | Component-based UI, type safety |
| **Build Tool** | Vite | Fast development builds, optimized production output |
| **UI System** | GitHub Primer | Consistent, accessible design components |
| **State Management** | React Hooks (useState, useContext, useCallback) | Lightweight, sufficient for single-page scope |
| **Persistence** | localStorage (browser API) | No server needed, local-first, instant sync |
| **Markdown Rendering** | react-markdown or similar | Display basic markdown (bold, italic, lists) |
| **Styling** | Primer CSS (via @primer/react) | Design system alignment, responsive by default |

## 3. Architecture Pattern

**Layered Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         UI Layer (Primer Components)    │
│  (Forms, List, Tags, Filters, Buttons)  │
└─────────────────────────────────────────┘
                    ↓ uses
┌─────────────────────────────────────────┐
│      React Hooks & State Management     │
│ (useThoughts, useFilters, useSearch)    │
└─────────────────────────────────────────┘
                    ↓ manages
┌─────────────────────────────────────────┐
│      Domain Logic & Business Rules      │
│   (Thought model, filtering, sorting)   │
└─────────────────────────────────────────┘
                    ↓ persists
┌─────────────────────────────────────────┐
│   Storage Layer (localStorage adapter)  │
│      (JSON serialization, CRUD ops)     │
└─────────────────────────────────────────┘
```

## 4. Core Data Model

### Thought Entity

```typescript
interface Thought {
  id: string;                    // UUID or nanoid
  text: string;                  // Markdown text (max 200 chars)
  tags: string[];                // Case-insensitive tag array
  createdAt: number;             // Timestamp (milliseconds)
  updatedAt?: number;            // Optional last modification timestamp
}
```

### Tag

Tags are derived from thoughts — no separate tag entity. Tags are stored as lowercase strings to ensure case-insensitivity.

## 5. Component Architecture

### Top-Level Layout

```
App
├── Header (title, controls)
├── SearchBar (keyword input)
├── FilterBar (tag pills, clear filters)
├── ThoughtForm (create/edit thought with tags)
├── ThoughtStream (list of thoughts, newest first)
│   └── ThoughtItem (individual thought with actions)
│       ├── ThoughtContent (markdown rendered)
│       ├── ThoughtTags (tag display)
│       └── ThoughtActions (edit, delete buttons)
└── SurpriseModal (random thought overlay)
```

### Key Components

| Component | Purpose | Responsibility |
|-----------|---------|-----------------|
| **ThoughtForm** | Create/edit thoughts | Validate text (≤200 chars), collect tags, emit save |
| **ThoughtStream** | Display thoughts | Render list sorted by date (newest first), apply filters |
| **ThoughtItem** | Individual thought | Display content, tags, creation date, action buttons |
| **FilterBar** | Tag filtering | Show available tags, manage selection state |
| **SearchBar** | Keyword search | Capture and emit search query |
| **SurpriseButton** | Random selection | Pick random thought from current filtered set |

## 6. State Management Strategy

Use React context + hooks for lightweight state:

```typescript
// Main app state shape
interface AppState {
  thoughts: Thought[];           // All thoughts from storage
  selectedTags: string[];        // Currently selected filter tags
  searchQuery: string;           // Current search keyword
  showSurprise: boolean;         // Surprise mode active
  surpriseThought?: Thought;     // Current surprise selection
  editingId?: string;            // ID of thought being edited
}
```

### Hooks & Context

- **useThoughts()** — Load/save thoughts, CRUD operations
- **useFilters()** — Manage tag selection and search query
- **useSurprise()** — Pick random thought from filtered set
- **ThoughtsContext** — Global state provider

## 7. Data Flow

### Creating a Thought

1. User enters text in **ThoughtForm** (validated: ≤200 chars)
2. User optionally adds tags (comma-separated)
3. User clicks "Save"
4. **useThoughts** hook creates Thought object with auto-timestamp
5. New thought saved to **localStorage** (JSON serialization)
6. UI state updated → **ThoughtStream** re-renders
7. New thought appears at top of list

### Filtering & Searching

1. User interacts with **SearchBar** or **FilterBar**
2. State updates: `searchQuery` or `selectedTags`
3. **useFilters** hook applies filter logic:
   - Text search (case-insensitive substring match)
   - Tag filter (AND logic: thought must have ALL selected tags)
4. **ThoughtStream** receives filtered list, re-renders

### Surprise Feature

1. User clicks **Surprise button**
2. **useSurprise** picks random thought from current filtered set
3. **SurpriseModal** displays thought in overlay
4. User can click "Next" to pick another random, or "Close" to return to list

## 8. Storage & Persistence

**localStorage Strategy:**

- **Key:** `monjournal_thoughts` (single collection)
- **Format:** JSON array of Thought objects
- **Size:** Monitor localStorage quota (~5-10MB typical, depends on device)
- **Sync:** Synchronous write on every CRUD operation
- **Recovery:** On app load, deserialize localStorage → populate state

```typescript
// Storage adapter interface
interface StorageAdapter {
  loadThoughts(): Thought[];
  saveThoughts(thoughts: Thought[]): void;
  addThought(thought: Thought): void;
  updateThought(id: string, updates: Partial<Thought>): void;
  deleteThought(id: string): void;
}
```

## 9. Key Business Rules in Code

| Rule | Implementation |
|------|----------------|
| Max 200 chars | ThoughtForm textarea maxLength + state validation |
| Auto-timestamp | `createdAt: Date.now()` on create (immutable) |
| Newest first | Sort by `createdAt` descending |
| Case-insensitive tags | Normalize to lowercase on input |
| Deletion is permanent | No soft delete, direct localStorage removal |
| Single page | No routing, all views in App component |
| Real-time updates | State changes trigger immediate re-renders |

## 10. Error Handling

- **localStorage quota exceeded:** Display toast warning, prevent saves
- **Corrupted localStorage data:** Fall back to empty array, log to console
- **Invalid markdown:** Pass through as-is, let react-markdown handle sanitization
- **Missing fields on load:** Use default values, log warning

## 11. Performance Considerations

- **Lazy filtering:** Apply filters only on render, not on every keystroke (debounce search)
- **Memoization:** useCallback for event handlers, useMemo for filtered lists
- **Re-render optimization:** Separate components (ThoughtItem) to avoid full-list re-renders
- **localStorage limits:** Warn users if approaching quota (assume ~1000 thoughts max with typical content)

## 12. Responsive Design

- **Mobile-first:** Base layout works on 320px+ screens
- **Primer breakpoints:** Use Primer's responsive utilities (@sm, @md, @lg)
- **ThoughtForm:** Full-width on mobile, 2-column on desktop
- **ThoughtStream:** Single column on mobile, may stack filters on sidebar
- **Touch-friendly:** Buttons and tags have adequate touch targets (≥44px)

## 13. Open Questions & Future Decisions

1. **Markdown flavor:** Should we support links/images, or stick to bold/italic/lists only?
2. **Date display format:** Show full date or relative time ("2 days ago")?
3. **Storage export:** Should we offer JSON/CSV export capability?
4. **localStorage limits:** How to handle users with thousands of thoughts?
5. **Modification timestamp:** Display last-edited date alongside creation date?
6. **Undo/recover:** Should deleted thoughts be archived before permanent removal?

## 14. Deployment & Monitoring

- **Build output:** Static SPA (index.html + JS/CSS bundles)
- **Hosting:** Any static CDN (Vercel, Netlify, S3 + CloudFront)
- **Analytics:** Optional Google Analytics or similar (no personal data leaks)
- **Error reporting:** Optional Sentry integration (client-side errors)
- **No backend:** Purely client-side, no servers to maintain
- **Offline:** Works completely offline once loaded

---

## Related Artifacts

- **Product Spec:** [what/product-spec.md](../what/product-spec.md)
- **Epic:** [what/epics/epic-0-mvp/epic.md](../what/epics/epic-0-mvp/epic.md)
- **User Stories:** [what/epics/epic-0-mvp/user-stories/](../what/epics/epic-0-mvp/user-stories/)
- **C4 Diagrams:** [how/c4/](./c4/)
- **Implementation Slices:** [how/slices/](./slices/)
