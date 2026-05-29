# Slice 0 — Setup Skeleton

## Goal

Establish the foundational project skeleton with Vite, TypeScript, Tailwind CSS, and dependencies configured. This foundation slice provides the base configuration for all subsequent feature slices.

## Related Epics

[Epic 0 — AppShell MVP](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

[US-001 — Skeleton Setup](../../what/epics/epic-0-mvp/user-stories/us-001-setup.md)

## Impacted Components

- `package.json` — project dependencies and scripts
- `vite.config.ts` — Vite build and dev server configuration
- `tsconfig.json` — TypeScript strict mode configuration
- `tailwind.config.ts` — Tailwind CSS design tokens and theme
- `postcss.config.js` — PostCSS with Tailwind plugin
- `src/index.tsx` — React app entry point
- `src/main.css` — global styles and CSS variables
- `src/types/index.ts` — shared TypeScript types

## Interfaces

**Design Tokens** (in `tailwind.config.ts`):
```typescript
colors: {
  primary: '#0366d6',
  secondary: '#6f42c1',
  accent: '#28a745',
  destructive: '#d73a49',
  muted: '#6a737d',
  background: '#ffffff',
  foreground: '#24292e'
}

spacing: {
  // 4px baseline
  xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem'
}

typography: {
  fontFamily: { sans: 'system-ui, -apple-system, sans-serif' }
}
```

**CSS Variables** (in `src/main.css`):
```css
:root {
  --background: rgb(255 255 255);
  --foreground: rgb(36 41 46);
  /* light/dark variants for theme switching */
}

[data-theme="dark"] {
  --background: rgb(13 17 23);
  --foreground: rgb(230 237 243);
}
```

## Data Changes

None (configuration only).

## Sequence Flow

1. Initialize `package.json` with React, Vite, TypeScript, Tailwind dependencies
2. Create `vite.config.ts` with dev server and build configuration
3. Create `tsconfig.json` with strict mode enabled
4. Create `tailwind.config.ts` and `postcss.config.js` with design tokens
5. Create `src/main.css` with CSS variables and global styles
6. Create `src/index.tsx` as React app entry point
7. Create `.gitignore` for node_modules and build artifacts
8. Run `npm install` and verify `npm run dev` starts dev server

## Observability Impact

- Dev server logs indicate successful Vite startup on http://localhost:5173
- Build succeeds with zero TypeScript errors in strict mode
- No console errors in browser DevTools during startup

## Acceptance Criteria

- [x] `apps/appshell/app/` directory exists with complete skeleton
- [x] `npm install && npm run dev` starts Vite dev server without errors
- [x] `npm run build` generates production bundle without TypeScript warnings
- [x] Directory structure reflects ownership model: `src/components/`, `src/pages/`, `src/hooks/`, `src/stores/`
- [x] `tsconfig.json` has `strict: true` enabled
- [x] Tailwind CSS and PostCSS are configured
- [x] Global CSS variables defined for theme support
- [x] TypeScript strict mode compiles without errors
