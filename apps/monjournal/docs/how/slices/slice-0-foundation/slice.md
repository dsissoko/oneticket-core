# Slice 0 — Foundation & Skeleton

## Goal

Establish the minimal walking skeleton: configure the tech stack, set up project structure, initialize React + Vite + Primer + TypeScript, create the main app layout, and ensure the development environment is working.

## Scope

This is the **foundation slice** — all subsequent feature slices depend on it. It includes:

- Project initialization and configuration
- Vite + React + TypeScript setup
- GitHub Primer UI integration
- Main app layout and navigation structure
- localStorage adapter (empty, ready for features)
- Development server running and compiling without errors
- Basic styling and theme configuration

## Related User Stories

This slice does not directly deliver user-facing features. It provides the technical foundation for all other slices.

**Dependencies for other slices:**
- [US-001 — Create Thought](../../../../what/epics/epic-0-mvp/user-stories/us-001-create-thought.md)
- [US-002 — List Thoughts Stream](../../../../what/epics/epic-0-mvp/user-stories/us-002-list-thoughts.md)
- [US-003 — Edit and Delete a Thought](../../../../what/epics/epic-0-mvp/user-stories/us-003-edit-delete-thought.md)
- [US-004 — Tag Thoughts](../../../../what/epics/epic-0-mvp/user-stories/us-004-tag-thoughts.md)
- [US-005 — Filter by Tag](../../../../what/epics/epic-0-mvp/user-stories/us-005-filter-by-tag.md)
- [US-006 — Search Thoughts](../../../../what/epics/epic-0-mvp/user-stories/us-006-search-thoughts.md)
- [US-007 — Random Surprise](../../../../what/epics/epic-0-mvp/user-stories/us-007-random-surprise.md)

## Implementation Tasks

### 1. Project Setup & Configuration

- Create Vite project with React + TypeScript template
- Configure `vite.config.ts` (port, build output, etc.)
- Install dependencies: React 18, Primer UI (@primer/react), react-markdown
- Configure TypeScript (`tsconfig.json`) with strict mode
- Set up ESLint and Prettier (linting & formatting)

### 2. Directory Structure

```
apps/monjournal/app/
├── src/
│   ├── main.tsx                 # Vite entry point
│   ├── App.tsx                  # Main app component
│   ├── index.css                # Global styles
│   ├── components/
│   │   ├── ThoughtForm.tsx
│   │   ├── ThoughtStream.tsx
│   │   ├── ThoughtItem.tsx
│   │   ├── FilterBar.tsx
│   │   ├── SearchBar.tsx
│   │   └── SurpriseModal.tsx
│   ├── hooks/
│   │   ├── useThoughts.ts       # Custom hook for thought management
│   │   ├── useFilters.ts        # Custom hook for filtering
│   │   └── useSurprise.ts       # Custom hook for random selection
│   ├── types/
│   │   └── thought.ts           # TypeScript interfaces
│   ├── domain/
│   │   ├── thoughtValidator.ts  # Validation logic
│   │   ├── thoughtFilter.ts     # Filtering logic
│   │   └── thoughtSort.ts       # Sorting logic
│   └── storage/
│       └── storageAdapter.ts    # localStorage wrapper
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

### 3. React App Structure

**App.tsx** — Main component with layout:

```typescript
export function App() {
  return (
    <ThoughtsProvider>
      <Header>
        <SearchBar />
        <FilterBar />
        <SurpriseButton />
      </Header>
      <Main>
        <ThoughtForm />
        <ThoughtStream />
      </Main>
      <SurpriseModal />
    </ThoughtsProvider>
  )
}
```

### 4. Primer UI Integration

- Import Primer components: `<Box>`, `<Stack>`, `<Button>`, `<TextInput>`, `<FormGroup>`, `<Heading>`
- Apply Primer theme (light/dark mode support)
- Use Primer spacing and typography tokens
- Ensure responsive layout using Primer's responsive utilities

### 5. Types & Interfaces

**types/thought.ts:**

```typescript
export interface Thought {
  id: string
  text: string
  tags: string[]
  createdAt: number
  updatedAt?: number
}

export type ThoughtInput = Omit<Thought, 'id' | 'createdAt'>
```

### 6. Storage Adapter (Empty Implementation)

**storage/storageAdapter.ts:**

```typescript
export class StorageAdapter {
  private readonly KEY = 'monjournal_thoughts'

  loadThoughts(): Thought[] {
    // Placeholder: load from localStorage
    return []
  }

  saveThoughts(thoughts: Thought[]): void {
    // Placeholder: save to localStorage
  }

  addThought(thought: Thought): void {
    // Placeholder
  }

  updateThought(id: string, updates: Partial<Thought>): void {
    // Placeholder
  }

  deleteThought(id: string): void {
    // Placeholder
  }
}
```

### 7. Component Stubs

Create empty/stub components that will be completed in feature slices:

- **ThoughtForm.tsx** — Form stub (no logic)
- **ThoughtStream.tsx** — List stub (no data)
- **FilterBar.tsx** — Filter stub (no filters)
- **SearchBar.tsx** — Search stub (no search)
- **SurpriseModal.tsx** — Modal stub (no surprise logic)

### 8. Custom Hooks (Empty)

Create hook stubs:

- **useThoughts()** — Returns empty array, stub functions
- **useFilters()** — Returns empty filters, stub functions
- **useSurprise()** — Returns null, stub functions

### 9. Development Environment

- Run `npm install` and verify all dependencies
- Start dev server: `npm run dev`
- Verify hot module replacement (HMR) works
- Verify TypeScript compilation without errors
- Browser loads app without console errors

### 10. Styling & Theme

- Configure Primer theme (light/dark mode toggle if desired)
- Set up global CSS (reset, base typography, spacing)
- Ensure Primer CSS is imported and available
- Test responsive behavior on mobile viewport

## Acceptance Criteria

- ✅ Vite development server starts without errors
- ✅ React app renders in browser (App component visible)
- ✅ TypeScript compiles with no errors in strict mode
- ✅ Primer UI components are available and styled
- ✅ Directory structure matches the plan above
- ✅ All stub components and hooks are created and importable
- ✅ localStorage adapter is created (empty implementation)
- ✅ Hot module reload (HMR) works during development
- ✅ Browser console has no warnings or errors
- ✅ Responsive layout works on mobile (320px) and desktop (1920px)

## Technical Notes

- **No backend:** This entire slice is frontend-only
- **No database:** No persistence yet; storage adapter is just structure
- **Type safety:** All code written in TypeScript with strict mode
- **Accessibility:** Use Primer components for built-in a11y
- **Testing:** Not included in this slice; tested manually via dev server

## Deliverables

1. Working Vite development environment
2. React app structure with stub components
3. TypeScript type definitions
4. Storage adapter interface (empty implementation)
5. Custom hooks stubs
6. Primer UI integration verified
7. No runtime or TypeScript errors

## Dependencies

- Must complete **before** any feature slice
- No dependencies on other slices

## Estimated Effort

**1-2 days** (one developer, including configuration and setup)

---

**Next:** [Slice 1 — Thought CRUD & List](../slice-1-thought-crud/slice.md)
