<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

---
title: 'Slice 6 — Demo Screen'
---

# Slice 6 — Demo Screen

## Overview

This slice implements the **Demo Screen**, an interactive showcase of MonJournal patterns and capabilities. The screen serves as both a development tool and a learning resource, demonstrating:
- **User management patterns** with CRUD operations
- **Logger integration** with configurable log levels
- **Theme switching** with visual token swatches
- **Real-time streaming** via Server-Sent Events (SSE)
- **Auth0 integration placeholder** for upcoming authentication features

The Demo Screen is accessible at route `/demo` and provides tabbed navigation through different functional areas. It does not directly impact production journaling features but is essential for development validation and future feature preview.

## Technical Scope

### Route

- **Path**: `/demo`
- **Component**: `DemoScreen`
- **Navigation**: Accessible via navigation links or direct URL

### Components

1. **DemoScreen** (`src/screens/DemoScreen.tsx`)
   - Main container component
   - Manages form state (idle, create, edit) and selected user
   - Renders tabbed interface with five tabs: Users, Logger, Theme, Realtime, Auth
   - Handlers: `handleNew()`, `handleEdit()`, `handleCancel()`, `handleSave()`

2. **UserList** (sub-component)
   - Displays paginated user list (3 users per page)
   - Shows user name, email, role badge
   - Provides "New User", "Edit", "Delete" actions
   - Pagination controls (← previous, page indicator, next →)
   - State: `page` (current page number)

3. **UserForm** (sub-component)
   - Create/Edit form for user management
   - Inputs: name, email, role (select dropdown: Admin/User)
   - Validation: react-hook-form with zod resolver
   - Buttons: Cancel, Save
   - Schema: `createUserSchema` from `src/lib/schemas/user`

4. **LoggerTab** (sub-component)
   - Four buttons demonstrating log levels: Debug, Info, Warn, Error
   - Instructions to open DevTools console (F12)
   - Shows current log level from `VITE_LOG_LEVEL` environment variable
   - Uses `logger` module from `src/lib/logger`

5. **ThemeTab** (sub-component)
   - Theme switcher: System, Light, Dark buttons
   - Visual token swatches grid displaying 12 CSS color variables:
     - Background, Foreground, Primary, Secondary, Muted, Accent, Destructive, Border, Card, Popover, Input, Ring
   - Each swatch shows color preview with label
   - Uses `useTheme()` hook from `next-themes`

6. **RealtimeTab** (sub-component)
   - Real-time streaming demonstration via Server-Sent Events
   - Controls: ▶ Start, ■ Stop, ↺ Reset buttons
   - Speed selector: 100ms, 250ms, 500ms, 1s, 2s intervals
   - Progress bar with percentage indicator
   - Live event log showing progress messages and completion status
   - Simulated via MSW with 300 steps at configurable speed
   - Uses `useEventSource()` hook for SSE

7. **AuthTab** (sub-component)
   - Placeholder for Auth0 integration (epic-1-auth0)
   - Links to epic documentation
   - Preview text describing future login/logout and `useAuth()` hook

### Modules

1. **DemoScreen.tsx**
   - Type: `FormMode` = 'idle' | 'create' | 'edit'
   - Constant: `PAGE_SIZE = 3`
   - Component: `DemoScreen` (exported as default)

2. **sampleThoughts.ts** (utility for future integration)
   - Type: `Thought` interface
   - Function: `generateSampleThoughts(): Thought[]`
   - Generates 100 sample thoughts distributed across date range 2017-02-24 to 2026-06-05
   - Provides realistic demo data with diverse titles, content, and tags
   - Function: `generateUUID(): string` (simple v4 generator for sample data)
   - Arrays: `sampleTitles`, `sampleContent`, `sampleTags`

### Hooks & Utilities

1. **useUsers()** — query hook for fetching user list
2. **useCreateUser()** — mutation hook for creating users
3. **useUpdateUser()** — mutation hook for editing users
4. **useDeleteUser()** — mutation hook for deleting users
5. **useEventSource()** — custom hook for SSE connections
6. **useTheme()** — theme management from next-themes
7. **useForm()** — React Hook Form integration
8. **zodResolver()** — schema validation resolver

### Data Models

**User** (from `src/api/types`)
- `id` (string)
- `name` (string)
- `email` (string)
- `role` ('admin' | 'user')

**CreateUserFormData** (from `src/lib/schemas/user`)
- `name` (string, required, min 1)
- `email` (string, required, valid email format)
- `role` ('admin' | 'user', required)

**Thought** (from `src/models/thoughtModel`)
- `id` (string, UUID)
- `title` (string)
- `content` (string)
- `createdAt` (number, timestamp ms)
- `tags` (string[])

### Styling & UI

- **Layout**: Responsive container with max-width 3xl (56rem)
- **Typography**: H1 title "Patterns Demo", subtitle text
- **Components**: Uses Primer UI components (Tabs, Button, Card, Input, Select, Separator)
- **Spacing**: Tailwind classes (py-12, px-4/8, gap-2/3, space-y-3/6)
- **Colors**: Uses CSS variables for theme colors (background, foreground, primary, etc.)
- **Responsive**: Grid layouts adapt (grid-cols-2 sm:grid-cols-4)

## Interfaces

### Hook Return Types

**useUsers()**
```typescript
{
  data?: User[],
  isLoading: boolean,
  isError: boolean
}
```

**useCreateUser()**
```typescript
{
  mutate: (data: CreateUserFormData, options: { onSuccess: () => void }) => void
}
```

**useUpdateUser()**
```typescript
{
  mutate: (payload: { id: string, data: CreateUserFormData }, options: { onSuccess: () => void }) => void
}
```

**useDeleteUser()**
```typescript
{
  mutate: (id: string) => void
}
```

**useEventSource(url: string, eventTypes: string[])**
```typescript
{
  events: { type: string, data: string }[],
  status: 'idle' | 'connecting' | 'open' | 'closed',
  start: () => void,
  stop: () => void,
  reset: () => void
}
```

**useTheme()**
```typescript
{
  theme?: 'light' | 'dark' | 'system',
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}
```

### Event Data Format

**Progress Event**
```json
{
  "type": "progress",
  "data": "{\"step\": 42, \"pct\": 14, \"message\": \"Step 42 / 300\"}"
}
```

**Done Event**
```json
{
  "type": "done",
  "data": "{\"duration\": \"5m 00s\"}"
}
```

## Data Changes

**Data Created**: User records via CRUD operations (isolated to demo, no production impact)
**Data Modified**: User records (create, update, delete) via mutations
**Sample Data**: 100 sample thoughts generated on demand via `generateSampleThoughts()`
**Storage**: All demo data managed via API (not localStorage)

## Sequence Flow

### User Management Flow

```
1. User clicks "+ New User"
   → formMode = 'create', selectedUser = null
   → UserForm renders with empty fields

2. User fills form and clicks "Save"
   → useCreateUser.mutate(data, { onSuccess: handleSave })
   → API creates user
   → On success: formMode = 'idle', form closes
   → UserList re-fetches data

3. User clicks "Edit" on a user
   → formMode = 'edit', selectedUser = user
   → UserForm renders with pre-filled fields

4. User modifies and clicks "Save"
   → useUpdateUser.mutate({ id, data }, { onSuccess: handleSave })
   → API updates user
   → Form closes

5. User clicks "Delete" on a user
   → useDeleteUser.mutate(id)
   → API deletes user
   → UserList re-fetches
```

### Logger Flow

```
1. User clicks log level button (Debug, Info, Warn, Error)
   → logger[level]('[demo] message') called
   → Message appears in browser DevTools console
   → No UI change; console inspection required
```

### Theme Flow

```
1. User clicks theme button (System, Light, Dark)
   → setTheme(theme) called
   → CSS variables update in document root
   → All color swatches update to reflect new theme
   → Selection indicator shown on active button
```

### Real-time Streaming Flow

```
1. User clicks "Start"
   → useEventSource.start() called
   → SSE connection opens to /api/stream?steps=300&interval=intervalMs
   → Server sends 300 progress events at specified interval
   → Each event: { type: 'progress', data: '{"step": N, "pct": P, "message": "..."}' }
   → Progress bar updates in real-time

2. User clicks "Stop"
   → useEventSource.stop() called
   → SSE connection closes
   → Current step preserved

3. User clicks "Reset"
   → useEventSource.reset() called
   → Events cleared, progress bar reset to 0%
   → Status shows "Ready"

4. Stream completes (step 300)
   → Final event: { type: 'done', data: '{"duration": "5m 00s"}' }
   → Progress bar shows 100%, status shows "✓ Done — 5m 00s"
```

### Auth Tab Flow

```
1. User views Auth tab
   → Static content showing epic-1-auth0 description
   → Link to epic documentation provided
   → No interaction
```

## Acceptance Criteria

1. ✅ DemoScreen component renders at route `/demo`
2. ✅ Tabbed interface with 5 tabs: Users, Logger, Theme, Realtime, Auth
3. ✅ Users tab: displays paginated user list (3 per page)
4. ✅ Users tab: "New User" button opens create form
5. ✅ Users tab: "Edit" button opens edit form with pre-filled data
6. ✅ Users tab: "Delete" button removes user from list
7. ✅ Users tab: pagination controls work correctly (← → page indicator)
8. ✅ UserForm: validates name, email, role via zod schema
9. ✅ UserForm: Cancel button closes form without changes
10. ✅ UserForm: Save button persists to API and closes form
11. ✅ Logger tab: four buttons (Debug, Info, Warn, Error) log messages
12. ✅ Logger tab: displays current VITE_LOG_LEVEL from environment
13. ✅ Theme tab: three buttons (System, Light, Dark) switch themes
14. ✅ Theme tab: 12 color swatches display current theme colors
15. ✅ Theme tab: active theme button highlighted
16. ✅ Realtime tab: Start/Stop/Reset controls work
17. ✅ Realtime tab: speed selector (5 options) adjusts SSE interval
18. ✅ Realtime tab: progress bar reflects streaming percentage
19. ✅ Realtime tab: live event log displays last 20 events
20. ✅ Realtime tab: completion status shown as "✓ Done — {duration}"
21. ✅ Auth tab: displays placeholder text and epic link
22. ✅ sampleThoughts module exports `generateSampleThoughts()`
23. ✅ sampleThoughts: generates 100 diverse thought records
24. ✅ sampleThoughts: distributed across date range 2017-02-24 to 2026-06-05
25. ✅ Sample thoughts include varied titles, content, and tags

## Testing Strategy

### Unit Tests

- **thoughtModel**: UUID generation, timestamp validation
- **sampleThoughts**: distribution of dates, tag randomization
- **colorPalette**: color hex validation, count verification
- **filterLogic**: text search, date range, tag filtering (carried from foundation)

### Component Tests

- **DemoScreen**: renders tabs, manages form state (create/edit/idle)
- **UserList**: pagination logic, user display, action buttons disabled during edit
- **UserForm**: form validation, schema errors, submit/cancel handlers
- **LoggerTab**: button click logging
- **ThemeTab**: theme toggle, swatch rendering
- **RealtimeTab**: SSE connection, progress bar updates, event log
- **AuthTab**: static content and link rendering

### Integration Tests

- **User CRUD flow**: create → list → edit → delete
- **Form state management**: opening, editing, saving, closing
- **Theme persistence**: theme selection persists across tab switches
- **Pagination**: page state maintained, disabled at boundaries
- **SSE flow**: connect → progress → complete or stop
- **Logger levels**: all four log levels produce output

### E2E Scenarios

1. Create user → verify in list → edit → verify changes → delete → verify removed
2. Switch theme → verify colors update → verify swatches update
3. Start stream → verify progress updates → stop → reset → verify cleared
4. Log all levels → verify DevTools shows messages
5. Pagination: page 1 → page 2 (if >3 users) → back to page 1

### Edge Cases

- Empty user list
- Single user (pagination hidden)
- User list exactly 3 users (single page)
- Form submission with invalid email
- Missing required fields (name empty)
- SSE stream with 0 events received
- Theme switch during form edit
- Stop stream before completion

## Related Epics

- [Epic 0 — MonJournal MVP](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-001 — Thought List](../../../what/epics/epic-0-mvp/user-stories/us-001-thought-list.md)
- [US-002 — Multi-Filter](../../../what/epics/epic-0-mvp/user-stories/us-002-multi-filter.md)
- [US-003 — Timeline View](../../../what/epics/epic-0-mvp/user-stories/us-003-timeline-view.md)
- [US-004 — Add Thought](../../../what/epics/epic-0-mvp/user-stories/us-004-add-thought.md)
- [US-005 — Tag Colors](../../../what/epics/epic-0-mvp/user-stories/us-005-tag-colors.md)

## Implementation Notes

This slice is **demonstration only** and does not contribute to the production MonJournal experience. It serves:
- **Development reference**: Shows patterns for forms, hooks, API integration, state management
- **Feature preview**: Auth and other upcoming features demonstrated via placeholders
- **Testing ground**: Safe environment for experimenting with UI/UX patterns

The `sampleThoughts` utility is included to support future demo enhancements where the app might be seeded with sample data for first-time visitors.

## Observability Impact

- **Logging**: All user actions in Demo Screen logged at appropriate levels (debug/info)
- **Metrics**: No production metrics affected
- **Errors**: Demo screen errors logged but do not impact core journaling features
- **Performance**: Demo screen isolated; no impact on main application performance