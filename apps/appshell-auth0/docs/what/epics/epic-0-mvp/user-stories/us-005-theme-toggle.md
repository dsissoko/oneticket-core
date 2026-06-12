# US-005 — Theme Toggle

## Story

As a user, I want to switch between system/light/dark themes so that I can use the app in my preferred visual mode.

## Expected Behavior

- ThemeToggle in Header offers three options: System (default), Light, Dark
- Theme change is reactive — no page reload required
- Preference persisted to localStorage — survives page refresh
- `next-themes` applies `.dark` class on `<html>` element
- Tailwind `darkMode: ['class']` activates dark variants
- HSL CSS custom properties in `styles/globals.css` define all colors for both modes
- All components use shadcn design tokens — theme switch applies consistently everywhere

## Acceptance Criteria

- [x] ThemeToggle renders in Header with Sun/Moon/Monitor icons (lucide-react)
- [x] Selecting Light applies light theme immediately
- [x] Selecting Dark applies dark theme immediately
- [x] Selecting System follows OS preference
- [x] Theme preference persisted to localStorage — survives page reload
- [x] `.dark` class applied to `<html>` in dark mode
- [x] No hardcoded `dark:bg-gray-*` classes — all via HSL tokens
- [x] No console errors related to theme on any route
