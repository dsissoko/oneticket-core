# US-002 — Layout Structure

## Story

As a user, I want a consistent layout (Header + content + Footer) so that all screens share the same visual structure.

## Expected Behavior

- `AppLayout` wraps all screens via React Router `<Outlet />`
- CSS Grid layout: `grid-rows-[auto_1fr_auto]` — sticky header, flexible content, sticky footer
- Header: logo linking to `/`, navigation links (Home, About, Help), ThemeToggle, responsive mobile menu
- Footer N1: copyright left + text links right (Documentation, Project, Issues)
- Footer N2: social icon links (GitHub, author profile with Avatar, Stargazers)
- All colors use shadcn design tokens — no hardcoded color values
- Navigation changes logged via `logger.info('[nav]', pathname)`

## Acceptance Criteria

- [x] `AppLayout` renders Header + Outlet + Footer on all routes
- [x] Header logo links to `/` and is clickable
- [x] Navigation links use `<Link to>` (never `<a href>`) for internal routes
- [x] ThemeToggle visible in Header — system/light/dark options
- [x] Footer N1 renders copyright and text links
- [x] Footer N2 renders social icons with Avatar (GitHub profile photo)
- [x] No hardcoded colors — all Tailwind classes use design tokens
- [x] Navigation logged to console on each route change
