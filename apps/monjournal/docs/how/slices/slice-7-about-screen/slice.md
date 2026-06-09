<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

# Slice 7 — About Screen

## Overview

This slice implements the About screen feature for MonJournal, providing users with information about the application's vision, team, and purpose. The About screen is a standalone, read-only informational page accessible via the `/about` route, with navigation links to related sections of the application.

The slice includes:
1. **AboutScreen component** — main screen rendering team information, vision statement, and navigation
2. **Route registration** — integration with React Router at `/about`
3. **Navigation links** — consistent navigation from Help screen and back-home link
4. **Responsive layout** — adapts to mobile and desktop viewports
5. **Theme integration** — uses existing CSS theme (background, text, border colors)

This is a **feature slice** that delivers a complete user-facing feature independently from core journaling functionality.

## Technical Scope

### Route Definition

- **Path**: `/about`
- **Component**: `AboutScreen`
- **Type**: Lazy-loaded route (imported in main.tsx via dynamic import)
- **Access**: Navigation link from Help screen (HelpScreen.tsx)
- **Back navigation**: "← Back Home" button links to root `/`

### Components

**AboutScreen.tsx**
- Location: `src/screens/AboutScreen.tsx`
- Type: Functional React component
- Props: None (stateless, no data dependencies)
- Returns: JSX rendering the about content
- Styling: Tailwind CSS classes (flex-grow, bg-background, text-foreground, py-12, px-8, max-w-2xl, etc.)

### Modules & Exports

1. **AboutScreen.tsx**
   - Export: `AboutScreen` — named export (React component)
   - Export: `default` — default export (same component)
   - Imports: React, Link from react-router-dom, Button from `@/components/ui/button`

### Content Structure

**H1 Heading**: "About Us"
- Subtitle: "MonJournal — Foundation for OneTicket Applications"

**Section 1: Our Vision**
- **H2**: "Our Vision"
- **Content**: Two paragraphs describing MonJournal as a reference implementation, best practices in routing/error handling/state/testing, and philosophy of building robust foundations

**Section 2: Our Team**
- **H2**: "Our Team"
- **Grid layout**: 3 team cards displayed in a responsive grid
  - Card 1: "Architecture Team" — "Designing scalable systems and patterns"
  - Card 2: "Development Team" — "Building high-quality frontend experiences"
  - Card 3: "Quality Assurance" — "Ensuring reliability and user satisfaction"
- Each card: bordered container with h3 title and description paragraph

**Navigation**
- **Button**: "← Back Home" — outlined button with Link to `/`

### Styling & Layout

- **Container**: Flex column with grow, padding, responsive max-width (max-w-2xl)
- **Background**: `bg-background` (theme color)
- **Text color**: `text-foreground` (theme color)
- **Card styling**: 
  - Border: 1px border-border
  - Padding: p-4
  - Border radius: rounded
  - Gap: grid-cols-1 (single column) with gap-4
- **Headings**:
  - H1: text-4xl, font-bold, mb-2
  - H2: text-2xl, font-bold, mb-4
  - H3 (card titles): font-bold, text-lg
- **Text styles**:
  - Secondary text (subtitles, descriptions): text-muted-foreground
  - Card descriptions: text-sm, text-muted-foreground
- **Spacing**: py-12 (vertical padding), px-8 (horizontal padding), mb-8 (section margins)

## Acceptance Criteria

1. ✅ AboutScreen component is created at `src/screens/AboutScreen.tsx`
2. ✅ Component exports both named and default exports
3. ✅ Route `/about` is registered in main.tsx with lazy loading
4. ✅ About screen displays "About Us" heading and subtitle
5. ✅ Vision section displays two paragraphs about MonJournal's purpose
6. ✅ Team section displays three team cards with titles and descriptions
7. ✅ "← Back Home" button navigates to `/` on click
8. ✅ About screen uses theme colors (bg-background, text-foreground, border-border)
9. ✅ Layout is responsive and uses Tailwind CSS grid
10. ✅ Navigation link from Help screen to `/about` works correctly
11. ✅ All imports resolve correctly (React, Link, Button component)
12. ✅ Component renders without errors or console warnings

## Testing Strategy

### Unit Tests

- **Component rendering**: AboutScreen renders without crashing
- **Navigation links**: "Back Home" button Link to="/" renders correctly
- **Content presence**: All heading texts and descriptions are present
- **CSS classes**: Tailwind classes are applied (smoke test for styling)

### Integration Tests

- **Route navigation**: `/about` route renders AboutScreen
- **Navigation flow**: Clicking Help screen "About Us" link navigates to `/about`
- **Back navigation**: Clicking "← Back Home" button navigates to `/`
- **Lazy loading**: AboutScreen is lazy-loaded in main.tsx

### Acceptance Tests (Manual)

- Navigate to `/about` in browser — About Us page renders
- Verify heading, subtitle, vision section, and team cards display correctly
- Click "About Us" link in Help screen — navigates to `/about`
- Click "← Back Home" button — navigates to home page `/`
- Resize browser window — layout remains responsive

### Edge Cases

- Direct URL navigation to `/about` loads correctly
- Back button (browser) from `/about` returns to previous route
- All links (Help → About, About → Home) are keyboard-accessible

## Related Epics

- [Epic 0 — MonJournal MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

This slice does not directly correspond to a user story in the MVP epic, as the About screen is a supplementary informational feature. It provides brand context and team information to users but does not impact core journaling features (thought capture, filtering, viewing).

**Note**: The About screen could be backed by a future user story in a "Phase 1 — Navigation & Information" epic, such as:
- "US-XXX — View About Page" — enables users to learn about the application's purpose and team

### Related Screens & Features

- [HelpScreen](../../../app/src/screens/HelpScreen.tsx) — Help page that links to About screen
- [AppRoutes](../../../app/src/main.tsx) — main application routing where `/about` is registered