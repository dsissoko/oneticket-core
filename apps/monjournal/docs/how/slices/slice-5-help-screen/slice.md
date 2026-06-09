<!-- ⚠️ Legacy — slices are replaced by sprints from this point forward. This document is preserved for historical reference. New epics use `docs/how/sprints/` instead. -->

# Slice 5 — Help Screen

## Overview

This slice implements the Help & FAQ screen for MonJournal, providing user guidance and documentation within the app. The Help Screen serves as an in-app reference guide accessible via the `/help` route, helping users understand core features, troubleshooting, and design customization.

The Help Screen displays a comprehensive FAQ section with collapsible details elements covering:
- Navigation and routing
- Error handling and recovery
- Data persistence and storage
- Bug reporting procedures
- Design customization options

This slice is **user-facing** and supports user self-service assistance, reducing friction when users encounter questions or need guidance about the application.

## Technical Scope

### Route & Component

**Route**: `/help`
- Handled by React Router with lazy-loaded `HelpScreen` component
- Accessible via navigation header or direct URL

**Component**: `HelpScreen.tsx`
- Main screen component responsible for rendering the Help & FAQ page
- Exported as named export and default export for flexibility
- Uses semantic HTML (`<details>`, `<summary>`) for accessible collapsible FAQ items

### Modules & Exports

**1. HelpScreen.tsx** (`src/screens/HelpScreen.tsx`)
- **Exports**: 
  - Named export: `HelpScreen()` — React functional component
  - Default export: `HelpScreen` component
- **Type**: `React.ReactElement` return type
- **Props**: None — screen is self-contained
- **Content Structure**:
  - Main heading: "Help & FAQ"
  - Section 1: FAQ items (5 collapsible details elements)
    - "How do I navigate between pages?"
    - "What happens if I encounter an error?"
    - "Is my data persisted?"
    - "How do I report a bug?"
    - "Can I customize the design?"
  - Section 2: Quick Links
    - Home Page link
    - About Us link
    - Debug console note
    - Test 404 page link
  - Footer: "Back Home" button

### Styling & Layout

- **Container**: Full-width, flex-grow for responsive height
- **Background**: Uses CSS custom properties `bg-background` and `text-foreground`
- **Content area**: Max-width wrapper for readability (max-w-2xl)
- **Spacing**: Consistent padding (py-12 px-8) and margin between sections
- **Typography**:
  - Main heading: text-4xl, font-bold
  - Section heading: text-2xl, font-bold
  - FAQ summary: font-bold, text-lg with hover state (text-primary)
  - FAQ content: text-muted-foreground, base size
- **Interactive elements**:
  - FAQ items: `<details>` with border, rounded corners, cursor pointer
  - Hover effect on `<summary>`: color transition to primary
  - Links: text-primary with underline on hover
  - Button: variant="outline" from UI component library

### Integration Points

- **React Router**: Route definition with path `/help`
- **Navigation**: Accessible via header navigation or direct URL
- **Button Component**: Uses `@/components/ui/button` for consistent styling
- **Link Component**: Uses `react-router-dom` Link for internal navigation
- **CSS Framework**: Tailwind CSS with frozen design tokens (AppShell CSS)

## Implementation Steps

1. **Component created** (`src/screens/HelpScreen.tsx`)
   - Functional component returning JSX
   - Semantic HTML structure with `<details>` and `<summary>`
   - Five FAQ items with collapsible content
   - Quick Links section with internal/external links
   - Back Home navigation button

2. **Route registration** (in routing configuration)
   - Add `/help` route mapping to `HelpScreen` component
   - Ensure accessibility in main navigation menu

3. **Navigation integration**
   - Add Help link to main navigation header
   - Ensure Help is accessible from home page or header menu

4. **Styling verification**
   - Confirm Tailwind CSS classes render correctly
   - Verify responsive layout on mobile/tablet/desktop
   - Test hover states and interactive elements

5. **Accessibility review**
   - `<details>` and `<summary>` provide semantic structure
   - All links and buttons properly labeled
   - Color contrast meets WCAG AA standards
   - Keyboard navigation works (native browser support for details)

## Acceptance Criteria

1. ✅ HelpScreen component renders at route `/help`
2. ✅ Help page displays main heading "Help & FAQ"
3. ✅ Five FAQ items present with collapsible `<details>` elements
4. ✅ FAQ summaries are clickable and expand/collapse on click
5. ✅ FAQ content displays full text when expanded
6. ✅ Navigation guide explains React Router client-side routing
7. ✅ Error handling section describes error boundary behavior
8. ✅ Data persistence section mentions localStorage and React Query
9. ✅ Bug reporting section directs users to GitHub/console
10. ✅ Design customization section explains Tailwind CSS tokens
11. ✅ Quick Links section includes Home, About, and test links
12. ✅ Back Home button navigates to root route `/`
13. ✅ Layout is responsive on mobile, tablet, and desktop
14. ✅ Styling uses Tailwind CSS with AppShell design tokens
15. ✅ Color contrast meets WCAG AA accessibility standards
16. ✅ Links open in appropriate target (internal via React Router)
17. ✅ Help is accessible from main navigation header

## Testing Strategy

- **Unit tests**:
  - HelpScreen component renders without crashing
  - All FAQ items are present and collapsible
  - Quick Links render with correct `href` attributes
  - Back Home button links to `/`

- **Integration tests**:
  - Route `/help` loads HelpScreen component
  - Navigation from home page to help page works
  - Help page accessible from header navigation
  - Back Home button returns to home page

- **Accessibility tests**:
  - `<details>` elements keyboard navigable
  - Color contrast meets WCAG AA (4.5:1 for text)
  - All interactive elements have visible focus state
  - Screen reader announces FAQ item states (expanded/collapsed)

- **Visual/E2E tests**:
  - FAQ items collapse/expand on click
  - Hover states visible on summaries and links
  - Layout responsive at breakpoints (mobile 320px, tablet 768px, desktop 1024px)
  - Links navigate to correct destinations
  - Button styling matches design system

- **Edge cases**:
  - Direct URL navigation to `/help`
  - FAQ items with long content (text wrapping)
  - Mobile layout with narrow viewport
  - No JavaScript fallback behavior (semantic HTML)

## Dependencies

- **React**: Functional components, JSX
- **React Router**: `Link` component, route definitions
- **Tailwind CSS**: Responsive utility classes, design tokens
- **UI Components**: Button component from AppShell
- **AppShell CSS**: Base styles, responsive grid, color tokens

## Related Epics

- [Epic 0 — MonJournal MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- US-006 — Help Screen (if epic contains user story for help feature)