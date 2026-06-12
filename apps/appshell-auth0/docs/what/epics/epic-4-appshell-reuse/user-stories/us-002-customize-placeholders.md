# US-002 — Customize Branding and Placeholders

## Story

As a developer, I want to customize the app name, branding, and screen content so that the new project reflects its own identity.

## Expected Behavior

- `VITE_APP_NAME` set in `.env.example` and `.env.local`
- `AboutScreen` content updated with the new project description
- `HelpScreen` quickstart updated with project-specific instructions
- Footer copyright updated
- All AppShell references replaced with the new project name

## Acceptance Criteria

- [ ] `VITE_APP_NAME={project}` set in `.env.example`
- [ ] `AboutScreen.tsx` describes the new project (not AppShell)
- [ ] `HelpScreen.tsx` has project-specific quickstart instructions
- [ ] Footer copyright reflects the new project
- [ ] No "AppShell" references in visible UI text
