# MonJournal Product Specification

<!-- SITE_DESCRIPTION: Personal thought journal for capturing and filtering daily thoughts -->

## 1. Vision

MonJournal is a personal thought journal application designed for individuals who want to capture, organize, and reflect on their daily thoughts quickly and effortlessly. The app enables users to record fleeting ideas, observations, and reflections with automatic timestamping, then revisit and explore them through powerful filtering and viewing options. By keeping thoughts immutable and providing flexible discovery mechanisms (text search, date ranges, tags, and surprise selection), MonJournal transforms casual note-taking into a meaningful practice of self-reflection.

## 2. Users and Actors

**Primary User: The Journaler**
- Busy professionals, students, or anyone who wants to capture thoughts as they occur
- Seeks a lightweight, frictionless tool (no login, no sync complexity)
- Values quick capture and later reflection
- Uses the app on a single device (browser-based)
- May not be tech-savvy; prefers simplicity over advanced features

**Characteristics:**
- Occasional to frequent user (journaling habit varies)
- Wants to capture and organize, not manage infrastructure
- Appreciates visual cues (colors) for quick recognition
- Values immutability (thoughts once written are permanent records)

## 3. Problems to Solve

1. **Friction in capturing thoughts**: Users need a quick, distraction-free way to record ideas without complex UIs or account setup
2. **Thought discovery**: Users struggle to find specific thoughts later without powerful filtering (text, date, tags)
3. **Reflection patterns**: Users lack visibility into their thinking patterns across time, prompting the need for timeline and list views
4. **Tag management**: Without deterministic color assignment, tags feel arbitrary and don't aid visual scanning
5. **Data anxiety**: Users need confidence their thoughts are safe locally without relying on cloud storage

## 4. Product Goals

1. **Enable rapid thought capture**: Form submit in < 2 seconds with auto-timestamp
2. **Empower thought discovery**: Support multi-criteria filtering (text, date, tags, serendipity)
3. **Support reflection modes**: Dual views (list for recent, timeline for chronology) foster different reflection styles
4. **Build visual habits**: Consistent tag colors reduce cognitive load and enable quick visual scanning
5. **Ensure data privacy**: Keep all data in localStorage; no backend, no telemetry, no cloud sync

## 5. Out of Scope

- **Edit/Delete in V1**: Thoughts are immutable once created (encourages authentic recording)
- **Cloud sync**: No backend, no authentication, no multi-device sync
- **Collaboration**: Single-user only
- **Advanced rich text**: Plain text title and content only
- **Search within content**: Text search covers title and content but no regex or fuzzy matching
- **Export/Import**: No bulk operations in V1
- **Sharing**: No public or private sharing
- **Mobile app**: Browser-based only; responsive design supports mobile web

## 6. Business Concepts

**Thought**
- Core entity: a captured moment of reflection
- Attributes: unique ID (generated on creation), title (required), content (required), createdAt (auto-generated timestamp, not editable), tags (optional array of tag names)
- Immutable: once created, never modified or deleted
- Persistence: stored in browser localStorage

**Tag**
- Lightweight categorization: users assign one or more tags to a thought
- Name: user-defined string (e.g., "work", "personal", "idea")
- Color: deterministically derived from tag name using a fixed 8–12 color palette (same tag always gets same color)
- No separate tag entity: tags are computed from all thoughts (any tag that appears in any thought's tag array is a valid tag)

**Filter State**
- Text search: filters thoughts by matching title or content (case-insensitive substring match)
- Date range: filters thoughts created between start and end dates (inclusive)
- Tag selection: filters thoughts that have at least one of the selected tags
- Surprise filter: randomly selects one thought and highlights it (serendipity mode)
- Filters are composable: all active filters are applied together (AND logic)

**View Modes**
- List view: compact cards showing title, truncated content, creation date, and tags, sorted newest-first
- Timeline view: thoughts grouped by creation date with day separators, same newest-first ordering, filters apply to grouped results
- Toggle control: single button to switch between modes; active mode is persisted in component state (not localStorage)

## 7. Product Capabilities

1. **Home Screen**
   - Display all thoughts as cards (list view by default)
   - Show thought title, truncated content (first ~100 chars), creation date (relative or absolute), and assigned tags
   - Tags displayed with their deterministic colors
   - Sorted by creation date, most recent first
   - Handle empty state (no thoughts yet)

2. **Multi-Criteria Filtering**
   - Text search: enter keyword to filter title and content (case-insensitive)
   - Date range picker: select start and end dates; filter thoughts within range
   - Multi-select tag filter: choose one or more tags to show only matching thoughts
   - Surprise filter button: randomly select one thought, highlight and jump to it
   - Filters are combinable and applied simultaneously

3. **Timeline View**
   - Toggle from list view to group thoughts by date
   - Display day separators (e.g., "June 4, 2026")
   - Show thoughts grouped under their date, oldest group at bottom
   - Filters applied to timeline (same multi-criteria filtering)

4. **Add Thought Form**
   - Title input (required, visible placeholder "Title your thought")
   - Content textarea (required, visible placeholder "What's on your mind?")
   - Tag input field with autocomplete:
     - Type to search existing tags
     - Press Enter to add a tag or select from suggestions
     - Display added tags as removable chips/badges with colors
     - Support multiple tags
   - Automatic timestamp (not user-editable, set to server time on save)
   - Form validation: prevent submission if title or content is empty
   - On save: redirect to home screen, new thought appears at top
   - Success feedback (optional toast notification)

5. **Deterministic Tag Colors**
   - Each tag name is hashed to a fixed position in a color palette (8–12 colors)
   - Same tag always renders in the same color across the app
   - Color palette: fixed, pre-defined, visually distinct
   - Visible in add form, thought cards, tag filter UI

6. **Empty States**
   - Empty home screen: friendly message encouraging first thought
   - Empty search results: "No thoughts match your filters"

## 8. High-Level Workflows

**WF1: Capture a Thought**
1. User navigates to the app or clicks "Add Thought" button
2. Form opens with title and content fields
3. User types title (required) and content (required)
4. User adds optional tags (type, press Enter or select from suggestions)
5. User clicks "Save" button
6. App validates (title and content non-empty)
7. App creates thought with auto-timestamp and saves to localStorage
8. App redirects to home screen
9. New thought appears at top of list

**WF2: Browse and Reflect**
1. User opens app; home screen displays all thoughts (list view)
2. User may toggle to timeline view to see thoughts grouped by date
3. User may apply filters:
   - Text search to find thoughts mentioning a keyword
   - Date range to view thoughts from a specific period
   - Tags to focus on a category
   - Surprise to discover a random thought
4. User clicks a thought to view full content (or design may show full content on card)
5. User reflects, then returns to home or applies different filters

**WF3: Discover with Surprise Filter**
1. User on home screen clicks "Surprise me" button
2. App randomly selects one thought from current filtered results
3. App highlights or scrolls to that thought
4. User reads it and either:
   - Clicks Surprise again to find another random thought
   - Or browses manually from there

## 9. Business Rules

1. **Thought Immutability**: Once created, a thought's title, content, tags, and timestamp cannot be changed (no edit) and cannot be deleted (no delete in V1)
2. **Auto-Timestamp**: Every thought is timestamped when created; users cannot set a custom timestamp
3. **Tag Derivation**: Tags are derived from the union of all tags across all thoughts; no separate tag management (no create/edit/delete tag operations)
4. **Deterministic Color Assignment**: Tag color is deterministically computed from the tag name using a fixed hash function; no user customization
5. **Immutable Thought Order**: Thoughts always ordered by creation date, newest first
6. **Filter Composability**: All active filters (text, date, tags, surprise) are combined with AND logic
7. **Single Device**: No sync; data is local to this browser on this device
8. **No Backend**: All logic and persistence run in the browser; no server interaction

## 10. Success Criteria

1. **Capture speed**: New thought can be added in < 2 seconds (form open, type, submit)
2. **Filter effectiveness**: Multi-criteria filtering works correctly; results update in real-time
3. **Data retention**: Thoughts persist across browser sessions (localStorage)
4. **Visual consistency**: Tag colors are consistent across all views and sessions
5. **User satisfaction**: Journalers report the app feels fast, simple, and encourages regular journaling
6. **Empty state handling**: No errors or confusion when app is first used or after clearing filters
7. **Timeline accuracy**: Timeline grouping reflects creation dates correctly
8. **Search accuracy**: Text search finds thoughts matching keywords case-insensitively

## 11. Open Questions

1. **Tag autocomplete suggestions**: Should suggestions be limited to top N most-used tags, or show all tags? How many suggestions to show?
2. **Content truncation**: Exactly how many characters to show in thought cards before truncation? (Suggested: 100–150 chars)
3. **Date format in timeline**: Should day separators show relative dates (e.g., "Today", "Yesterday") or absolute dates (e.g., "June 4, 2026")?
4. **Surprise filter behavior**: Should surprise select from all thoughts or only from filtered results?
5. **Tag removal**: In the add form, should users be able to remove selected tags, or is that out of scope for V1?
6. **Form navigation**: On save, should the app stay on the add form or redirect to home? (Specified: redirect to home)
7. **Color palette size**: How many distinct colors in the tag color palette? (Suggested: 8–12)
8. **Performance at scale**: How many thoughts should the app handle before performance degradation? (Estimated: thousands without issue with localStorage)
