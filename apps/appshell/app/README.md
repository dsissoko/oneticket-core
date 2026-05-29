# AppShell

A reference skeleton for React/Vite application projects. This is a minimal but complete setup that eliminates merge errors through clear file ownership and enforces design quality via Tailwind CSS and component architecture.

## Quick Start

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This runs TypeScript type checking followed by Vite optimized build.

### Run Tests

```bash
npm test
```

Run the test suite with Vitest. Additional test commands:

- `npm run test:ui` — Run tests with interactive UI
- `npm run test:coverage` — Generate coverage reports

## Core Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (TypeScript + Vite) |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run test suite |
| `npm run lint` | Check code style |
| `npm run lint:fix` | Fix code style issues |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Type checking without emit |

## Directory Structure

```
app/
├── package.json           # Dependencies and npm scripts
├── src/                   # Source code
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API and external services
│   ├── store/             # State management (Zustand)
│   ├── styles/            # CSS and Tailwind config
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── App.tsx            # Root component
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── vitest.config.ts       # Vitest configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## Technology Stack

- **React** 18.3+ — UI library
- **Vite** 5+ — Fast build tool and dev server
- **TypeScript** 5.3+ — Type-safe JavaScript
- **Tailwind CSS** 3.4+ — Utility-first styling
- **Vitest** — Fast unit testing
- **React Router** — Client-side routing
- **TanStack Query** — Data fetching and caching
- **Zustand** — Lightweight state management
- **shadcn/ui** — High-quality component library
- **MSW** 2+ — API mocking for development
- **React Hook Form + Zod** — Form handling and validation

## Documentation

For detailed architecture, design decisions, and implementation guides, see:

- [`docs/how/architecture.md`](../docs/how/architecture.md) — System design and architecture
- [`docs/what/product-spec.md`](../docs/what/product-spec.md) — Product requirements
- [`docs/what/epics/`](../docs/what/epics/) — Epic breakdown and user stories

## Development Guidelines

- Follow the component architecture patterns in `src/components/`
- Use React Router for navigation
- Manage global state with Zustand
- Mock API calls with MSW in tests and development
- Write tests alongside components
- Use TypeScript for all new code
- Format code with `npm run format` before committing

## License

MIT
