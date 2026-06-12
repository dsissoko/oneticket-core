# US-004 — Theme Tests

## Story

As a developer, I want tests for the theme toggle so that light/dark/system switching is verified automatically.

## Expected Behavior

- Tests use `next-themes` `ThemeProvider` wrapper
- Theme changes apply `.dark` class to document
- Preference persists to localStorage

## Acceptance Criteria

- [ ] `ThemeToggle.test.tsx` — renders with current theme icon
- [ ] Selecting Dark applies `.dark` class to `document.documentElement`
- [ ] Selecting Light removes `.dark` class
- [ ] Theme preference written to localStorage after selection
- [ ] All tests pass with `npm run test`
