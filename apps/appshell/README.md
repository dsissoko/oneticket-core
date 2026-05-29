# AppShell — React + Vite Reference Application

AppShell is a canonical React + Vite single-page application (SPA) that serves as a reference implementation and scaffolding template for all OneTicket projects.

**Vision:** Enable teams to scaffold new projects from AppShell with zero boilerplate friction, parallel-safe development patterns, and pre-configured tooling for routing, state management, API integration, and testing.

---

## Quick Start

### Prerequisites
- Node.js 18+ (recommended: 20 LTS)
- npm 9+

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Run tests
npm run test

# Run smoke tests
npm run test:smoke

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure

```
apps/appshell/
├── app/                          # Application code (React + TypeScript)
│   ├── src/
│   │   ├── components/           # UI components (layout, feature components)
│   │   │   ├── layout/           # Locked: AppLayout, Header, Footer
│   │   │   ├── ThemeToggle.tsx    # Theme switcher component
│   │   │   ├── ErrorBoundary.tsx  # Error handling boundary
│   │   │   └── ...
│   │   ├── hooks/                # Custom React hooks (useUsers, useTheme, etc.)
│   │   ├── pages/                # Page components (HomePage, AboutPage, etc.)
│   │   ├── stores/               # Zustand state stores (auth, app)
│   │   ├── api/                  # API client, endpoints, types, and MSW mocks
│   │   ├── types/                # TypeScript type definitions
│   │   ├── lib/                  # Utility functions and helpers
│   │   ├── main.css              # Global styles
│   │   └── index.tsx             # App entry point
│   ├── vite.config.ts            # Vite configuration (dev server, build)
│   ├── tailwind.config.ts        # Tailwind CSS design tokens (colors, spacing, fonts)
│   ├── tsconfig.json             # TypeScript configuration (strict mode)
│   ├── package.json              # Dependencies and scripts
│   └── index.html                # HTML template
└── docs/                         # Documentation
    ├── how/
    │   ├── architecture.md       # Full architecture documentation
    │   ├── RUN-BOOK.md           # Step-by-step guide to reuse skeleton
    │   ├── c4/                   # C4 architecture diagrams (context, containers, components)
    │   └── slices/               # Implementation slices (vertical cuts)
    └── what/
        ├── product-spec.md       # Product vision and requirements
        └── epics/                # Feature epics and user stories
```

---

## Architecture Overview

### Core Principles

1. **Exclusive File Ownership** — Each component owns one `.tsx` file; no file sharing between features
2. **Design by Constraint** — Design tokens frozen in Tailwind config; approved primitives only
3. **Single Responsibility** — API layer, state layer (Zustand + React Query), UI layer clearly separated
4. **Parallel-Safe Development** — Multiple developers work simultaneously with zero merge conflicts

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | React 18 + TypeScript | Component rendering and UI logic |
| **Build Tool** | Vite 5 | Fast dev server and optimized production builds |
| **Routing** | React Router v6 | Client-side navigation and lazy-loaded routes |
| **Local State** | Zustand v4 | Lightweight app state (auth, theme, UI state) |
| **Server State** | React Query v5 | Data fetching, caching, and synchronization |
| **Styling** | Tailwind CSS v3 | Utility-first CSS with frozen design tokens |
| **Mocking** | MSW v2 | Mock Service Worker for API mocking in dev/test |
| **Testing** | Vitest + Testing Library | Unit and integration tests |

### Data Flow

```
User Action
    ↓
React Component (hooks, state)
    ↓
Zustand Store (app state) OR React Query Hook (server state)
    ↓
API Client (fetch wrapper)
    ↓
MSW Interceptor (dev/test) or Real HTTP (production)
    ↓
Response → Component Re-render
```

### Key Components

**Layout (Locked)**
- **AppLayout** — Root layout with sticky header, content area, sticky footer
- **Header** — Navigation, logo, theme toggle
- **Footer** — Links, copyright, project info

**Pages**
- **HomePage** — Welcome page at `/`
- **AboutPage** — About page at `/about`
- **HelpPage** — Help/FAQ at `/help`

**State Management**
- **useAuthStore** — Authentication state (user, token, login/logout)
- **useAppStore** — App state (theme, sidebar collapse)
- **useTheme** — Custom hook for theme preference
- **useUsers** — React Query hook for fetching users

---

## Documentation

### Essential Reading

1. **[Architecture Documentation](./docs/how/architecture.md)** — Detailed system design, interfaces, and constraints
2. **[RUN-BOOK](./docs/how/RUN-BOOK.md)** — Step-by-step guide to copy AppShell skeleton to a new project
3. **[C4 System Context](./docs/how/c4/system-context.md)** — User interactions and system boundaries
4. **[Product Specification](./docs/what/product-spec.md)** — Vision, requirements, and success metrics

### Implementation Slices

Each slice represents a vertical feature cut from end-to-end (API, state, UI):

- **Slice 0** — Setup (Vite, TypeScript, Tailwind, MSW)
- **Slice 1** — Layout (AppLayout, Header, Footer, responsive design)
- **Slice 2** — Routing (React Router, lazy loading, error boundary)
- **Slice 3** — Data Fetching (API client, React Query, MSW handlers)
- **Slice 4** — Theme Toggle (Zustand, light/dark mode switching)
- **Slice 5** — Documentation (README, JSDoc, runbook)

See [Slices Directory](./docs/how/slices/) for detailed implementation guides.

---

## Exclusive File Ownership Model

AppShell enforces **exclusive file ownership** to enable parallel-safe development:

### The Rule

> **One file = One feature. No file sharing between features.**

### Example

```
✅ CORRECT: Two developers, zero conflicts
src/pages/UsersPage.tsx         (Developer A owns this file exclusively)
src/pages/ProfilePage.tsx       (Developer B owns this file exclusively)
src/components/Button.tsx       (Shared via shadcn/ui import, not modified)

❌ WRONG: Both developers modify the same file → merge conflicts
src/pages/UsersPage.tsx         (Developer A modifies)
src/pages/UsersPage.tsx         (Developer B modifies) ← CONFLICT!
```

### Locked Components (Protected)

These components are locked after v1 and cannot be modified without architectural review:

- `src/components/layout/AppLayout.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`

This protects the global layout from breaking while allowing features to coexist.

---

## Development Workflow

### Adding a New Page

1. Create a new file: `src/pages/NewPage.tsx`
2. Define the component (exclusive file ownership)
3. Add route in `src/index.tsx`
4. Write tests in `src/pages/__tests__/NewPage.test.tsx`

### Adding a New API Endpoint

1. Add endpoint definition to `src/api/endpoints.ts`
2. Add request/response types to `src/api/types.ts`
3. Add MSW handler to `src/api/mocks.ts`
4. Create custom hook `src/hooks/useMyData.ts` using React Query

### Adding a New Store

1. Create store file: `src/stores/myStore.ts` using Zustand
2. Export store and custom hook: `export const useMyStore = ...`
3. Use in components: `const { data, setData } = useMyStore()`

---

## External Resources

### Vite
- [Official Documentation](https://vitejs.dev/)
- [React Plugin Guide](https://github.com/vitejs/vite-plugin-react)

### React Router
- [Official Documentation](https://reactrouter.com/)
- [Lazy Loading Guide](https://reactrouter.com/en/main/route/lazy)

### React Query
- [Official Documentation](https://tanstack.com/query/latest)
- [Quick Start Guide](https://tanstack.com/query/latest/docs/react/overview)

### Mock Service Worker (MSW)
- [Official Documentation](https://mswjs.io/)
- [Request Handlers Guide](https://mswjs.io/docs/basics/request-handler)

### Tailwind CSS
- [Official Documentation](https://tailwindcss.com/)
- [Configuration Guide](https://tailwindcss.com/docs/configuration)

### TypeScript
- [Official Documentation](https://www.typescriptlang.org/)
- [Strict Mode Guide](https://www.typescriptlang.org/tsconfig#strict)

---

## Troubleshooting

### Port Already in Use
```bash
# Vite tries 5173 first, then increments. Force a specific port:
npm run dev -- --port 5174
```

### TypeScript Compilation Error
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### MSW Not Intercepting API Calls
- Check that `setupWorker()` is enabled in `src/index.tsx`
- Verify handler definitions in `src/api/mocks.ts` match your request paths
- Check browser console for MSW warnings

### Tailwind Classes Not Applied
- Ensure `tailwind.config.ts` has correct `content` paths
- Run `npm install` if adding new Tailwind dependencies
- Hard-refresh browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Hot Module Reload (HMR) Not Working
```bash
# Vite HMR config may need adjustment for remote development:
npm run dev -- --host
```

---

## Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for development guidelines.

### Code Standards

- **TypeScript Strict Mode** — All code in strict mode (`noImplicitAny`, `strictNullChecks`, etc.)
- **No `any` Types** — Use proper TypeScript types
- **JSDoc Comments** — Document public functions and components
- **Tests Required** — All new features require unit or integration tests
- **Accessibility (WCAG AA)** — Interactive elements keyboard-navigable; color contrast ≥ 4.5:1

---

## License

© 2026 OneTicket. All rights reserved.

---

## Support

- 💬 **Questions?** Check [FAQs in Help Page](./docs/help.md) or raise an issue
- 🐛 **Found a bug?** Open an [issue on GitHub](https://github.com/dsissoko/oneticket-core/issues)
- 📖 **Need docs?** See [Architecture](./docs/how/architecture.md) and [Slices](./docs/how/slices/)
