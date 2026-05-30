# US-001 — Demo Screen with Tabs

## Story

As a developer, I want a `/demo` screen with tabbed navigation so that I can explore all AppShell patterns in one place.

## Expected Behavior

- New route `/demo` added to `main.tsx`
- `DemoScreen.tsx` uses shadcn `Tabs` component
- Tab list: Data Fetching, Forms, Logger, Theme, Auth
- Each tab renders its content below the tab bar
- Navigation link to `/demo` added in Header

## Acceptance Criteria

- [ ] Route `/demo` renders `DemoScreen`
- [ ] shadcn `Tabs` component installed in `components/ui/tabs.tsx`
- [ ] Five tabs rendered: Data Fetching, Forms, Logger, Theme, Auth
- [ ] Active tab content visible below tab bar
- [ ] `/demo` link accessible from Header navigation
- [ ] Tab navigation keyboard-accessible (shadcn accessibility built-in)
