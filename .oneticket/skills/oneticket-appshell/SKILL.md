---
name: oneticket-appshell
description: "AppShell skeleton structure, screens convention, components/ui/, design tokens. Eliminate merge conflicts via file ownership. Enforce consistent design."
version: "1.0.0"
source: local
---

# Skill: oneticket-appshell

## Purpose

AppShell is the foundational application skeleton for all OneTicket frontend projects. This skill establishes:
- **Structural conventions** that eliminate merge conflicts through exclusive file ownership
- **Screen organization** where one screen = one file = one agent owner
- **UI component standards** using shadcn/ui with consistent theming
- **Design token enforcement** via a single source of truth

Use this skill when:
- Setting up a new AppShell application
- Adding new screens or pages
- Implementing UI components
- Standardizing design across features
- Coordinating parallel development to prevent conflicts

## AppShell Intent and Structure

AppShell provides a minimal, opinionated React + Vite foundation that prioritizes:

1. **Zero merge conflicts** — exclusive file ownership prevents parallel edit collisions
2. **Consistent visual language** — design tokens and component standards applied universally
3. **Clear separation of concerns** — screens, components, styles, hooks, and utilities are isolated
4. **Agent coordination** — each agent owns exactly one screen file

### Directory Structure

```
app/
├── src/
│   ├── screens/                    # One file per screen — exclusive ownership
│   │   ├── HomePage.tsx            # @agent-name owns this file
│   │   ├── SettingsPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── ...
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives (installed once)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── PageHeader.tsx          # Shared UI patterns
│   │   ├── EmptyState.tsx
│   │   ├── ...
│   │   └── index.ts                # Centralized exports
│   ├── hooks/                       # Custom React hooks
│   ├── lib/                         # Utilities and helpers
│   ├── styles/
│   │   └── globals.css             # Design tokens + Tailwind
│   ├── types/                       # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.ts              # Tailwind configuration + design tokens
├── vite.config.ts
└── package.json
```

## Screens Convention

### Core Rule: One Screen = One File = One Owner

Each screen is a single file in `src/screens/`. This convention:

- **Prevents merge conflicts** — only one agent edits each file
- **Clarifies ownership** — developers know who owns each screen
- **Enables parallelization** — multiple agents can work on different screens simultaneously
- **Simplifies debugging** — each screen is self-contained and testable

### Screen File Anatomy

Each screen file must:

1. **Import shared components** from `src/components/`
2. **Use PageHeader** at the top for consistent navigation
3. **Follow TypeScript** for type safety
4. **Use React Query** for async data fetching
5. **Leverage Zustand** for cross-screen state

```tsx
// src/screens/DashboardPage.tsx
import React, { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/hooks/useDashboardStore';

export const DashboardPage: FC = () => {
  const { filters, setFilter } = useDashboardStore();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', filters],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard?filters=${JSON.stringify(filters)}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      return response.json();
    },
  });

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="View your metrics" />
      <div className="space-y-4 p-4">
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-600">Error: {error.message}</p>}
        {data && (
          <Card>
            {/* Screen content */}
          </Card>
        )}
      </div>
    </div>
  );
};
```

## Components/UI/ Convention

### Principles

- **shadcn/ui only** — all UI primitives come from shadcn
- **Never modify installed components** — customize via composition and styling
- **Install once, use everywhere** — no parallel installations or overwrites
- **Extend in dedicated wrapper files** — create `CustomButton.tsx` instead of modifying `button.tsx`

### When to Install shadcn Components

1. Identify the primitive you need (Button, Dialog, Tooltip, etc.)
2. Run: `npx shadcn-ui@latest add <component>`
3. Import from `@/components/ui/<component>`
4. Never hand-edit the installed file

### When to Create Custom Components

If shadcn does not provide what you need, create a wrapper:

```tsx
// src/components/CustomCard.tsx
import { Card } from '@/components/ui/card';
import React, { FC, ReactNode } from 'react';

interface CustomCardProps {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
}

export const CustomCard: FC<CustomCardProps> = ({ icon, title, children }) => (
  <Card className="border-l-4 border-l-blue-500 p-4">
    <div className="flex items-center gap-2 mb-2">
      {icon && <span className="text-xl">{icon}</span>}
      <h3 className="font-semibold">{title}</h3>
    </div>
    {children}
  </Card>
);
```

## Design Tokens and Styling

### Global Styles

All design tokens live in two files:

1. **`src/styles/globals.css`** — Tailwind directives and CSS variables
2. **`tailwind.config.ts`** — Tailwind theme customization

### Rules

- **No inline styles** — always use Tailwind classes
- **No style prop** — use `className` only
- **Token-driven spacing** — never use raw `px` values; use Tailwind spacing scale (sm, md, lg, etc.)
- **Semantic colors** — reference design tokens, not hex values

### Example: Global Styles

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #0366d6;
  --color-danger: #d1242f;
  --color-success: #28a745;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}

@layer components {
  .text-xs { @apply text-xs font-normal leading-4; }
  .text-sm { @apply text-sm font-normal leading-5; }
  .text-base { @apply text-base font-normal leading-6; }
  .text-lg { @apply text-lg font-semibold leading-7; }
  .text-xl { @apply text-xl font-bold leading-8; }
}
```

### Example: Tailwind Config

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

## Visual Conventions for Agents

Every agent building UI in AppShell must follow these patterns:

### 1. Always Use PageHeader at Screen Top

```tsx
import { PageHeader } from '@/components/PageHeader';

export const MyPage: FC = () => (
  <div>
    <PageHeader title="Page Title" subtitle="Optional subtitle" />
    {/* Rest of page */}
  </div>
);
```

### 2. Always Use Card for Grouped Content

```tsx
import { Card } from '@/components/ui/card';

export const MySection = () => (
  <Card className="p-4">
    <h2 className="mb-2 font-semibold">Section Title</h2>
    {/* Card content */}
  </Card>
);
```

### 3. Always Use EmptyState When No Data

```tsx
import { EmptyState } from '@/components/EmptyState';

export const MyList = ({ items }: { items: any[] }) => {
  if (items.length === 0) {
    return <EmptyState title="No items" description="Create your first item to get started." />;
  }
  return <div>{/* List rendering */}</div>;
};
```

### 4. Never Inline Styles

```tsx
// ❌ WRONG
<div style={{ marginBottom: '1rem', color: 'red' }}>Text</div>

// ✅ CORRECT
<div className="mb-4 text-red-600">Text</div>
```

### 5. Spacing: Always Tailwind Classes, Never Raw px

```tsx
// ❌ WRONG
<div style={{ padding: '12px' }}>Content</div>

// ✅ CORRECT
<div className="p-3">Content</div>
```

### 6. Typography: Always Use Defined Scale

```tsx
// ❌ WRONG
<h1 style={{ fontSize: '28px' }}>Heading</h1>

// ✅ CORRECT
<h1 className="text-xl font-bold">Heading</h1>
```

### 7. Icons: Always lucide-react, Never Emoji/Text

```tsx
import { CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

export const IconExample = () => (
  <div>
    <CheckCircle2 className="w-5 h-5 text-green-600" />
    <AlertCircle className="w-5 h-5 text-yellow-600" />
    <Trash2 className="w-5 h-5 text-red-600" />
  </div>
);
```

## Available Libraries

| Library | Purpose | When to Use |
|---------|---------|------------|
| **shadcn/ui** | UI primitives (Button, Card, Dialog, etc.) | All UI components |
| **React Hook Form + Zod** | Forms and validation | Form screens, validation logic |
| **React Query** | Data fetching and caching | Async data from API |
| **Zustand** | Global state management | Cross-screen state, auth, filters |
| **lucide-react** | Icons | Any icon needed in UI |
| **MSW (Mock Service Worker)** | Mock API responses | Development, testing |
| **Tailwind CSS** | Utility-first styling | All styling (never inline) |
| **TypeScript** | Type safety | All code (strict mode) |

## How @po Commands New Projects Based on AppShell

When the Product Owner (@po) defines a new feature or project, they:

1. **Create an Epic** in `docs/what/epics/` with feature requirements
2. **Command the Lead Developer** (@leaddev) to scaffold a new screen
3. **Provide a Manifest** with parallel screen tasks
4. **Each Agent Owns One Screen** — exclusive file ownership from start

Example command to @leaddev:
```
Create a UsersPage screen in AppShell with:
- List of users (fetchable via React Query)
- Add User button (opens dialog)
- Delete user action (with confirmation)
- Filter by role (state in Zustand)

Use shadcn components (Button, Dialog, Table).
```

@leaddev then:
1. Creates `src/screens/UsersPage.tsx`
2. Sets up hooks and stores needed
3. Returns the manifest for parallel assignments

## How @leaddev Decomposes Tasks

When building a feature set for AppShell:

### Task 0: Skeleton Setup

```
- Create src/screens/ directory
- Install required shadcn components
- Set up Tailwind config with design tokens
- Create shared components (PageHeader, EmptyState, etc.)
- Configure React Query and Zustand stores
```

### Then: Parallel Screen Tasks

Once skeleton is ready, @leaddev breaks work into parallel screen tasks:

```
Task 1: Agent A owns HomePage.tsx
  - Fetch data with React Query
  - Display content in Cards
  - Add filter state in Zustand

Task 2: Agent B owns SettingsPage.tsx
  - Form with React Hook Form + Zod
  - Save settings to Zustand
  - Display success/error states

Task 3: Agent C owns DashboardPage.tsx
  - Complex data visualizations
  - Multiple Cards for sections
  - Real-time updates via React Query polling
```

### No Bottlenecks

- Agents work in parallel on different screens
- Shared components are owned by Task 0 (no parallel edits)
- State stores (Zustand) are defined in Task 0
- Each agent imports and uses, never modifies

## Component Import/Export Hygiene

All components must be exported from `src/components/index.ts`:

```ts
// src/components/index.ts
export { PageHeader } from './PageHeader';
export { EmptyState } from './EmptyState';
export { ErrorBoundary } from './ErrorBoundary';
export { Button } from './ui/button';
export { Card } from './ui/card';
export { Dialog } from './ui/dialog';
// ... all exported components
```

Import consistently:

```tsx
import { PageHeader, Card, Button, EmptyState } from '@/components';
```

## Consistency Checkpoints

Before marking a screen as complete, verify:

- [ ] Uses `PageHeader` at top
- [ ] All content grouped in `Card` components
- [ ] Empty state shown when no data
- [ ] No inline styles (`style={}`)
- [ ] Spacing uses Tailwind (`p-`, `m-`, etc.)
- [ ] Typography uses scale (`text-sm`, `text-base`, etc.)
- [ ] Icons are from `lucide-react`
- [ ] Form inputs validated with Zod
- [ ] Async data fetched with React Query
- [ ] Global state in Zustand store
- [ ] No circular imports
- [ ] TypeScript strict mode passes
