---
name: oneticket-shadcn
description: "shadcn/ui components, theming, forms — conventions for Vite projects (not Next.js)."
version: "1.0.0"
source: external
source_url: https://github.com/shadcn/ui
source_skill: shadcn
install_native: npx skills add shadcn/ui --skill shadcn
---

# Skill: oneticket-shadcn

## Overview

shadcn/ui is a collection of copy-paste-able React components built on top of Radix UI and Tailwind CSS. This skill covers how to use shadcn components in Vite projects (not Next.js), including installation, theming, composition, and best practices.

## Key Philosophy

- **Copy and paste, not install** — components are copied into your codebase, not imported from npm
- **You own the code** — modify components to fit your needs
- **Built on proven primitives** — Radix UI for accessibility, Tailwind for styling
- **No breaking changes** — updates are opt-in

## Quick Start in Vite

### Step 1: Initialize shadcn/ui

```bash
npx shadcn-ui@latest init
```

This creates:
- `components.json` — configuration file
- `src/components/ui/` — directory for shadcn components
- Tailwind CSS configuration (if not already present)

### Step 2: Add Your First Component

```bash
npx shadcn-ui@latest add button
```

This copies the Button component into `src/components/ui/button.tsx`. Repeat for each component you need.

### Step 3: Use the Component

```tsx
import { Button } from '@/components/ui/button';

export function App() {
  return <Button>Click me</Button>;
}
```

## Available Components

### Forms
- **Button** — call-to-action and interactive elements
- **Input** — text, email, password, number fields
- **Textarea** — multi-line text
- **Checkbox** — boolean selection
- **Radio** — single selection from group
- **Select** — dropdown selection
- **Label** — form field labels
- **Form** — wrapper for form validation with React Hook Form + Zod

### Layout
- **Card** — container for grouped content
- **Container** — responsive width wrapper
- **Separator** — visual divider

### Data Display
- **Table** — structured data
- **Badge** — small label/tag
- **Avatar** — user profile image
- **Progress** — progress bar
- **Skeleton** — loading placeholder

### Feedback
- **Alert** — informational message (success, error, warning)
- **AlertDialog** — confirmation dialog (destructive actions)
- **Dialog** — modal popup
- **Toast** — transient notification (via Toaster)
- **Tooltip** — hover-triggered hint

### Navigation
- **Tabs** — section navigation
- **Breadcrumb** — hierarchical navigation path
- **Pagination** — page navigation

### Popover & Dropdowns
- **Popover** — floating content panel
- **Dropdown Menu** — context menu
- **Command** — search/command palette

### Others
- **Sheet** — off-canvas sidebar
- **Carousel** — image/content carousel
- **Collapsible** — expandable/collapsible content

## Component Patterns

### Button Variants

```tsx
import { Button } from '@/components/ui/button';

// Default (primary)
<Button>Click me</Button>

// Secondary
<Button variant="secondary">Secondary</Button>

// Destructive (red)
<Button variant="destructive">Delete</Button>

// Ghost (no background)
<Button variant="ghost">Ghost</Button>

// Outline
<Button variant="outline">Outline</Button>

// Link-style
<Button variant="link">Link</Button>

// Size
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>
```

### Form with Validation

shadcn provides a `Form` component that works with React Hook Form and Zod:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be 8+ characters'),
});

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Sign in</Button>
      </form>
    </Form>
  );
}
```

### Dialog (Modal)

```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function DeleteDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Delete</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Alert

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, InfoIcon } from 'lucide-react';

// Success
<Alert>
  <CheckCircle2 className="h-4 w-4" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Item saved successfully</AlertDescription>
</Alert>

// Error
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Failed to save. Please try again.</AlertDescription>
</Alert>

// Info
<Alert>
  <InfoIcon className="h-4 w-4" />
  <AlertTitle>Info</AlertTitle>
  <AlertDescription>New version available. Refresh to update.</AlertDescription>
</Alert>
```

### Card

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Dashboard</CardTitle>
    <CardDescription>Welcome back!</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content goes here */}
  </CardContent>
</Card>
```

### Badge

```tsx
import { Badge } from '@/components/ui/badge';

// Default
<Badge>New</Badge>

// Variants
<Badge variant="secondary">In Progress</Badge>
<Badge variant="outline">Pending</Badge>
<Badge variant="destructive">Blocked</Badge>
```

### Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content for tab 1</TabsContent>
  <TabsContent value="tab2">Content for tab 2</TabsContent>
</Tabs>
```

## Theming in Vite

### CSS Variables

shadcn uses CSS variables for theming. Edit `src/styles/globals.css` (or wherever your global styles are):

```css
/* Light theme (default) */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.6%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.6%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 3.6%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 84.2% 60.2%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 84.2% 60.2%;
  --radius: 0.5rem;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
  :root {
    --background: 0 0% 3.6%;
    --foreground: 0 0% 98.2%;
    --card: 0 0% 10.2%;
    --card-foreground: 0 0% 98.2%;
    --popover: 0 0% 10.2%;
    --popover-foreground: 0 0% 98.2%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 84.2% 60.2%;
    --accent-foreground: 0 0% 10.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 10.2%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 84.2% 60.2%;
  }
}
```

### Tailwind Config

shadcn components use these CSS variables in `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'calc(var(--radius) + 0.5rem)',
        md: 'calc(var(--radius) + 0.25rem)',
        sm: 'calc(var(--radius))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
```

## Customizing Components

### Approach 1: Modify the Copied File

shadcn components live in your codebase. You can modify them directly:

```tsx
// src/components/ui/button.tsx
import * as React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  // Add custom prop
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, ...props }, ref) => (
    <button
      className={cn(
        // ... styles
        isLoading && 'opacity-50 cursor-wait',
      )}
      disabled={isLoading}
      ref={ref}
      {...props}
    />
  )
)

export { Button }
```

### Approach 2: Create a Wrapper Component

Don't modify the original component; create a wrapper instead:

```tsx
// src/components/LoadingButton.tsx
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/Spinner';

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  isLoading?: boolean;
}

export function LoadingButton({ isLoading, children, ...props }: LoadingButtonProps) {
  return (
    <Button disabled={isLoading} {...props}>
      {isLoading && <Spinner className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  );
}
```

## Common Customizations

### Custom Button with Icon

```tsx
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Loading...' : 'Save'}
</Button>
```

### Form Field with Validation

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  label: string;
  error?: string;
  [key: string]: any;
}

export function FormField({ label, error, ...inputProps }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input {...inputProps} className={error ? 'border-red-500' : ''} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

### Responsive Card Grid

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map((item) => (
    <Card key={item.id}>
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent>{item.description}</CardContent>
    </Card>
  ))}
</div>
```

## Best Practices for Vite

### 1. Import Components at the Top Level

```tsx
// ✅ Correct
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function MyComponent() {
  return (
    <Card>
      <Button>Click</Button>
    </Card>
  );
}
```

### 2. Avoid Dynamic Imports of shadcn Components

```tsx
// ❌ Avoid
const Button = lazy(() => import('@/components/ui/button'));

// ✅ Better: Code-split at screen/page level, not component level
const HomePage = lazy(() => import('./HomePage'));
```

### 3. Use CSS Classes for Styling, Not Inline Styles

```tsx
// ❌ Avoid
<Button style={{ marginRight: '1rem', padding: '12px' }}>Click</Button>

// ✅ Better
<Button className="mr-4 px-3 py-2">Click</Button>
```

### 4. Group Related Components in Custom Files

```tsx
// src/components/UserCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{user.name}</CardTitle>
          <Badge>{user.role}</Badge>
        </div>
      </CardHeader>
      <CardContent>{user.bio}</CardContent>
    </Card>
  );
}
```

### 5. Use TypeScript for Props

```tsx
import { Button } from '@/components/ui/button';
import { FC } from 'react';

interface MyButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const MyButton: FC<MyButtonProps> = ({ label, onClick, disabled }) => (
  <Button onClick={onClick} disabled={disabled}>
    {label}
  </Button>
);
```

## Toast Notifications

shadcn provides a Toast system. Set it up once:

```tsx
// src/App.tsx
import { Toaster } from '@/components/ui/toaster';

export function App() {
  return (
    <>
      <Routes>{/* Your routes */}</Routes>
      <Toaster />
    </>
  );
}
```

Then use the `useToast` hook:

```tsx
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export function MyComponent() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: 'Success',
      description: 'Item saved successfully',
      duration: 3000,
    });
  };

  const handleError = () => {
    toast({
      title: 'Error',
      description: 'Failed to save item',
      variant: 'destructive',
      duration: 5000,
    });
  };

  return (
    <>
      <Button onClick={handleSuccess}>Show Success</Button>
      <Button onClick={handleError} variant="destructive">Show Error</Button>
    </>
  );
}
```

## When NOT to Use shadcn

- **Custom complex components** — create from scratch if shadcn doesn't have a close match
- **Heavy animations** — use Framer Motion or React Spring instead
- **Data visualization** — use Recharts, D3, or Apache ECharts
- **Large data tables** — use TanStack Table (react-table) with shadcn components for styling

## Vite-Specific Considerations

### CSS Module Support

Vite supports CSS modules. You can use them alongside Tailwind:

```tsx
// src/components/MyComponent.module.css
.wrapper {
  display: flex;
  gap: 1rem;
}

// src/components/MyComponent.tsx
import styles from './MyComponent.module.css';
import { Button } from '@/components/ui/button';

export function MyComponent() {
  return (
    <div className={styles.wrapper}>
      <Button>Click</Button>
    </div>
  );
}
```

### HMR (Hot Module Replacement)

Vite's HMR is fast. shadcn components will hot-reload during development without losing state.

### Build Performance

shadcn components are tree-shakeable. Unused components won't bloat your bundle.

## Summary

shadcn/ui provides:
- ✅ Beautiful, accessible components
- ✅ Full ownership (copy-paste, not npm imports)
- ✅ Tailwind + Radix UI foundation
- ✅ Easy customization
- ✅ No dependencies added to package.json

Use shadcn for all standard UI needs. Combine with custom components for domain-specific functionality.
