# Epic 0 — AppShell MVP: skeleton structure, routing, theme, data fetching

## Goal

Establish the complete and functional skeleton for AppShell with exclusive file ownership, design tokens, and data-fetching patterns. Enable zero-conflict parallel development by structuring files so each parallel task owns a single screen, hook, and (optionally) mock handler. Enforce design quality by constraint through centralized design tokens and shadcn/ui component primitives.

## Business Value

1. **Eliminates merge conflicts in FAN-OUT pipelines** — Exclusive file ownership means parallel tasks never touch the same file. Task 0 sets up shared infrastructure once; all subsequent tasks own isolated `screens/`, `hooks/`, and `mocks/` files.

2. **Enforces visual quality by constraint** — Design tokens (colors, spacing, typography) are defined once in `globals.css` and `tailwind.config.ts`. All screens consume these tokens; inconsistency becomes impossible.

3. **Provides a copy-paste template for new projects** — Any new app starts by copying `apps/appshell/app/` and adapting `.env.example`, `AboutScreen`, and `HelpScreen`. No manual setup boilerplate.

4. **Establishes clear conventions for agents** — Documents where screens go, how data is fetched (React Query + MSW), which components are available (shadcn/ui), how icons are chosen (lucide-react only), and how styling works (Tailwind utilities only).

5. **Supports rapid iteration with next-generation build tools** — Vite (lightning-fast dev server), React Router (lightweight), Tailwind CSS (utility-first, constraint-based), shadcn/ui (accessible primitives), MSW (mock APIs in dev without code changes in production).

## Scope MVP

### 1. File Structure with Exclusive Ownership

```
apps/appshell/app/
├── .env.example                     ← VITE_APP_NAME=AppShell
├── index.html
├── package.json
├── tailwind.config.ts               ← design tokens (colors, spacing, typography)
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts                   ← base: process.env.VITE_BASE_PATH || '/'
├── vitest.config.ts
├── vitest.setup.ts
└── src/
    ├── main.tsx                     ← MSW init + QueryClientProvider + ThemeProvider + BrowserRouter
    ├── App.tsx                      ← Routes definition
    ├── layouts/
    │   └── AppLayout.tsx            ← Header + <Outlet/> + Footer
    ├── components/
    │   ├── Header.tsx               ← App name (left, clickable → /) + About&Help dropdown + ThemeToggle (right)
    │   ├── Footer.tsx               ← empty but structured, ready to receive content
    │   ├── ThemeToggle.tsx          ← system/light/dark switch — reactive, no reload
    │   └── ui/                      ← shadcn components (code in repo, not node_modules)
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── dropdown-menu.tsx
    │       ├── separator.tsx
    │       ├── form.tsx             ← React Hook Form integrated
    │       └── ... (additional shadcn components as needed)
    ├── screens/
    │   ├── HomeScreen.tsx           ← example: useUsers() → React Query → MSW → Card list
    │   ├── AboutScreen.tsx          ← AppShell description + links
    │   └── HelpScreen.tsx           ← quickstart + runbook link placeholder
    ├── hooks/
    │   └── useUsers.ts              ← React Query example: fetch('/api/users')
    ├── stores/
    │   └── .gitkeep                 ← Zustand convention — empty in skeleton
    ├── mocks/
    │   ├── browser.ts               ← MSW worker setup
    │   ├── handlers.ts              ← GET /api/users → mocked JSON
    │   └── data/
    │       └── users.ts             ← mock data: [{ id: 1, name: 'Alice' }, ...]
    ├── lib/
    │   ├── utils.ts                 ← cn() helper (clsx + tailwind-merge)
    │   ├── query-client.ts          ← QueryClient singleton
    │   └── schemas/
    │       └── .gitkeep             ← Zod schemas — empty in skeleton
    └── styles/
        └── globals.css              ← CSS custom properties light/dark + Tailwind directives
```

**Ownership Model:**
- `App.tsx`, `tailwind.config.ts`, `globals.css`, `AppLayout.tsx`, `Header.tsx`, `Footer.tsx`, `ThemeToggle.tsx` — owned by **Task 0** (skeleton setup). Never modified by parallel tasks.
- `components/ui/*` — installed once by Task 0 via shadcn CLI. Never modified in parallel.
- `screens/{FeatureName}Screen.tsx` — owned by **one task per screen**. No two tasks touch the same screen.
- `hooks/use{Feature}.ts` — owned by **one task per hook**. One hook = one async operation or computation.
- `mocks/handlers.ts` — extended by feature tasks as needed (if each feature owns its own handler block).

### 2. AppLayout (Header + Outlet + Footer)

- **AppLayout.tsx** wraps all screens with `<Header />`, `<Outlet />` (from React Router), and `<Footer />`
- **Header.tsx:**
  - Left: `VITE_APP_NAME` (from `.env` file) — clickable → `/` (home)
  - Right: Dropdown menu "About & Help" with sub-entries:
    - `About` → `/about`
    - `Help` → `/help`
  - Far right: `ThemeToggle` component
  - No "Home" nav link (app name is the home link)
- **Footer.tsx:**
  - Empty but structured (no default content)
  - Ready for apps to add content
- **Responsive layout** — Header spans full width, content is centered and readable, footer spans full width, no horizontal scrolling on mobile

### 3. Routing: /, /about, /help

- **`/`** → `HomeScreen.tsx` — demonstrates data fetching with `useUsers()` → React Query → MSW
- **`/about`** → `AboutScreen.tsx` — describes AppShell and its purpose
- **`/help`** → `HelpScreen.tsx` — 7-step reuse quickstart + runbook link

All routes defined in `App.tsx` using React Router 6 with lazy loading (where appropriate).

### 4. ThemeToggle (system/light/dark)

- **ThemeToggle.tsx** component exposes 3 options:
  1. `system` — follows OS preference (light/dark)
  2. `light` — forced light mode
  3. `dark` — forced dark mode
- **Reactive** — switching theme updates CSS class on `<html>` element immediately (no page reload)
- **Persistent** — theme preference stored in localStorage
- **Integration** — works with `next-themes` (Vite-adapted) + Tailwind's dark mode

### 5. MSW + React Query Pattern (dev-only)

**MSW (Mock Service Worker):**
- Activated in `main.tsx` only when `import.meta.env.DEV` (development)
- Mocks API responses in browser console during local development
- Zero production overhead — MSW code is tree-shaken in production builds
- Handlers defined in `mocks/handlers.ts`:
  - `GET /api/users` → returns mocked user list from `mocks/data/users.ts`

**React Query Pattern:**
- All data fetching goes through React Query (`@tanstack/react-query`)
- Example hook: `useUsers()` in `hooks/useUsers.ts`
  - Uses `useQuery()` to fetch `/api/users`
  - Automatic caching and synchronization
  - DevTools included for debugging
- No ad-hoc `fetch()` or `axios` calls

**Data Flow:**
```
HomeScreen → useUsers() → React Query → fetch('/api/users') → MSW intercepts → returns mock data → React Query caches → HomeScreen renders
```

### 6. shadcn UI Components Setup

**Pre-installed components in `components/ui/`:**
- `button.tsx`
- `card.tsx`
- `dropdown-menu.tsx`
- `separator.tsx`
- `form.tsx` (React Hook Form integrated)
- Additional components as needed (e.g., input, label, etc.)

**Installation method:** shadcn/ui CLI (one-time setup in Task 0)

**Rule for agents:** Never install new shadcn components in parallel tasks. Request new components through setup/integration tasks only.

### 7. Design Tokens (CSS Variables + Tailwind)

**CSS Custom Properties in `globals.css`:**
```css
:root {
  --background: ...;       /* light mode background */
  --foreground: ...;       /* light mode foreground */
  --accent: ...;           /* light mode accent (primary color) */
  --border: ...;           /* light mode border */
  --muted-background: ...;
  --muted-foreground: ...;
}

.dark {
  --background: ...;       /* dark mode background */
  --foreground: ...;       /* dark mode foreground */
  --accent: ...;           /* dark mode accent */
  --border: ...;           /* dark mode border */
  --muted-background: ...;
  --muted-foreground: ...;
}
```

**Tailwind Integration in `tailwind.config.ts`:**
- Consumes CSS variables as color palette
- Defines spacing scale (sm, md, lg, xl, etc.)
- Defines typography scale (font sizes, weights)
- No hardcoded color values in screens — all colors via design tokens

**Rule for agents:** Never define new colors, spacing, or typography values. Always use the centralized tokens.

### 8. Skills for Agents

#### 8.1 `oneticket-appshell` (new — local)

Location: `.oneticket/skills/oneticket-appshell/SKILL.md`

**Frontmatter:**
```yaml
---
name: oneticket-appshell
description: AppShell skeleton structure, conventions, and reuse patterns for oneticket-core projects
version: 1.0.0
source: local
---
```

**Content:**
- AppShell intent: reference skeleton for all Vite/React projects
- **Structure overview:** exclusive file ownership prevents merge conflicts
  - `screens/` — one file = one feature = exclusive ownership
  - `hooks/` — one hook = one async operation or computation
  - `components/ui/` — shadcn components, installed once in Task 0
  - `styles/globals.css` + `tailwind.config.ts` — design tokens, never modified in parallel
- **Visual conventions for agents:**
  - Always use `PageHeader` at the top of every screen (if a PageHeader component is available)
  - Always use `Card` for grouped content
  - Always use `EmptyState` when there is no data (if an EmptyState component is available)
  - Never use inline styles — all styling via Tailwind utility classes
  - Spacing: always use Tailwind classes (e.g., `p-4`, `m-2`) — never raw pixel values
  - Typography: always use the defined scale from `tailwind.config.ts`
  - Icons: always use `lucide-react` — never emoji or text symbols
  - Colors: consume CSS variables via Tailwind (e.g., `bg-background`, `text-foreground`) — never hardcoded hex values
- **Available libraries table:**

| Library | Purpose | When to use |
|---|---|---|
| shadcn/ui | UI primitives | All UI components (Button, Card, Form, etc.) |
| React Hook Form + Zod | Forms + validation | Any form screen with user input |
| React Query | Data fetching + caching | Any async data fetching |
| Zustand | Global state | Cross-screen state (optional, not in skeleton) |
| lucide-react | Icons | Any icon — nothing else |
| MSW | Mock API | Dev environment data fetching |
| Tailwind CSS | Styling | All styling — no CSS modules or inline styles |

- **How to reuse AppShell for a new project:**
  1. Copy `apps/appshell/app/` → `apps/{your-project}/app/`
  2. Update `.env.example`: set `VITE_APP_NAME`
  3. Update `.oneticket/config.yml`: set `current_project` to your project name
  4. Customize `AboutScreen` with your project description
  5. Customize `HelpScreen` with your project-specific quickstart
  6. Add feature screens in `screens/` — one file per feature
  7. Add hooks in `hooks/` — one hook per async operation
  8. Extend `mocks/handlers.ts` with new endpoints as needed
  9. Push to main — GitHub Actions deploy automatically
- **How @po commands a new project:** Open an issue requesting a new app based on AppShell (e.g., "Create a Todo app"). @leaddev copies the skeleton and decomposes feature work into parallel tasks.
- **How @leaddev decomposes tasks:**
  - Task 0: Copy skeleton, install shadcn components, configure theme tokens, update AboutScreen/HelpScreen (sequential, no depends_on)
  - Tasks 1+: Add feature screens (parallel, depends_on: [task-0])
  - Integration task: Wire all screens into App.tsx routes (sequential, depends_on: all feature tasks)
- **Runbook:** See `.oneticket/docs/run/appshell-reuse.md` for detailed step-by-step reuse guide

#### 8.2 `oneticket-react-best-practices` (new — external wrapper)

Location: `.oneticket/skills/oneticket-react-best-practices/SKILL.md`

**Frontmatter:**
```yaml
---
name: oneticket-react-best-practices
description: React and Next.js performance optimization guidelines — 70 rules across 8 categories, prioritized by impact. From Vercel Engineering.
version: 1.0.0
source: external
source_url: https://github.com/vercel-labs/agent-skills
source_skill: react-best-practices
install_native: npx skills add vercel-labs/agent-skills --skill react-best-practices
---
```

**Content:** Fetch and adapt from external source — rules for components, hooks, data fetching, bundle optimization, performance patterns.

#### 8.3 `oneticket-web-design-guidelines` (new — external wrapper)

Location: `.oneticket/skills/oneticket-web-design-guidelines/SKILL.md`

**Frontmatter:**
```yaml
---
name: oneticket-web-design-guidelines
description: Web design and UI audit rules — 100+ rules covering accessibility, performance, UX, responsive design. From Vercel Labs.
version: 1.0.0
source: external
source_url: https://github.com/vercel-labs/agent-skills
source_skill: web-design-guidelines
install_native: npx skills add vercel-labs/agent-skills --skill web-design-guidelines
---
```

**Content:** Fetch and adapt from external source — rules for accessibility, mobile-first design, performance, UX patterns.

#### 8.4 `oneticket-shadcn` (new — external wrapper)

Location: `.oneticket/skills/oneticket-shadcn/SKILL.md`

**Frontmatter:**
```yaml
---
name: oneticket-shadcn
description: shadcn/ui components, theming, and form patterns — conventions for projects using shadcn/ui with Vite (not Next.js)
version: 1.0.0
source: external
source_url: https://github.com/shadcn/ui
source_skill: shadcn
install_native: npx skills add shadcn/ui
---
```

**Content:** Fetch and adapt from external source — IMPORTANT: **adapt for Vite (not Next.js)**. Include component catalog, theming with CSS variables, form integration with React Hook Form.

### 9. Skill Frontmatter Governance Standard

All skills in `.oneticket/skills/` must include frontmatter with these fields:

```yaml
---
name: oneticket-*              # APM package name — must match directory name
description: "..."             # APM description — what the skill does, when to use it
version: "x.y.z"              # APM compatibility — semver
source: local | external       # local = produced by oneticket, external = wrapped from external source
source_url: ...                # if source: external — URL of the original repository
source_skill: ...              # if source: external — original skill name in external repo
install_native: ...            # if source: external — npx skills add command to install natively
---
```

**APM Compatibility:** The `name`, `description`, `version` fields follow the Agent Package Manager (APM) standard for package discovery and installation.

**Traceability:** The `source*` fields are oneticket extensions. They track the origin of every skill:
- `local` skills are produced and maintained by oneticket-core
- `external` skills are wrapped from external sources with full attribution

**Installation:** The `.oneticket/oneticket-install.mjs` script installs oneticket skills AFTER any APM install, ensuring oneticket skills always take precedence over external skills with the same name.

### 10. Runbook: appshell-reuse.md

Location: `.oneticket/docs/run/appshell-reuse.md`

Using template: `.oneticket/templates/runbook.md`

**Title:** How to Reuse AppShell for a New Project

**Content:**

**Step 1: Copy the skeleton**
```bash
cp -r apps/appshell/app apps/{your-project}/app
```

**Step 2: Configure environment variables**
- Open `apps/{your-project}/app/.env.example`
- Set `VITE_APP_NAME={Your Project Name}`

**Step 3: Update oneticket configuration**
- Open `.oneticket/config.yml`
- Update `current_project: {your-project}`

**Step 4: Customize AboutScreen**
- Open `apps/{your-project}/app/src/screens/AboutScreen.tsx`
- Replace the skeleton description with your project's purpose and vision
- Update links as needed

**Step 5: Customize HelpScreen**
- Open `apps/{your-project}/app/src/screens/HelpScreen.tsx`
- Replace the AppShell quickstart with your project's reuse/development quickstart
- Update the link to your project's runbook (if different from appshell-reuse.md)

**Step 6: Add feature screens**
- For each new feature, create a new file: `apps/{your-project}/app/src/screens/{FeatureName}Screen.tsx`
- One screen file = one feature. No exceptions.
- Each task owns exactly one screen file — zero merge conflicts.

**Step 7: Add hooks and mock data**
- Create hooks in `apps/{your-project}/app/src/hooks/use{Feature}.ts`
- Add mock data in `apps/{your-project}/app/src/mocks/data/{feature}.ts`
- Extend `mocks/handlers.ts` with new MSW handlers for your endpoints
- One hook = one async operation. One handler = one API endpoint.

**Step 8: Deploy automatically**
- Push to `main` branch
- GitHub Actions workflow `docs-site-github-pages.yml` triggers automatically
- Your app is live at `https://{org}.github.io/{repo}/{your-project}/`

**Additional resources:**
- AppShell skill: `.oneticket/skills/oneticket-appshell/SKILL.md`
- Design tokens and theme: `apps/{your-project}/app/src/styles/globals.css` and `tailwind.config.ts`
- Component library: `shadcn/ui` documentation (external)

### 11. Documentation Updates

#### 11.1 Update `product-spec.md`

Add to **Glossary / Business Concepts** section:

- **Local Skill** — A skill produced and maintained by oneticket-core. Frontmatter declares `source: local`.

- **External Skill (Wrapped)** — A skill adapted from an external source with full traceability. Frontmatter declares `source: external` + `source_url` + `source_skill` + `install_native`.

- **Skill Traceability** — Every skill in `.oneticket/skills/` declares its origin via the `source:` field in frontmatter. This enables clear attribution and native installation fallback.

Add to **Product Capabilities** section:

- **Skill Governance** — All skills include metadata for discovery, version compatibility, and attribution. External skills provide fallback installation instructions.

#### 11.2 Update `us-005-agent-profile-skills.md`

Add to **Acceptance Criteria** section:

- **Given** a skill wraps content from an external source, **Then** its frontmatter must declare `source: external`, `source_url` (repository URL), `source_skill` (original skill name), and `install_native` (npx command to install natively).

- **Given** a skill is produced locally by oneticket-core, **Then** its frontmatter must declare `source: local`.

- **Given** a skill is installed, **Then** it must have a `SKILL.md` file with a fenced code block containing YAML frontmatter at the top (before the first `#` heading) with `name`, `description`, `version`, and `source` fields required.

## Related User Stories

*To be populated in Task C (user story decomposition)*

The epic will be decomposed into user stories covering:
- File structure and exclusive ownership model
- Layout components (AppLayout, Header, Footer)
- Routing setup and screen definitions
- Theme toggle implementation
- Design tokens setup (CSS variables + Tailwind)
- Data fetching pattern (React Query + MSW)
- shadcn/ui component installation
- Skill creation (AppShell + wrappers)
- Documentation and runbook
- Integration and testing

## Related Slices

- [Slice 0 — AppShell Skeleton](../../../how/slices/slice-0-skeleton/slice.md)

---

## Success Criteria

**Build & Deployment:**
- ✅ `npm run build` succeeds without errors or warnings in `apps/appshell/app/`
- ✅ No uncommitted artifacts (`dist/`, `test-results/`, `*.tsbuildinfo`)

**Routes & Navigation:**
- ✅ Routes `/`, `/about`, `/help` render without errors
- ✅ Navigation between routes works correctly
- ✅ Header app name is clickable and navigates to `/`
- ✅ "About & Help" dropdown routes to correct screens

**Layout & Components:**
- ✅ Header component: app name (left), "About & Help" dropdown (right), ThemeToggle (far right)
- ✅ Footer component: structured, empty, ready for content
- ✅ Layout is responsive — no horizontal scrolling on mobile
- ✅ All shadcn components (button, card, dropdown-menu, separator, form) present and functional

**Theme & Styling:**
- ✅ ThemeToggle switches between system/light/dark modes
- ✅ Theme switching is reactive — no page reload
- ✅ Theme preference persists in localStorage
- ✅ `globals.css` defines CSS custom properties for light and dark modes
- ✅ `tailwind.config.ts` consumes CSS variables for colors, spacing, typography
- ✅ All screens use Tailwind utility classes — no inline styles or CSS modules

**Data Fetching & Mocking:**
- ✅ HomeScreen uses `useUsers()` hook to fetch user data
- ✅ React Query caches and delivers user data
- ✅ MSW intercepts `/api/users` in dev and returns mock data
- ✅ MSW is active in dev only (`import.meta.env.DEV` guard in `main.tsx`)
- ✅ Users rendered in Card components with proper layout

**Screen Content:**
- ✅ AboutScreen describes AppShell, its purpose, and vision
- ✅ AboutScreen links to generated documentation at `https://dsissoko.github.io/oneticket-core/appshell/docs/`
- ✅ AboutScreen links to GitHub repo at `https://github.com/dsissoko/oneticket-core`
- ✅ HelpScreen contains 7-step reuse quickstart
- ✅ HelpScreen links to runbook at `.oneticket/docs/run/appshell-reuse.md`

**Design Tokens:**
- ✅ All colors defined in `globals.css` CSS custom properties
- ✅ All spacing values defined in `tailwind.config.ts` spacing scale
- ✅ All typography values defined in `tailwind.config.ts` font scale
- ✅ No hardcoded color, spacing, or font values in component files

**File Ownership & Structure:**
- ✅ File structure enables exclusive ownership (one task per screen/hook)
- ✅ `screens/` directory contains HomeScreen, AboutScreen, HelpScreen
- ✅ `hooks/` directory contains useUsers example
- ✅ `mocks/` directory contains browser setup, handlers, and mock data
- ✅ `components/ui/` contains shadcn-installed components
- ✅ No two files in the same ownership category

**Skills & Documentation:**
- ✅ Skill `oneticket-appshell` created with full documentation
- ✅ Skills `oneticket-react-best-practices`, `oneticket-web-design-guidelines`, `oneticket-shadcn` created with full frontmatter
- ✅ All skills have `name`, `description`, `version`, `source` in frontmatter
- ✅ External skills have `source_url`, `source_skill`, `install_native`
- ✅ `product-spec.md` updated with local/external skill glossary
- ✅ `us-005-agent-profile-skills.md` updated with source tracking criterion
- ✅ Runbook `appshell-reuse.md` created and complete

**Code Quality:**
- ✅ All code is TypeScript — full type safety
- ✅ No console errors or warnings in dev or production builds
- ✅ Components follow accessibility best practices (WCAG guidelines)
- ✅ No hardcoded values — configuration via environment variables and centralized tokens
