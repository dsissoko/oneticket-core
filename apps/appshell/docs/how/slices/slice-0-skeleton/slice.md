# Slice 0 — AppShell Skeleton: structure, routing, theme, design tokens, MSW pattern

## Purpose

Establish the complete and fully functional skeleton for AppShell that all new projects will copy and adapt. This slice creates the reference architecture with exclusive file ownership, centralized design tokens, and data-fetching patterns that enable zero-conflict parallel development.

At the end of this slice, developers will have a deployable, production-ready skeleton that demonstrates all key patterns: file ownership, responsive layout, theme switching, design tokens, React Router navigation, React Query data fetching, and MSW mocking. New projects simply copy `apps/appshell/app/`, customize three files, and build on it.

---

## Related Epics

- [Epic 0 — AppShell MVP](../../what/epics/epic-0-mvp/epic.md)

---

## Related User Stories

- [US-001: File structure and project setup](../../what/epics/epic-0-mvp/us-001.md)
- [US-002: AppLayout, Header, Footer structure](../../what/epics/epic-0-mvp/us-002.md)
- [US-003: React Router integration](../../what/epics/epic-0-mvp/us-003.md)
- [US-004: ThemeToggle (light/dark/system)](../../what/epics/epic-0-mvp/us-004.md)
- [US-005: Design tokens and tailwind.config.ts](../../what/epics/epic-0-mvp/us-005.md)
- [US-006: MSW + React Query pattern](../../what/epics/epic-0-mvp/us-006.md)
- [US-007: shadcn/ui components integration](../../what/epics/epic-0-mvp/us-007.md)

---

## Implementation Steps

### Step 1: Initialize project structure and configuration files (US-001)

**Objective:** Establish the complete directory structure with exclusive file ownership and configuration files.

**Deliverables:**
- Create directory structure: `src/`, `src/screens/`, `src/components/`, `src/hooks/`, `src/stores/`, `src/mocks/`, `src/lib/`, `src/styles/`
- Create config files: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, `.env.example`, `index.html`, `tailwind.config.ts`, `postcss.config.js`
- Create `.gitkeep` files in empty directories: `src/stores/`, `src/lib/schemas/`
- Document file ownership in `OWNERSHIP.md` (or inline comments in architecture.md)

**Acceptance:**
- All directories exist
- `package.json` includes: vite, react, react-dom, react-router-dom, @tanstack/react-query, msw, tailwindcss, postcss, typescript, vitest, @testing-library/react, shadcn-ui, zod, react-hook-form, lucide-react
- `npm install` succeeds without errors
- `npm run dev` starts the Vite dev server (with missing screens, will show 404 initially)

**Ownership:** Task 0 (setup)

---

### Step 2: Install and configure shadcn/ui components (US-007)

**Objective:** Install shadcn/ui primitives that all screens will consume.

**Deliverables:**
- Run shadcn CLI setup: `npx shadcn-ui@latest init` (Vite config)
- Create/update `components.json` with Vite settings
- Install components: `button`, `card`, `dropdown-menu`, `separator`, `form`, `input`, `label`
- Components appear in `src/components/ui/`
- Ensure React Hook Form and Zod are installed and integrated in `form.tsx`

**Acceptance:**
- `src/components/ui/` directory contains: `button.tsx`, `card.tsx`, `dropdown-menu.tsx`, `separator.tsx`, `form.tsx`, `input.tsx`, `label.tsx`
- Components are importable without errors
- React Hook Form and Zod integration works in `form.tsx`
- TypeScript types are correct

**Ownership:** Task 0 (setup)

---

### Step 3: Create design tokens (CSS variables + Tailwind) (US-005)

**Objective:** Define centralized design tokens that enforce visual consistency across all screens.

**Deliverables:**
- Create `src/styles/globals.css` with:
  - `:root` block defining light mode colors (--background, --foreground, --accent, --border, --muted-background, --muted-foreground)
  - `.dark` block defining dark mode colors
  - Tailwind directives (@tailwind base, components, utilities)
  - PostCSS imports if needed
- Update `tailwind.config.ts` to:
  - Consume CSS variables as color palette
  - Define spacing scale (xs: 0.25rem, sm: 0.5rem, md: 1rem, lg: 1.5rem, xl: 2rem, 2xl: 3rem)
  - Define typography scale (font sizes, weights, line heights)
  - Enable dark mode via class strategy

**Acceptance:**
- `globals.css` includes `:root` and `.dark` blocks with at least 6 color variables
- `tailwind.config.ts` consumes CSS variables correctly
- No hardcoded color values in Tailwind config
- Dark mode uses class strategy ("dark" class on `<html>`)
- All utility classes (bg-background, text-foreground, etc.) are available
- Build succeeds without CSS errors

**Ownership:** Task 0 (setup)

---

### Step 4: Create layout components (Header, AppLayout, Footer) (US-002)

**Objective:** Establish the shared layout wrapper that all screens use.

**Deliverables:**
- Create `src/layouts/AppLayout.tsx`:
  - Renders `<Header />` (top)
  - Renders `<Outlet />` from React Router (main content)
  - Renders `<Footer />` (bottom)
  - Applies responsive Tailwind classes (full width, centered content)
  - Accepts props from React Router (children, or layout pattern)
  
- Create `src/components/Header.tsx`:
  - Left: App name (`VITE_APP_NAME` from `.env`) — clickable → `/`
  - Right: "About & Help" dropdown menu (shadcn DropdownMenu) with "About" → `/about` and "Help" → `/help`
  - Far right: ThemeToggle component
  - Uses shadcn Button and DropdownMenu
  - Responsive: header spans full width with appropriate padding
  
- Create `src/components/Footer.tsx`:
  - Structured but empty (no default content)
  - Uses appropriate Tailwind classes for footer styling
  - Ready for apps to add content later
  - Full width, appropriate padding

**Acceptance:**
- All three components exist and are importable
- Header displays app name from `.env` (VITE_APP_NAME)
- Header dropdown "About & Help" has correct links
- Footer is structured and empty
- Layout is responsive (no horizontal scrolling on mobile)
- Tailwind classes are used for styling
- TypeScript types are correct

**Ownership:** Task 0 (setup)

---

### Step 5: Configure React Router and create screen placeholders (US-003)

**Objective:** Set up React Router with the three baseline routes and placeholder screens.

**Deliverables:**
- Update `src/App.tsx`:
  - Import Routes, Route, Outlet from react-router-dom
  - Define route structure with AppLayout as parent
  - Define three child routes: `/` → HomeScreen, `/about` → AboutScreen, `/help` → HelpScreen
  
- Create `src/screens/HomeScreen.tsx`:
  - Placeholder: "Home Screen" heading + description
  - Will be updated in Step 6 with useUsers() hook
  
- Create `src/screens/AboutScreen.tsx`:
  - Content: Describes AppShell and its purpose
  - "AppShell is the reference skeleton for all React/Vite projects in oneticket-core."
  - Links to: generated docs (https://dsissoko.github.io/oneticket-core/appshell/docs/) and GitHub repo (https://github.com/dsissoko/oneticket-core)
  
- Create `src/screens/HelpScreen.tsx`:
  - Content: 7-step reuse quickstart
  - Links to: runbook (`.oneticket/docs/run/appshell-reuse.md`)
  
- Update `src/main.tsx`:
  - Import BrowserRouter and wrap app
  - Configure basename if needed (GitHub Pages subdirectory)

**Acceptance:**
- `App.tsx` exports routes correctly
- All three screens exist and are importable
- Routes render without errors
- Navigation between routes works (no page reload)
- Header and Footer remain visible during navigation
- App name in header is clickable → navigates to `/`
- Dropdown links work: `/about` and `/help`
- Page refresh on any route renders the correct screen
- TypeScript types are correct

**Ownership:** Task 0 (setup)

---

### Step 6: Implement ThemeToggle component (US-004)

**Objective:** Create reactive theme switching (system/light/dark) without page reload.

**Deliverables:**
- Create `src/components/ThemeToggle.tsx`:
  - Expose 3 options: "system" (OS preference), "light" (forced light), "dark" (forced dark)
  - Reactive switching: update CSS class on `<html>` element immediately (no page reload)
  - Persistent: save preference to localStorage (key: "app-theme" or similar)
  - On mount: restore preference from localStorage
  - Uses shadcn Button or DropdownMenu for UI
  - Uses lucide-react icons (Moon, Sun, Monitor for system)
  - Supports next-themes or manual implementation with CSS class + localStorage
  
- Update `src/main.tsx`:
  - Initialize theme on app startup (read localStorage, apply class to `<html>`)
  - Ensure theme preference is restored on page load

**Acceptance:**
- ThemeToggle is importable and renders correctly
- Clicking theme option updates appearance immediately
- No page reload when switching themes
- Theme preference persists in localStorage
- On page reload, previous theme is restored
- CSS class "dark" is present/absent on `<html>` element
- CSS variables update correctly for light/dark modes
- All components using design tokens reflect theme change
- Accessible: buttons are keyboard-navigable, labels are ARIA-compliant
- No console errors

**Ownership:** Task 0 (setup)

---

### Step 7: Create data-fetching pattern (MSW + React Query) (US-006)

**Objective:** Establish the dev-only mocking and data-fetching pattern.

**Deliverables:**
- Create `src/lib/query-client.ts`:
  - Export QueryClient singleton with default options (staleTime: 5min, gcTime: 10min)
  
- Create `src/mocks/browser.ts`:
  - Setup MSW service worker for browser environment
  - Export `worker` instance
  
- Create `src/mocks/handlers.ts`:
  - Define `GET /api/users` handler returning mock user list
  - Export `handlers` array (extensible for future endpoints)
  - Example response: `[{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }, ...]`
  
- Create `src/mocks/data/users.ts`:
  - Export `mockUsers` array with at least 3 users
  - Each user: `{ id: number, name: string }`
  
- Create `src/hooks/useUsers.ts`:
  - Implement `useUsers()` hook using React Query's `useQuery`
  - Fetch `GET /api/users`
  - Return `{ data, isLoading, error, isError }`
  - Use queryKey: `['users']`
  
- Update `src/main.tsx`:
  - Import and initialize MSW only when `import.meta.env.DEV`
  - Wrap app in QueryClientProvider with queryClient from lib/query-client.ts

**Acceptance:**
- MSW handlers are defined and functional
- `useUsers()` hook fetches data via React Query
- In dev: MSW intercepts `/api/users` and returns mock data
- In prod: MSW is tree-shaken, fetch goes to real API (or 404 if not available)
- React Query caches data automatically
- No console errors from unhandled requests
- Hook returns correct TypeScript types
- Data flow is transparent: screen → hook → React Query → fetch → MSW (dev) / real API (prod)

**Ownership:** Task 0 (setup)

---

### Step 8: Update HomeScreen with data fetching example (US-006)

**Objective:** Demonstrate the MSW + React Query pattern in a real screen.

**Deliverables:**
- Update `src/screens/HomeScreen.tsx`:
  - Import `useUsers()` hook
  - Fetch and display users via React Query
  - Show loading state (spinner, skeleton, or "Loading..." text)
  - Show error state if fetch fails (error message)
  - Render users in shadcn/ui Card components:
    - Each Card displays: `id`, `name`
    - Use proper Tailwind spacing and styling
  - Show empty state if no users

**Acceptance:**
- HomeScreen imports and uses `useUsers()` correctly
- Loading state displays while fetching
- Users render in Cards with proper styling
- Error state displays if fetch fails
- Empty state shows if no users
- No console errors
- Tailwind classes used for styling (no inline styles)
- Component is responsive
- TypeScript types are correct

**Ownership:** Task 0 (setup)

---

### Step 9: Create utility functions and environment setup (US-001, US-002, US-007)

**Objective:** Provide helpers and configuration for all screens.

**Deliverables:**
- Create `src/lib/utils.ts`:
  - Export `cn()` helper (clsx + tailwind-merge) for safe class composition
  - Example: `cn("p-2", condition && "bg-red")` → prevents conflicting Tailwind classes
  
- Create/update `src/styles/globals.css`:
  - Include Tailwind directives
  - Include CSS custom properties for light/dark modes
  - Include base styles for HTML, body, default font settings
  
- Create `.env.example`:
  - Set `VITE_APP_NAME=AppShell`
  - Ensure other build tools can read it (Vite convention: VITE_ prefix)

**Acceptance:**
- `cn()` utility is importable and works correctly
- CSS variables are available globally
- `.env.example` exists with `VITE_APP_NAME`
- Environment variable is used in Header component
- Build succeeds without errors

**Ownership:** Task 0 (setup)

---

### Step 10: Verify build, routing, and overall integration (All US)

**Objective:** Comprehensive testing of the complete skeleton.

**Acceptance Criteria:**

**Build:**
- ✅ `npm run build` succeeds without errors or warnings
- ✅ No artifacts in repo (`dist/`, `test-results/`, `.tsbuildinfo`)

**Routes & Navigation:**
- ✅ Routes `/`, `/about`, `/help` render without 404 errors
- ✅ Clicking app name → `/`
- ✅ "About" dropdown → `/about`
- ✅ "Help" dropdown → `/help`
- ✅ Page refresh on any route renders correct screen
- ✅ Browser back button works

**Layout & Responsive:**
- ✅ Header spans full width, app name clickable (left), dropdown (right), theme toggle (far right)
- ✅ Footer is present and structured
- ✅ Content area is centered and readable
- ✅ No horizontal scrolling on mobile/tablet
- ✅ All three screens responsive

**Theme Switching:**
- ✅ ThemeToggle offers three options: system, light, dark
- ✅ Switching theme is instant (no page reload)
- ✅ Theme preference persists in localStorage
- ✅ Page reload restores previous theme
- ✅ CSS variables and Tailwind classes reflect theme change

**Data Fetching & MSW:**
- ✅ HomeScreen displays users from `useUsers()` hook
- ✅ Users render in Cards
- ✅ MSW intercepts `/api/users` in dev
- ✅ React Query caches data
- ✅ Loading state shows while fetching
- ✅ No console errors from MSW or React Query
- ✅ Production build has zero MSW overhead

**Design Tokens:**
- ✅ All colors from CSS variables (no hardcoded hex values)
- ✅ Spacing uses Tailwind scale
- ✅ Typography uses Tailwind scale
- ✅ No hardcoded pixel values in components

**File Ownership:**
- ✅ Structure enables one-task-per-file for screens and hooks
- ✅ No conflicts between files
- ✅ Shared files (config, layout, tokens) are isolated in Task 0

**Type Safety:**
- ✅ No TypeScript errors
- ✅ All components have proper types

---

## Related Slices

None — this is the initial slice. All future slices depend on Slice 0.

---

## Success Criteria (Task G — Full Acceptance)

### Build & Deployment
- ✅ `npm run build` succeeds in `apps/appshell/app/` without errors or warnings
- ✅ No uncommitted artifacts

### Routes & Navigation
- ✅ `/`, `/about`, `/help` render without errors
- ✅ Navigation works correctly
- ✅ Header app name is clickable → `/`
- ✅ "About & Help" dropdown routes correctly

### Layout & Components
- ✅ Header: app name (left), "About & Help" dropdown (right), ThemeToggle (far right)
- ✅ Footer: structured, empty, ready for content
- ✅ Responsive: no horizontal scrolling on mobile
- ✅ All shadcn components present and functional

### Theme & Styling
- ✅ ThemeToggle switches between system/light/dark modes
- ✅ Theme switching is reactive (no page reload)
- ✅ Theme preference persists in localStorage
- ✅ `globals.css` defines CSS variables for light and dark modes
- ✅ `tailwind.config.ts` consumes CSS variables
- ✅ All screens use Tailwind utility classes only

### Data Fetching & Mocking
- ✅ HomeScreen uses `useUsers()` hook to fetch user data
- ✅ React Query caches and delivers user data
- ✅ MSW intercepts `/api/users` in dev and returns mock data
- ✅ MSW is active in dev only (`import.meta.env.DEV` guard)
- ✅ Users rendered in Card components

### Screen Content
- ✅ AboutScreen describes AppShell and links to docs and GitHub
- ✅ HelpScreen contains 7-step reuse quickstart and links to runbook

### Design Tokens
- ✅ All colors defined in CSS variables
- ✅ All spacing values defined in Tailwind scale
- ✅ All typography values defined in Tailwind scale
- ✅ No hardcoded color/spacing/font values

### File Ownership
- ✅ File structure enables exclusive ownership
- ✅ `screens/`, `hooks/`, `mocks/` directories support parallel tasks

---

## Implementation Notes

### Design Decisions

1. **Exclusive File Ownership Model** — Achieved through directory structure. Each screen, hook, and mock handler is owned by one task. Shared infrastructure (config, layout, tokens) is centralized in Task 0 and never modified in parallel.

2. **Design Tokens as CSS Variables** — Colors are CSS custom properties, consumed by Tailwind config. This allows reactive theme switching without page reload and ensures consistency across all screens.

3. **MSW for Dev-Only Mocking** — MSW is guarded by `import.meta.env.DEV`. In production, the code is tree-shaken, eliminating overhead. Screens use standard `fetch()` calls; mocking is transparent.

4. **React Query for Data Fetching** — All async operations go through React Query. Automatic caching, invalidation, and DevTools support. No ad-hoc `fetch()` calls outside React Query.

5. **shadcn/ui for Components** — Radix UI-based, accessible, customizable via Tailwind. One-time installation in Task 0; feature tasks never install new components.

### Known Constraints

1. **No Authentication** — AppShell intentionally omits auth. Apps add it as needed.

2. **No Advanced State Management** — Zustand is available but not used in skeleton. Apps add it only if needed.

3. **Limited shadcn Components** — Only essential components (button, card, dropdown, separator, form, input, label) in skeleton. Apps request additional components through setup tasks.

4. **No Error Boundary** — Top-level error boundary could be added if requested by PO.

5. **No 404 Route** — No catch-all route for undefined paths. Apps add if needed.

### Future Extensions

1. **Error Boundary** — Add top-level error boundary to catch React rendering errors
2. **404 Route** — Add catch-all route → NotFoundScreen
3. **Authentication** — Add auth pattern/example
4. **Advanced State** — Example Zustand store
5. **i18n** — Internationalization foundation

---

## Testing Strategy

### Manual Testing Checklist

1. **Development Server**
   - Run `npm run dev`
   - Verify dev server starts on `http://localhost:5173`
   - Verify HMR works (edit a file, page updates)

2. **Routing**
   - Navigate to `/`, `/about`, `/help`
   - Verify each route shows correct screen
   - Verify header and footer persist

3. **Theme Switching**
   - Click ThemeToggle
   - Select light → colors change
   - Select dark → colors change
   - Select system → colors match OS preference
   - Refresh page → theme persists

4. **Data Fetching**
   - Navigate to `/` (HomeScreen)
   - Verify loading state appears briefly
   - Verify users list renders in Cards
   - Open browser DevTools Console → no MSW warnings

5. **Responsive Design**
   - Open DevTools mobile view (375px width)
   - Verify no horizontal scrolling
   - Verify layout is readable
   - Test on tablet (768px) and desktop (1920px)

6. **Production Build**
   - Run `npm run build`
   - Verify build succeeds
   - Run `npm run preview`
   - Verify all routes work
   - Verify no MSW errors in console

---

## Documentation Updates

After completing this slice, update:

1. **architecture.md** — Should be complete; verify slices section references this slice
2. **product-spec.md** — Should be complete; verify success criteria align
3. **epic.md** — Mark as complete with reference to this slice

---

## Commit Strategy

This entire slice (all 10 steps) is committed as a single unit with message:
```
feat: complete task G - AppShell Skeleton slice (vertical slice 0)

Implements full skeleton with:
- File structure and exclusive ownership model
- Responsive layout (Header, AppLayout, Footer)
- React Router with 3 baseline routes
- Design tokens (CSS variables + Tailwind)
- Theme toggle (system/light/dark)
- MSW + React Query data fetching pattern
- shadcn/ui component integration
- Example HomeScreen with useUsers() hook
- AboutScreen and HelpScreen

All 7 user stories (US-001 through US-007) are satisfied.
Skeleton is deployable and ready for reuse in new projects.
```

---

**Last Updated:** 2026-05-29  
**Status:** Implementation Ready (Slice 0 — Initial Vertical Slice)  
**Depends On:** None (initial slice)  
**Enables:** All future slices (features built on this skeleton)
