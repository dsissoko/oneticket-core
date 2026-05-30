# US-001 — Skeleton Setup

## Story

As a developer, I want a ready-to-copy skeleton so that I can start a new project immediately with proven patterns.

## Expected Behavior

- `apps/appshell/app/` contains a complete React + Vite + TypeScript project
- Exclusive file ownership model enforced: one screen = one file, one component = one file
- Vite configured with dev server, build, and preview modes
- TypeScript strict mode with `vite/client` types and `@/` path alias
- `main.tsx` as entry point with global error boundary, ThemeProvider, QueryClientProvider, BrowserRouter
- `__ENABLE_MSW__` flag in `vite.config.ts` controls MSW activation independently of build environment
- `VITE_BASE_PATH` support for sub-path deployments (GitHub Pages)
- `.env.example` documents all required environment variables

## Acceptance Criteria

- [x] `apps/appshell/app/` exists with `package.json`, `vite.config.ts`, `tsconfig.json`
- [x] `npm install && npm run dev` starts Vite dev server without errors
- [x] `npm run build` produces `dist/` with no TypeScript errors
- [x] App deployed and accessible on GitHub Pages PR preview and production
- [x] `import.meta.env.BASE_URL` correctly resolves in all environments
- [x] `@/` alias resolves in both TypeScript and Vite build
- [x] Global error listeners active (`window.onerror`, `unhandledrejection`)
