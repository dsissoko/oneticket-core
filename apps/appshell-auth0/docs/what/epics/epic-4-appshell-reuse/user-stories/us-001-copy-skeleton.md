# US-001 — Copy AppShell Skeleton

## Story

As a developer, I want to copy the AppShell skeleton to a new project directory so that I have a working foundation immediately.

## Expected Behavior

- `apps/appshell/app/` is copied to `apps/{project}/app/`
- All files are present and functional after copy
- `npm install && npm run dev` works immediately after copy
- No AppShell-specific references remain in the copied project

## Acceptance Criteria

- [ ] Copy mechanism defined (script, workflow, or manual steps)
- [ ] `apps/{project}/app/` contains all AppShell files
- [ ] `package.json` name updated to `{project}`
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts dev server on `http://localhost:5173`
- [ ] `npm run build` produces `dist/` without errors
