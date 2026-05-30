# US-005 — Tab: Theme

## Story

As a developer, I want a Theme tab so that I can see the design tokens and theme switching demonstrated visually.

## Expected Behavior

- Live theme switcher (System/Light/Dark) — same as Header ThemeToggle
- Color palette displayed — one swatch per design token (background, foreground, primary, secondary, muted, accent, destructive, border)
- Each swatch shows token name and HSL value
- Switching theme updates swatches in real time

## Acceptance Criteria

- [ ] Theme switcher buttons rendered (System, Light, Dark)
- [ ] Color swatches rendered for all HSL tokens
- [ ] Switching theme updates swatch colors immediately
- [ ] Token names displayed below each swatch
- [ ] Layout uses shadcn `Card` for each swatch group
