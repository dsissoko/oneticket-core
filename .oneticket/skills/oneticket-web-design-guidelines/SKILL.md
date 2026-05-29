---
name: oneticket-web-design-guidelines
description: UI audit rules — 100+ rules covering accessibility, performance, UX. From Vercel Labs.
source: external
source_url: https://github.com/vercel-labs/agent-skills
source_skill: web-design-guidelines
install_native: npx skills add vercel-labs/agent-skills --skill web-design-guidelines
metadata:
  author: vercel (adapted for OneTicket)
  version: "1.0.0"
  original-source: https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines
  argument-hint: <file-or-pattern>
---

# OneTicket Web Design Guidelines

Review UI code for compliance with Web Design Guidelines. Audits code for 100+ rules covering accessibility, performance, and UX best practices.

## Use When

- "Review my UI"
- "Check accessibility"
- "Audit design"
- "Review UX"
- "Check my site against best practices"
- Conducting UI code reviews in OneTicket projects
- Ensuring Primer Design System compliance

## Categories Covered

- **Accessibility** - aria-labels, semantic HTML, keyboard handlers
- **Focus States** - visible focus, focus-visible patterns
- **Forms** - autocomplete, validation, error handling
- **Animation** - prefers-reduced-motion, compositor-friendly transforms
- **Typography** - curly quotes, ellipsis, tabular-nums
- **Images** - dimensions, lazy loading, alt text
- **Performance** - virtualization, layout thrashing, preconnect
- **Navigation & State** - URL reflects state, deep-linking
- **Dark Mode & Theming** - color-scheme, theme-color meta
- **Touch & Interaction** - touch-action, tap-highlight
- **Locale & i18n** - Intl.DateTimeFormat, Intl.NumberFormat

## How It Works

1. Fetch the latest guidelines from Vercel Labs source
2. Read specified files (or prompt user for files/pattern)
3. Check against all 100+ rules in the fetched guidelines
4. Output findings in concise `file:line` format

## Guidelines Source

Fetch fresh guidelines before each review:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch to retrieve the latest rules. The fetched content contains all the rules and output format instructions.

## Usage in OneTicket

When a user provides a file or pattern argument:

1. Fetch guidelines from the source URL above
2. Read the specified files from OneTicket projects (typically in `apps/appshell/app`)
3. Apply all rules from the fetched guidelines, with special attention to:
   - Primer Design System compliance
   - React/TypeScript patterns in OneTicket
   - GitHub-style UI conventions
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.

## OneTicket-Specific Notes

This skill integrates with OneTicket's design philosophy:
- Emphasis on Primer Design System components
- React + TypeScript frontend patterns
- Accessibility-first design
- Performance optimization for web interfaces
- GitHub-compatible UI conventions

## Integration

To use this skill in OpenCode, run:

```bash
npx skills add vercel-labs/agent-skills --skill web-design-guidelines
```

Then reference this skill in your OneTicket agent configurations.
