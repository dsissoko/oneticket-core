---
name: oneticket-init-appshell
description: "AppShell bootstrap skill — defines how AppShell is used as the reference starting point for any new React+Vite app in this repo."
version: "1.0.0"
source: local
---

# Skill: oneticket-init-appshell

## Purpose

AppShell is the reference foundation for every React+Vite application in this repo.
This skill defines what that means concretely and what to do at two key moments in a project's lifecycle:
when the app is being created for the first time, and when it already exists.

---

## AppShell is the reference source — never the working directory

`apps/appshell/` is the canonical reference. It is never modified, never touched, regardless of
the current project. It is only read and copied. All implementation work happens exclusively in
`apps/<current_project>/`. This separation is absolute.

---

## Bootstrapping a new project

When a new React+Vite project starts, its foundation is a copy of `apps/appshell/app/` into
`apps/<current_project>/app/`. Once copied, all occurrences of the name "appshell" and "AppShell"
are updated to reflect `<current_project>`:

- The package name in `package.json`
- The page title in `index.html`
- The card title and welcome text in `HomeScreen.tsx`
- The subtitle and description in `AboutScreen.tsx`

This bootstrap is a standalone step. Once complete, a GitHub comment confirms it and the work stops.
The implementation decomposition happens in the next invocation.

---

## When AppShell is already in place

The foundation is set. AppShell's conventions apply to everything that follows — locked files,
component patterns, design tokens. Agents implementing features must be made aware of this context.
The manifest `content` field for each task should reference the AppShell foundation so that `@dev`
knows what they are building on top of.
