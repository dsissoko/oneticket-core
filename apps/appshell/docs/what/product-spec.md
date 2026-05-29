# AppShell — Product Specification

## Product Overview

**AppShell** is the canonical skeleton and design system reference for all OneTicket application projects. It establishes a shared structure, design language, and development patterns that ensure visual consistency and parallel-safe code organization across the ecosystem.

**Site Description:** Canonical React + Vite skeleton with design tokens, layout patterns, and agent-friendly modular structure for OneTicket app projects.

### Product Vision

Eliminate merge conflicts in parallel development by enforcing exclusive file ownership. Prevent visual inconsistency by constraining design through tokens and Radix UI primitives. Provide a living template that developers and AI agents can copy, adapt, and extend safely.

---

## Primary Objectives

### 1. Eliminate Merge Errors in FAN-OUT Development
- **Goal:** Enable 6+ agents to work simultaneously without file conflicts
- **Mechanism:** Exclusive file ownership — each screen/route = 1 file, each component = 1 file
- **Guarantee:** No two tasks modify the same file
- **Outcome:** Merge-safe parallel delivery

### 2. Quality Design by Constraint
- **Goal:** Ensure visual and interaction coherence across all derived projects
- **Mechanism:** Design tokens frozen in `tailwind.config.ts` and `globals.css`; Radix UI + shadcn/ui primitives only
- **Guarantee:** Agents cannot introduce off-brand colors, typography, or spacing
- **Outcome:** Production-grade UI without manual review

### 3. Reusable Template for Developer Onboarding
- **Goal:** New projects copy `apps/appshell/app/` and adapt
- **Mechanism:** Clear folder structure, documented patterns, working example routes
- **Outcome:** Zero setup time for new projects; fast ramp-up

---

## Core Capabilities — Version 1.0

### 1. Skeleton & Layout System
- **Header Component** (locked after setup)
  - Clickable logo linking to `/`
  - Theme toggle (system/light/dark)
  - Responsive mobile menu (if nav grows)
  
- **Main Layout** (`AppLayout`)
  - Sticky header at top
  - Outlet for page content
  - Footer at bottom
  
- **Footer Component** (locked after setup)
  - Links to documentation, help, About
  - Copyright and versioning info

### 2. Design System & Tokens
- **Tailwind CSS Configuration**
  - Custom color palette (primary, secondary, accent, destructive, muted, background, foreground)
  - Spacing scale (4px baseline)
  - Typography scale (headings, body, small, label)
  - Border radius defaults (sm, md, lg)
  - Shadows and transitions pre-defined
  
- **shadcn/ui Primitives**
  - Button, Input, Textarea, Select, Checkbox, Radio, Toggle, Slider
  - Card, Badge, Alert, Toast, Dialog, Popover, Dropdown Menu
  - Form wrapper with React Hook Form integration
  
- **Global Styles** (`globals.css`)
  - CSS variables for theme switching (light/dark)
  - @apply classes for common patterns
  - Accessibility baseline (focus states, contrast)

### 3. Routing & Pages
- **Routes:**
  - `/` — Home page (landing/welcome)
  - `/about` — About AppShell (team, vision, tech stack)
  - `/help` — FAQ and documentation links
  
- **Router Setup** (`react-router-dom ^6`)
  - BrowserRouter with basename support
  - Lazy route loading via React.lazy()
  - Error boundary for 404 fallback

### 4. Authentication & State
- **State Management** (Zustand ^4)
  - `useAuthStore` — user session, roles, permissions
  - `useAppStore` — global UI state (theme, sidebar collapse, etc.)
  - Store persistence via localStorage
  
- **Auth Patterns**
  - Mock login endpoint (email/password)
  - JWT-like token in localStorage
  - Protected routes via `<ProtectedRoute>` wrapper
  - Auto-logout on token expiry

### 5. API & Data Fetching
- **React Query Integration** (@tanstack/react-query ^5)
  - Query hooks: `useUsers()`, `useUser(id)`, `useProfile()`
  - Mutation hooks: `useCreateUser()`, `useUpdateUser()`, `useDeleteUser()`
  - Query client configuration with sensible defaults
  
- **MSW Mock API** (Mock Service Worker ^2)
  - Handlers for GET/POST/PUT/DELETE endpoints
  - Request/response mocking in dev and test environments
  - Seed data for demo users, products, etc.

### 6. Form Management
- **React Hook Form** + Zod validation
  - `<FormField>` wrapper component (shadcn/ui)
  - Automatic error display and field state
  - Async validation support
  - Auto-submit on Enter (where appropriate)

### 7. Theme System
- **next-themes Integration** (^0.3, Vite-adapted)
  - System preference detection
  - Manual light/dark/system toggle
  - Persistent theme preference in localStorage
  - CSS variable switching (no re-render)

### 8. Testing Foundation
- **Vitest + React Testing Library**
  - Component unit tests for Header, Footer, Layout
  - Integration tests for routes and authentication
  - MSW handlers in test mode
  - Snapshot tests for design tokens

### 9. Icon System
- **lucide-react**
  - 300+ consistent, accessible icons
  - Used in buttons, nav, forms, alerts
  - Configurable size and color via Tailwind

---

## File Structure (Exclusive Ownership Model)

```
apps/appshell/
├── app/
│   ├── src/
│   │   ├── index.tsx              # App entry point
│   │   ├── App.tsx                # Root router & layout
│   │   │
│   │   ├── components/            # Shared, locked components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Header.tsx         # Locked
│   │   │   ├── Footer.tsx         # Locked
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   ├── pages/                 # Route screens (exclusive files)
│   │   │   ├── HomePage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   └── HelpPage.tsx
│   │   │
│   │   ├── hooks/                 # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useTheme.ts
│   │   │   ├── useUsers.ts        # React Query hook
│   │   │   └── useForm.ts
│   │   │
│   │   ├── stores/                # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   └── appStore.ts
│   │   │
│   │   ├── api/                   # API clients & types
│   │   │   ├── client.ts          # Axios/fetch wrapper
│   │   │   ├── endpoints.ts       # API URLs
│   │   │   ├── types.ts           # Request/response DTOs
│   │   │   └── mocks.ts           # MSW handlers
│   │   │
│   │   ├── lib/                   # Utilities
│   │   │   ├── classNames.ts      # clsx + tailwind-merge
│   │   │   ├── validation.ts      # Zod schemas
│   │   │   └── constants.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── globals.css        # Design tokens, theme vars
│   │   │   └── variables.css      # Tailwind theme CSS vars
│   │   │
│   │   └── __tests__/             # Test files (mirror src/)
│   │       ├── components/
│   │       ├── pages/
│   │       ├── hooks/
│   │       └── stores/
│   │
│   ├── public/
│   │   ├── favicon.svg
│   │   └── og-image.png
│   │
│   ├── vite.config.ts             # Vite configuration
│   ├── tailwind.config.ts          # Design tokens (locked)
│   ├── tsconfig.json
│   ├── package.json
│   ├── vitest.config.ts
│   └── index.html
│
├── docs/
│   ├── what/
│   │   ├── product-spec.md        # This file
│   │   └── epics/                 # Feature breakdowns (created by @po)
│   │
│   └── how/
│       ├── architecture.md        # Technical stack & decisions
│       └── slices/                # Implementation slices
│
└── README.md
```

---

## Domain Model

### Entities

| Entity | Key Attributes | States |
|--------|---------------|--------|
| **User** | id, email, name, role, createdAt | active, inactive, suspended |
| **Session** | id, userId, token, expiresAt | valid, expired, revoked |
| **Theme** | mode, preference | system, light, dark |
| **App Config** | version, features, settings | enabled, disabled |

### Relationships
- User → Session (1-to-many)
- Session → User (many-to-1)
- User → Theme (1-to-1)
- App → Theme (1-to-1)

### Business Rules

1. **Authentication**
   - A Session is valid until `expiresAt`; requests with expired tokens are rejected
   - Only one active Session per User at a time
   - Logout revokes the current Session

2. **Theme**
   - If theme mode is "system", follow OS preference
   - User can override system preference with explicit light/dark choice
   - Theme preference persists in localStorage

3. **Design Tokens**
   - All component colors, spacing, typography are derived from `tailwind.config.ts`
   - No inline styles or magic numbers allowed in components
   - shadcn/ui primitives are the only approved component library

4. **File Ownership**
   - Each route/screen owns one `.tsx` file; no shared file modification
   - Shared components (Header, Footer, AppLayout) are locked after v1 setup
   - New features add new files; they never modify locked files

5. **API Integration**
   - All HTTP calls go through `api/client.ts` (centralized)
   - MSW handlers provide mock responses in dev/test
   - Real API calls use the same interface (no code change needed)

---

## User Personas & Journeys

### Persona 1: Developer (OneTicket Team)
**Goal:** Copy AppShell and spin up a new project in <1 hour

**Journey:**
1. Read README and product-spec.md
2. Copy `apps/appshell/app/` to `apps/my-new-app/`
3. Update package.json (name, version)
4. Update `routes` in App.tsx for new pages
5. Update theme tokens in tailwind.config.ts if needed
6. `npm install && npm run dev`
7. Create new pages by adding files to `src/pages/`

**Success Metric:** Time to first screen render < 10 minutes

### Persona 2: AI Agent
**Goal:** Implement a new page or feature without breaking parallel tasks

**Journey:**
1. Receive story: "Create a Users page listing all users"
2. Create exclusive file `src/pages/UsersPage.tsx`
3. Use `useUsers()` hook to fetch data
4. Use shadcn/ui Table component for layout
5. Add route in App.tsx (no conflict, separate area)
6. Test with existing MSW handlers
7. Commit and merge without conflicts

**Success Metric:** Implement 3 pages in parallel with zero merge errors

### Persona 3: Product Manager
**Goal:** Track progress and understand what AppShell enables

**Journey:**
1. Review epics in `docs/what/epics/`
2. See which features are in v1 vs. backlog
3. Approve new capabilities before dev begins
4. Use AppShell as a demo to show OneTicket standards

**Success Metric:** All feature requests mapped to epics and prioritized

---

## Acceptance Criteria

✅ **Structure & Setup**
- [ ] Directory structure matches spec above
- [ ] TypeScript strict mode enabled
- [ ] Vite dev server runs without errors
- [ ] All locked components (Header, Footer, AppLayout) render correctly

✅ **Routes**
- [ ] `/` renders HomePage
- [ ] `/about` renders AboutPage
- [ ] `/help` renders HelpPage
- [ ] Non-existent routes show 404

✅ **Design System**
- [ ] `tailwind.config.ts` defines all tokens (colors, spacing, typography)
- [ ] shadcn/ui components install correctly
- [ ] Button, Input, Card, Badge render with Tailwind styling
- [ ] Theme toggle switches between light/dark modes

✅ **State & Auth**
- [ ] `useAuthStore` persists user session to localStorage
- [ ] `useAppStore` manages global UI state
- [ ] ProtectedRoute component guards pages
- [ ] Mock login endpoint works in MSW

✅ **Data & API**
- [ ] `useUsers()` hook fetches users from MSW
- [ ] React Query caching works (no duplicate requests)
- [ ] Mutation hooks (create, update, delete) work with MSW
- [ ] API types (Request/Response DTOs) are defined in `api/types.ts`

✅ **Forms**
- [ ] React Hook Form + Zod validation work
- [ ] FormField component displays errors
- [ ] Async validation (e.g., email uniqueness) resolves

✅ **Theme System**
- [ ] System preference is detected on load
- [ ] Manual toggle persists to localStorage
- [ ] CSS variables switch without page reload
- [ ] Accounts for prefers-color-scheme media query

✅ **Testing**
- [ ] Unit tests for Header, Footer, AppLayout pass
- [ ] Integration test for `/about` route passes
- [ ] MSW handlers inject test data correctly
- [ ] No console errors or warnings in test run

✅ **Documentation**
- [ ] README.md explains purpose and how to copy AppShell
- [ ] This product-spec.md is complete and accurate
- [ ] Code comments explain non-obvious patterns
- [ ] TypeScript JSDoc on public functions

---

## Success Metrics (v1)

| Metric | Target | Validation |
|--------|--------|------------|
| Setup time | <10 min | Developer can clone, install, run in <10 min |
| Merge conflicts on parallel dev | 0 | 6 agents implement features simultaneously, zero conflicts |
| Design consistency | 100% | All UI matches Figma design tokens; no off-brand colors |
| Test coverage | >80% | Components, hooks, stores all have tests |
| Accessibility | WCAG AA | All interactive elements keyboard-navigable, color contrast ≥4.5:1 |
| Performance | LCP <2.5s | Lighthouse score ≥90 on HomePage |

---

## Out of Scope (v1)

- Multi-language i18n (English only)
- Complex permission/role-based access control
- Real API backend (MSW mocking only)
- Mobile app or Electron version
- Analytics or telemetry
- Advanced animations or gesture controls

---

## Constraints & Rules

1. **No file sharing:** Each component, page, or feature owns its files exclusively
2. **Design tokens immutable:** `tailwind.config.ts` and `globals.css` are locked after v1 setup; new tokens must go through review
3. **Vite only:** No Next.js, no webpack, no other bundlers
4. **TypeScript strict:** `strict: true` in `tsconfig.json`; no `any` types allowed
5. **Accessibility first:** All interactive elements must pass axe audit
6. **Responsive design:** Mobile-first breakpoints (Tailwind sm/md/lg/xl)
7. **No external CSS frameworks:** Tailwind + shadcn/ui only
8. **Testing required:** All new components/pages must have tests before merge

---

## Timeline & Releases

- **v1.0 (Initial Release)**
  - Skeleton, layout, design system, 3 demo routes
  - Auth patterns, MSW, form validation
  - Vitest setup, documentation
  
- **v1.1 (Q2 2026)**
  - Enhanced authentication (OAuth, social login)
  - Advanced form patterns (multi-step, conditional fields)
  
- **v2.0 (Q3 2026+)**
  - Real backend integration, real auth
  - Advanced data fetching (pagination, filtering)
  - Performance optimization (code splitting, lazy loading)

---

## Support & Feedback

- **Issues:** Report bugs and feature requests on GitHub
- **Discussions:** Ask questions in project discussions
- **Docs:** Read README.md and inline comments for guidance
- **Templates:** Copy examples from `docs/how/slices/` to implement similar features

---

**Last Updated:** 2026-05-29  
**Owner:** @analyst  
**Status:** Draft (awaiting @po review and approval)
