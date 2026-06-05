# Epic 0 — MonJournal MVP

## Objective

Enable users to capture, store, and discover their thoughts through a lightweight, friction-free browser application with powerful filtering and dual viewing modes, establishing the foundation for a personal reflection practice.

## Value Statement

Journalers need a simple tool that removes barriers to capturing fleeting ideas and later discovering patterns in their thinking. MonJournal MVP delivers rapid thought capture with automatic timestamping, intelligent multi-criteria filtering, and flexible visualization modes—all without requiring accounts, setup, or cloud infrastructure. By keeping thoughts immutable and providing deterministic visual organization through tags, the app transforms casual note-taking into a meaningful practice of self-reflection.

## Scope

### 1. Thought Storage and List Display with Multi-Criteria Filtering

**What:**
- Store thoughts in browser localStorage with unique IDs, title, content, auto-generated timestamp, and tags
- Display all thoughts as a compact list with cards showing title, truncated content (~100 chars), creation date, and colored tags
- Sort thoughts by creation date (newest first)
- Apply composable multi-criteria filters:
  - **Text search**: case-insensitive substring match on title and content
  - **Date range filter**: show only thoughts created between selected start and end dates (inclusive)
  - **Tag filter**: multi-select to show only thoughts containing at least one selected tag
  - **Surprise filter**: randomly select and highlight one thought from filtered results (serendipity mode)
- Handle empty states: friendly message when no thoughts exist or no results match filters

**Why:**
- Users need rapid access to their captured thoughts without complex query syntax
- Multi-criteria filtering supports diverse discovery patterns (recent reflections, topic focus, browsing history, serendipity)
- Deterministic visual organization through tag colors reduces cognitive load during scanning

### 2. Thought Creation with Auto-Timestamp and Tag Autocomplete

**What:**
- Provide a form with:
  - Title input field (required, placeholder: "Title your thought")
  - Content textarea (required, placeholder: "What's on your mind?")
  - Tag input with autocomplete:
    - Type to search existing tags in real-time
    - Press Enter to add tag or select from suggestions
    - Display added tags as removable chips with deterministic colors
    - Support multiple tags per thought
  - Auto-generated timestamp (not user-editable, set to current time on save)
- Validate form: prevent submission if title or content is empty
- On successful save: redirect to home screen and display new thought at top of list
- Optional: show success feedback (toast notification)

**Why:**
- Fast capture (< 2 seconds) removes friction from the journaling habit
- Auto-timestamp provides reliable temporal ordering without user decision fatigue
- Tag autocomplete reduces friction and encourages consistent tagging across thoughts
- Immutable structure (no edit/delete in MVP) ensures thoughts remain authentic historical records

### 3. Two View Modes (List and Timeline)

**What:**
- **List view** (default):
  - Compact cards displaying thought title, truncated content, creation date, and tags
  - Sorted newest-first
  - All filters apply to list results in real-time
  
- **Timeline view**:
  - Thoughts grouped by creation date with day separators (e.g., "June 4, 2026")
  - Same newest-first ordering; oldest date at bottom
  - All filters apply to grouped results
  - Helps users see thinking patterns across time

- Single toggle button to switch between modes
- Active view mode persists in component state (not localStorage) during the session

**Why:**
- Different viewing modes support different reflection patterns: recent capture (list) vs. chronological patterns (timeline)
- Users can choose perspective based on their current intent
- Timeline view makes thinking patterns visible, supporting deeper self-reflection

### 4. Deterministic Tag Color Assignment

**What:**
- Implement a fixed 8–12 color palette (pre-defined, visually distinct)
- Hash each tag name deterministically to a fixed palette position
- Same tag always renders in the same color across:
  - Thought cards in both list and timeline views
  - Tag filter UI
  - Add thought form
- No user customization of tag colors in MVP

**Why:**
- Consistent visual identity for each tag reduces cognitive load
- Users quickly learn which color represents which topic/category
- Deterministic hashing ensures colors remain stable across sessions and devices

## Out of Scope (MVP)

- **Edit/Delete**: Thoughts are immutable once created; no modification or deletion in V1
- **Cloud sync**: No backend, no authentication, no multi-device synchronization
- **Collaboration**: Single-user only
- **Rich text**: Plain text title and content only
- **Advanced search**: No regex, fuzzy matching, or search within content operators
- **Export/Import**: No bulk data operations
- **Sharing**: No public or private sharing
- **Mobile app**: Browser-based only; responsive design supports mobile web

## Success Criteria

1. ✅ Users can add a thought with title, content, and tags in < 2 seconds
2. ✅ Multi-criteria filters (text, date, tags, surprise) work correctly and update results in real-time
3. ✅ Thoughts persist across browser sessions using localStorage
4. ✅ Tag colors are consistent across all views and sessions
5. ✅ Timeline view correctly groups thoughts by creation date
6. ✅ Text search finds thoughts matching keywords (case-insensitive)
7. ✅ Empty states display friendly messages without errors
8. ✅ Form validation prevents submission of empty title or content

## Related User Stories

- [US-001 — Thought List](user-stories/us-001-thought-list.md)
- [US-002 — Multi-Filter](user-stories/us-002-multi-filter.md)
- [US-003 — Timeline View](user-stories/us-003-timeline-view.md)
- [US-004 — Add Thought](user-stories/us-004-add-thought.md)
- [US-005 — Tag Colors](user-stories/us-005-tag-colors.md)

## Related Slices

- [Slice 1 — Data Foundation](../../how/slices/slice-1-data-foundation/slice.md)
- [Slice 2 — Thought List Display](../../how/slices/slice-2-thought-list-display/slice.md)
- [Slice 3 — Filtering & Search](../../how/slices/slice-3-filtering-search/slice.md)
- [Slice 4 — Add Thought Form](../../how/slices/slice-4-add-thought-form/slice.md)
- [Slice 5 — Help Screen](../../how/slices/slice-5-help-screen/slice.md)
- [Slice 6 — Demo Screen](../../how/slices/slice-6-demo-screen/slice.md)
- [Slice 7 — About Screen](../../how/slices/slice-7-about-screen/slice.md)
