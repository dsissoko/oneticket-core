---
name: oneticket-scaffolding-for-vite-react-primer
description: Practical recipes for Vite + React projects in non-interactive agent environments (scaffolding, MSW setup, etc.).
---

# Vite React Agent Cookbook

## Objective

Provide practical, agent-ready recipes for Vite + React projects that work in non-interactive environments.

## Objective

Scaffold a project using tools like Vite, CRA, or any interactive CLI **without waiting for user input** in non-interactive environments.

## Problem

Many scaffolding tools (`npm create vite`, `npm init`, `create-react-app`) are interactive by default. They prompt for confirmation, input, or display progress bars that block in non-interactive shells.

Rather than trying to pipe, redirect, or use `-y` flags (which often don't exist for these tools), the reliable approach is **manual scaffolding**.

## Solution

### Step 1: Identify the tool and its output structure

Look up the official template structure for the tool you want to use:

- **Vite React + TypeScript** template produces:
  ```
  apps/<current_project>/frontend/
  ├── index.html
  ├── package.json
  ├── tsconfig.json
  ├── tsconfig.node.json
  ├── vite.config.ts
  ├── src/
  │   ├── main.tsx
  │   ├── App.tsx
  │   ├── App.css
  │   └── index.css
  └── public/
      └── vite.svg
  ```

- **Vite vanilla + TypeScript** produces fewer files.

### Step 2: Create the files manually

Create each file with the content that matches the official template. Use the official documentation or a temporary scaffolding to get the reference content.

### Step 3: Write `package.json` from the stack manifest

Use the canonical `package.json` defined in the `stack-vite-react-primer` skill (loaded in your set).
Do not infer dependencies from memory — always copy the exact block from that skill.

Then install:

```bash
cd apps/<current_project>/frontend && npm --cache .npm-cache install
```

## When to use this skill

- Any CLI that shows prompts, asks for confirmation, or requires TTY
- When `-y`, `--yes`, or `--quiet` flags don't exist or don't work
- When the agent is running in a non-interactive shell

## When NOT to use this skill

- When the CLI explicitly supports non-interactive mode (e.g., `npm create vite@latest . -- --template react-ts --yes`)
- When you're in an interactive terminal where prompts work