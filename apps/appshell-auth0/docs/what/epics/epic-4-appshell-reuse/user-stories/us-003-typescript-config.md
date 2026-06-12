# US-003 — TypeScript Configuration Reference

## Story

As a developer, I want a TypeScript configuration reference so that I can understand, troubleshoot, or adapt the `tsconfig.json` for my project.

## Expected Behavior

- `tsconfig.json` key options documented with explanation
- Known pitfalls documented (e.g. missing `vite/client` types, missing `@/` alias)
- Guidance on adjusting target (ES2020 → ES2022 for top-level await)

## Key Configuration Points

| Option | Value | Why |
|---|---|---|
| `target` | `ES2020` | Modern browsers, wide support. Use ES2022 to enable top-level await. |
| `strict` | `true` | Catches most TypeScript errors at compile time |
| `types` | `["vite/client"]` | Enables `import.meta.env` — mandatory for Vite projects |
| `baseUrl` | `.` | Required for `@/` path alias resolution |
| `paths` | `{ "@/*": ["./src/*"] }` | `@/` alias — also configured in `vite.config.ts` `resolve.alias` |
| `moduleResolution` | `bundler` | Correct for Vite — avoids CommonJS resolution issues |
| `noUnusedLocals` | `true` | Keeps code clean — fails build on unused variables |

## Acceptance Criteria

- [ ] Reference document available in `docs/run/`
- [ ] Common errors and fixes documented
- [ ] Guidance on `@/` alias setup (both `tsconfig.json` and `vite.config.ts` required)
- [ ] Note on ES2020 vs ES2022 trade-offs
