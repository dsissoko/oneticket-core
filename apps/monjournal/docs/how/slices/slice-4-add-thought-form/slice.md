<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

# Slice 4 — Add Thought Form

## Overview

This slice implements the complete user-facing form for capturing new thoughts with title, content, and optional tags. It is an end-to-end feature that enables users to add new thoughts with full validation, autocomplete tag support, and immediate redirect to home.

The slice implements:
1. **AddThought component** — form container with title input, content textarea, and tag input section
2. **Tag input with autocomplete** — free text input with real-time suggestions from existing tags
3. **TagList display** — visual chips showing selected tags with assigned colors and remove option
4. **Form validation** — prevents empty title/content submission
5. **Data persistence** — calls `useThoughts.addThought()` on save
6. **Navigation** — redirects to home after successful save
7. **User feedback** — optional success notification (toast or brief message)
8. **Tag color preview** — displays tag colors in form chips before and after save

## Technical Scope

### Components

1. **AddThought** (main form component)
   - Path: `src/pages/AddThought.tsx`
   - Props: (none; uses `useThoughts` hook and `useNavigate` for routing)
   - State: local form inputs (title, content, selectedTags, tagInput, validationErrors)
   - Behavior:
     - Render title input (required), content textarea (required), tag input section
     - Call validation on every keystroke (debounced, 500ms)
     - Show inline error messages for empty title/content
     - On Submit: call `useThoughts.addThought()`, display success message, redirect to home
     - Cancel: clear form or navigate back to home
   - Styling: Form layout using AppShell theme CSS, responsive for mobile

2. **TagInput** (controlled autocomplete component)
   - Path: `src/components/TagInput.tsx`
   - Props: 
     - `value: string` — current input text
     - `onChange: (text: string) => void`
     - `suggestions: string[]` — list of existing tag names
     - `onAddTag: (tag: string) => void` — called when tag is confirmed
     - `disabled?: boolean`
   - State: (none; fully controlled from parent)
   - Behavior:
     - Render text input field
     - Show dropdown of suggestions filtered by current input (case-insensitive substring match)
     - On Enter key: add tag if input is non-empty
     - On suggestion click: add tag
     - Clear input after tag is added
     - Do not add duplicate tags
     - Do not add empty tags
   - Styling: Input + dropdown suggestion list

3. **TagList** (display selected tags as chips)
   - Path: `src/components/TagList.tsx`
   - Props:
     - `tags: string[]` — array of tag names
     - `onRemoveTag: (tag: string) => void` — called when user removes a tag
   - State: (none)
   - Behavior:
     - Render each tag as a colored chip
     - Show tag name and background color (from tag model)
     - Display remove button (X) on each chip
     - On remove click: call `onRemoveTag()` with tag name
   - Styling: Inline flex chips with tag colors from `getTagColor()`

### Hooks

1. **useThoughts** (existing, from Slice 1)
   - Used to: call `addThought()` on form submit
   - Used to: fetch existing tags via `getTags()` for autocomplete suggestions

### Utilities

1. **getTagColor()** (existing, from Slice 1)
   - Used to: assign colors to tags in TagList preview

### Data Flow

**WF1: Capture a Thought**

1. User navigates to `/add`
2. **AddThought** loads, renders form with empty inputs
3. **AddThought** calls `useThoughts.getTags()` to populate autocomplete suggestions
4. User enters title, content, tags
5. User clicks Save
6. **AddThought** validates title and content (no empty fields)
7. If validation fails: show error messages, do not submit
8. If validation passes:
   - Create new Thought object with `createThought(title, content, tags)`
   - Call `useThoughts.addThought(thought)`
   - Display success message (optional toast)
   - Call `useNavigate()` to redirect to `/`
9. User sees new thought at top of home screen with assigned tag colors

### Form Layout

```
[AddThought Page]
┌─────────────────────────┐
│ Add a New Thought       │
├─────────────────────────┤
│ Title *                 │
│ [________title input___]│
│ (error message if empty)│
│                         │
│ Content *               │
│ [______content textarea]│
│ [______text area____   ]│
│ (error message if empty)│
│                         │
│ Tags (optional)         │
│ [___tag input + ▼______ ]│
│ ┌─ tag suggestion 1     │
│ ├─ tag suggestion 2     │
│ └─ tag suggestion 3     │
│                         │
│ Selected Tags:          │
│ [tag1 ✕] [tag2 ✕]      │
│ (colors shown)          │
│                         │
│ [Cancel] [Save]         │
└─────────────────────────┘
```

## Implementation Steps

1. **Create AddThought page component** (`src/pages/AddThought.tsx`)
   - Initialize state for title, content, selectedTags, tagInput, errors
   - Fetch suggestions on mount via `useThoughts.getTags()`
   - Render form with title, content, TagInput, TagList, buttons
   - Implement validation logic (title and content required)
   - Implement form submit handler

2. **Create TagInput component** (`src/components/TagInput.tsx`)
   - Controlled input with local dropdown state
   - Filter suggestions based on input value (case-insensitive)
   - Handle Enter key and click events to add tags
   - Prevent duplicate tags in parent state

3. **Create TagList component** (`src/components/TagList.tsx`)
   - Render tags as colored chips
   - Use `getTagColor()` to compute chip background
   - Render remove button for each tag
   - Call `onRemoveTag()` callback on remove click

4. **Add route to App router** (`src/App.tsx` or routes config)
   - Route: `/add` → AddThought component

5. **Update navigation links** (in Layout/Header)
   - Ensure "Add Thought" link points to `/add`

## Acceptance Criteria

1. ✅ AddThought form displays inputs for title (required), content (required), tags (optional)
2. ✅ TagInput shows autocomplete suggestions from existing tags (filtered by input)
3. ✅ Pressing Enter on TagInput adds the tag (if non-empty and not duplicate)
4. ✅ Clicking a suggestion adds the tag (if not duplicate)
5. ✅ TagList displays selected tags as colored chips with remove option
6. ✅ Tag colors match the deterministic palette from tagModel.getTagColor()
7. ✅ Form validation prevents submission if title or content is empty
8. ✅ Error messages displayed inline for empty title/content
9. ✅ On successful save: `useThoughts.addThought()` is called with new Thought
10. ✅ On successful save: new Thought is persisted to localStorage
11. ✅ On successful save: redirect to home page (`useNavigate('/')`)
12. ✅ Optional success notification displayed (toast or message)
13. ✅ Cancel button clears form or navigates back to home
14. ✅ Form is fully keyboard-accessible (Enter to submit, Tab navigation)
15. ✅ Form is responsive on mobile devices (via AppShell CSS)

## Testing Strategy

- **Component tests**: AddThought (form submission, validation), TagInput (autocomplete, add/remove), TagList (render, remove)
- **Integration tests**: AddThought + useThoughts (verify save → localStorage → redirect)
- **Edge cases**:
  - Empty title and/or content
  - Duplicate tags in input
  - Whitespace-only title/content
  - Very long tag names
  - No existing tags (empty suggestions)
  - Rapid form submissions (should only save once)

## Dependencies

- **Depends on**: Slice 1 (Data Foundation)
  - Uses: `useThoughts` hook
  - Uses: `createThought()` function
  - Uses: `getTagColor()` for tag color display
  - Uses: `getTags()` method for autocomplete suggestions

## Related Epics

- [Epic 0 — MonJournal MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-004 — Add Thought](../../what/epics/epic-0-mvp/user-stories/us-004-add-thought.md)
- [US-005 — Tag Colors](../../what/epics/epic-0-mvp/user-stories/us-005-tag-colors.md)