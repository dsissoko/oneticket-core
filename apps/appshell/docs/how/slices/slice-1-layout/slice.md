# Slice 1 — Layout Structure

## Goal

Implement the core layout framework (AppLayout, Header, Footer) that wraps all pages and ensures consistent structure across the application.

## Related Epics

[Epic 0 — AppShell MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

[US-002 — Layout Structure](../../what/epics/epic-0-mvp/user-stories/us-002-layout.md)

## Impacted Components

- `src/components/layout/AppLayout.tsx` — root layout with Header, Outlet, Footer
- `src/components/layout/Header.tsx` — sticky header with logo and navigation
- `src/components/layout/Footer.tsx` — sticky footer with links and copyright
- `src/App.tsx` — wraps routes with AppLayout

## Interfaces

**AppLayout Props**:
```typescript
interface AppLayoutProps {
  children?: React.ReactNode;
}

// AppLayout exports Outlet for route rendering
```

**Header Props**:
```typescript
interface HeaderProps {
  logo?: string;
  navLinks?: Array<{ label: string; href: string }>;
}
```

**Footer Props**:
```typescript
interface FooterProps {
  copyright?: string;
  links?: Array<{ label: string; href: string }>;
}
```

## Data Changes

None (presentation layer only).

## Sequence Flow

1. Create `src/components/layout/AppLayout.tsx` with grid layout (header, main, footer)
2. Create `src/components/layout/Header.tsx` with logo and nav links
3. Create `src/components/layout/Footer.tsx` with copyright and documentation links
4. Update `src/App.tsx` to wrap `<Routes>` with `<AppLayout>`
5. Add responsive CSS classes using Tailwind (mobile, tablet, desktop breakpoints)
6. Test layout responsiveness at mobile, tablet, and desktop viewport sizes

## Observability Impact

- Layout renders correctly in DevTools Element Inspector
- All three components (Header, Footer, AppLayout) visible in React DevTools component tree
- No console errors when navigating between routes

## Acceptance Criteria

- [x] `AppLayout` component creates grid layout: Header (sticky top) + Outlet (flex 1) + Footer (sticky bottom)
- [x] `Header` displays AppShell logo (clickable, links to `/`) and nav links (`/`, `/about`, `/help`)
- [x] `Footer` displays copyright, documentation link, project status
- [x] Layout is responsive with appropriate padding/margins for mobile, tablet, desktop
- [x] CSS Grid or Flexbox used for layout (no absolute positioning)
- [x] All styling uses Tailwind classes with design tokens
- [x] Components are exported from `src/components/index.ts`
- [x] JSDoc comments explain component purpose
- [x] Locked components marked as protected (code comments)
