---
name: oneticket-react-best-practices
description: "React optimization rules — 70 rules across 8 categories, prioritized by impact. From Vercel Engineering."
version: "1.0.0"
source: external
source_url: https://github.com/vercel-labs/agent-skills
source_skill: react-best-practices
install_native: npx skills add vercel-labs/agent-skills --skill react-best-practices
---

# Skill: oneticket-react-best-practices

## Overview

This skill aggregates React and Next.js optimization patterns from Vercel Engineering. It covers:

- **Component Architecture** — when to use composition, when to split components
- **Rendering Performance** — memoization, lazy loading, code splitting
- **Data Fetching** — caching strategies, request deduplication, prefetching
- **State Management** — when to use Context, Redux, Zustand; how to avoid unnecessary re-renders
- **Bundle Optimization** — tree-shaking, dynamic imports, package size awareness
- **Hooks Best Practices** — custom hooks, dependency arrays, cleanup
- **Server vs. Client** — when to use Server Components, when Client Components are necessary
- **Monitoring and Debugging** — performance metrics, error tracking, developer tools

## Core Principles

1. **Measure first** — profile before optimizing; use DevTools and Web Vitals
2. **Lazy load aggressively** — code-split by route, load images on-demand
3. **Memoize selectively** — use `React.memo()` only for expensive components
4. **Minimize re-renders** — understand dependency arrays, use `useDeferredValue`
5. **Cache data** — use React Query, SWR, or similar for automatic deduplication
6. **Avoid client-side bundle bloat** — move logic to server, tree-shake aggressively
7. **Prioritize user-perceived performance** — fast first paint > perfect time-to-interactive

## 70 Rules by Category

### 1. Component Architecture (10 rules)

#### Rule 1.1: Split Components at Boundaries
- A component that manages state should not render deeply nested children
- Extract state-heavy logic into a separate component; pass data down as props
- Enables child components to memoize and skip re-renders

#### Rule 1.2: Use Composition Over Inheritance
- React uses composition via props and children
- Never extend component classes; instead, wrap and pass data via props

#### Rule 1.3: Keep Components Small
- A component should fit on one screen (< 300 lines)
- Each component should have a single clear responsibility
- Easier to test, memoize, and reason about

#### Rule 1.4: Avoid Conditional Rendering in JSX
- Move conditional logic outside JSX for clarity
```tsx
// ❌ Hard to read
{loading ? <Skeleton /> : error ? <Error /> : <Content data={data} />}

// ✅ Clearer
if (loading) return <Skeleton />;
if (error) return <Error />;
return <Content data={data} />;
```

#### Rule 1.5: Use Render Props or Higher-Order Components Sparingly
- Modern hooks are preferred
- Use render props only when composing multiple callback-based effects

#### Rule 1.6: Avoid Prop Drilling
- Pass data only to direct children
- Use Context or a state management library for deeply nested data
- Re-creating context objects unnecessarily causes re-renders

#### Rule 1.7: Separate UI from Business Logic
- Create a view component that renders UI
- Create a hook that manages data and state
- Keep components focused on presentation

#### Rule 1.8: Use TypeScript Strictly
- Enforce strict null checks and strict mode
- Avoid `any`; use explicit types and generics
- Catches errors at compile time, not runtime

#### Rule 1.9: Avoid Default Props
- Modern JavaScript destructuring with defaults is clearer
```tsx
// ❌
function Button({ label = 'Click me', disabled = false }) { }
Button.defaultProps = { label: 'Click me', disabled: false };

// ✅
function Button({ label = 'Click me', disabled = false }: ButtonProps) { }
```

#### Rule 1.10: Export Components Near Their Definition
- Do not create "index" files that re-export many components
- Import directly from the component file to avoid circular dependencies

### 2. Rendering Performance (15 rules)

#### Rule 2.1: Memoize Expensive Components Strategically
- Use `React.memo()` only for components with expensive renders
- Memoization itself has overhead; measure before applying
```tsx
const ExpensiveList = React.memo(({ items }: { items: Item[] }) => {
  // Only re-renders if items reference changes
});
```

#### Rule 2.2: Memoize Callback Dependencies
- Use `useCallback()` when passing callbacks to memoized children
- Without it, children re-render because the callback reference changes
```tsx
const handleClick = useCallback(() => {
  dispatch(someAction());
}, [dispatch]);
```

#### Rule 2.3: Memoize Derived Data
- Use `useMemo()` for expensive computations and derived state
- Avoid recalculating on every render
```tsx
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

#### Rule 2.4: Lazy Load Components with Code Splitting
- Use `React.lazy()` with `Suspense` for route-based code splitting
```tsx
const Dashboard = React.lazy(() => import('./Dashboard'));

<Suspense fallback={<Spinner />}>
  <Dashboard />
</Suspense>
```

#### Rule 2.5: Lazy Load Images with `loading="lazy"`
- Use native browser lazy loading for images below the fold
- Combine with `Intersection Observer` for custom logic
```tsx
<img src="..." loading="lazy" />
```

#### Rule 2.6: Virtualize Long Lists
- Use libraries like `react-window` for lists with 100+ items
- Only render visible items; unmount off-screen items
- Dramatically improves scroll performance

#### Rule 2.7: Avoid Uncontrolled Components in Performance-Critical Code
- Uncontrolled components bypass React's optimization checks
- Use controlled components with proper state management

#### Rule 2.8: Use `useTransition()` for Non-Blocking State Updates
- Prioritize interactive updates (clicks, typing) over data updates
- Defer expensive updates; user sees instant feedback
```tsx
const [isPending, startTransition] = useTransition();
const handleFilter = (filter) => {
  startTransition(() => {
    setFilter(filter); // Low priority
  });
};
```

#### Rule 2.9: Use `useDeferredValue()` for Debouncing
- Automatically defer updates to a value
- Useful for search inputs + filtered lists
```tsx
const deferredSearchTerm = useDeferredValue(searchTerm);
const results = useMemo(() => {
  return filterItems(items, deferredSearchTerm);
}, [items, deferredSearchTerm]);
```

#### Rule 2.10: Split State by Update Frequency
- Move state that updates often to a separate component
- Keeps stable state in parent; fast state in child
- Prevents parent re-renders from triggering child re-renders

#### Rule 2.11: Use `key` Correctly in Lists
- Use stable, unique identifiers (not array index)
- Helps React identify which items have changed
```tsx
// ❌ Bad
{items.map((item, index) => <Item key={index} {...item} />)}

// ✅ Good
{items.map((item) => <Item key={item.id} {...item} />)}
```

#### Rule 2.12: Avoid Creating Objects/Arrays in Render
- Creating new objects/arrays in render breaks memoization
```tsx
// ❌ New object every render
<Child style={{ color: 'red' }} />

// ✅ Stable reference
const style = useMemo(() => ({ color: 'red' }), []);
<Child style={style} />
```

#### Rule 2.13: Use the Right Data Structure
- Arrays for lists; Objects for keyed data
- Consider immutable data structures for frequent updates
- HashMaps for fast lookups

#### Rule 2.14: Batch State Updates
- React 18+ automatically batches updates in event handlers
- Use `flushSync()` sparingly only when order matters
```tsx
const handleChange = (e) => {
  setField1(e.target.value);
  setField2(computeValue(e.target.value));
  // React batches both into one re-render
};
```

#### Rule 2.15: Profile with DevTools
- Use React DevTools Profiler to measure component render times
- Identify bottlenecks; focus optimization efforts there

### 3. Data Fetching (10 rules)

#### Rule 3.1: Use React Query (or SWR) for Data Fetching
- Automatic caching, deduplication, and garbage collection
- Handles loading, error, and success states
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => fetch('/api/users').then(r => r.json()),
});
```

#### Rule 3.2: Deduplicate Requests Automatically
- React Query merges identical concurrent requests into one
- No manual request deduplication needed
- Saves bandwidth and server load

#### Rule 3.3: Prefetch Data on Route Change or Hover
- Load data before the user needs it
```tsx
queryClient.prefetchQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});
```

#### Rule 3.4: Invalidate Cache Strategically
- After mutations, invalidate related queries to refetch
```tsx
mutationFn: async (newData) => {
  await updateUser(newData);
  await queryClient.invalidateQueries({ queryKey: ['users'] });
},
```

#### Rule 3.5: Use Pagination for Large Datasets
- Load data in chunks (limit/offset or cursor-based)
- Reduces initial load time and memory usage
- React Query handles caching per page

#### Rule 3.6: Use Infinite Queries for Scrolling
- React Query's `useInfiniteQuery()` for "load more" patterns
- Seamlessly appends data as user scrolls
```tsx
const { data, hasNextPage, fetchNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

#### Rule 3.7: Avoid Fetching in Render
- Fetch in effects or query hooks only
- Never fetch during component render
```tsx
// ❌ WRONG — fetches every render
function MyComponent() {
  const data = fetch('/api/data').then(r => r.json());
}

// ✅ CORRECT — fetches once
function MyComponent() {
  const { data } = useQuery({ queryKey: ['data'], queryFn: ... });
}
```

#### Rule 3.8: Cache Strategically Based on Freshness
- Set appropriate `staleTime` and `gcTime` in React Query
- Fresh data = no refetch on mount; Stale data = background refetch
```tsx
useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 10,   // 10 minutes
});
```

#### Rule 3.9: Use Optimistic Updates for UX
- Update UI before server confirms
- Revert if mutation fails
```tsx
const { mutate } = useMutation({
  mutationFn: updateItem,
  onMutate: async (newData) => {
    queryClient.setQueryData(['items'], old => [...old, newData]);
  },
  onError: () => {
    queryClient.invalidateQueries({ queryKey: ['items'] });
  },
});
```

#### Rule 3.10: Parallel vs. Sequential Data Fetching
- Use `Promise.all()` for independent data
- Use sequential fetching only when one query depends on another
```tsx
// Parallel
Promise.all([fetchUsers(), fetchPosts()])

// Sequential
const userId = await fetchUserId();
const userData = await fetchUser(userId);
```

### 4. State Management (8 rules)

#### Rule 4.1: Keep State as Local as Possible
- State near the component that uses it
- Promotes component reusability and testability
- Only lift state when multiple components need it

#### Rule 4.2: Use Context Only for Rarely-Changing Values
- Context is not a state management library
- Re-creating context value objects causes re-renders
- Best for auth, theme, or language settings
```tsx
// ❌ Bad — context recreated every render
<ThemeContext.Provider value={{ theme, setTheme }}>
  ...
</ThemeContext.Provider>

// ✅ Better — stable value
const [theme, setTheme] = useState('light');
const value = useMemo(() => ({ theme, setTheme }), [theme]);
<ThemeContext.Provider value={value}>
  ...
</ThemeContext.Provider>
```

#### Rule 4.3: Use Zustand for Simple Global State
- Lightweight, no provider boilerplate
- Automatic optimization; components only re-render when their specific slice changes
```tsx
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

const count = useStore((state) => state.count); // Only re-renders on count change
```

#### Rule 4.4: Use Redux for Complex, Normalized State
- Redux DevTools for debugging time-travel
- Middleware support for async logic
- Larger bundle; use only when needed

#### Rule 4.5: Avoid Redux Anti-Patterns
- Do not store derived data in Redux
- Do not store data that can be derived from other state
- Normalize state shape; avoid deep nesting

#### Rule 4.6: Use Selectors to Derive Data
- Memoize selectors to prevent unnecessary re-renders
```tsx
const selectUser = (state) => state.user;
const selectUserName = (state) => state.user.name;
const userNameMemoized = useSelector(
  (state) => state.user.name,
  (a, b) => a === b
);
```

#### Rule 4.7: Combine useState and useRef Appropriately
- `useState` for values that trigger renders
- `useRef` for values that don't trigger renders and need persistence
```tsx
const [count, setCount] = useState(0); // Triggers re-render
const renderCount = useRef(0); // Doesn't trigger re-render
```

#### Rule 4.8: Use useReducer for Complex State Logic
- When `useState` becomes unwieldy
- Centralizes state update logic
```tsx
const [state, dispatch] = useReducer(reducer, initialState);
dispatch({ type: 'INCREMENT', payload: 5 });
```

### 5. Bundle Optimization (8 rules)

#### Rule 5.1: Audit Bundle Size Regularly
- Use tools like `webpack-bundle-analyzer`, `bundle-buddy`, or `esbuild` visualizer
- Monitor bundle size in CI/CD
- Set size budgets for main and async bundles

#### Rule 5.2: Code-Split by Route
- Lazy load route components with `React.lazy()`
- Each route gets its own chunk; loads on-demand
```tsx
const routes = [
  { path: '/', element: <Home /> },
  { path: '/about', element: React.lazy(() => import('./About')) },
];
```

#### Rule 5.3: Tree-Shake Unused Code
- Ensure `package.json` has `"sideEffects": false` or list side effects
- Bundler removes dead code
- Avoid default exports for libraries; use named exports

#### Rule 5.4: Avoid Large Monolithic Vendor Bundles
- Split vendor code; load only what's needed
- Modern bundlers (Vite, esbuild) do this automatically

#### Rule 5.5: Use Dynamic Imports for Heavy Libraries
- Load libraries only when needed
```tsx
const Editor = lazy(() => import('react-quill'));
const csv = await import('papaparse');
```

#### Rule 5.6: Minimize CSS Bundle
- Use Tailwind CSS or other utility-first frameworks
- Remove unused CSS with `PurgeCSS` or Tailwind's built-in optimization
- Avoid large CSS frameworks; prefer component-scoped styles

#### Rule 5.7: Compress Assets and Serve Modern Formats
- Use GZIP or Brotli compression
- Serve WebP images; fallback to JPEG/PNG
- Minify JavaScript and CSS in production

#### Rule 5.8: Monitor and Limit Third-Party Script Impact
- Third-party scripts (analytics, ads) can block rendering
- Load asynchronously with `async` or `defer`
- Use Web Workers for heavy computation off main thread

### 6. Hooks Best Practices (10 rules)

#### Rule 6.1: Understand the Dependency Array
- Dependencies determine when effect runs
- Missing dependencies = stale closures; extra dependencies = unnecessary runs
```tsx
useEffect(() => {
  // Runs only once on mount
}, []);

useEffect(() => {
  // Runs when count changes
}, [count]);
```

#### Rule 6.2: Use ESLint Plugin `exhaustive-deps`
- Enforces dependency array correctness
- Install: `eslint-plugin-react-hooks`
```js
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

#### Rule 6.3: Avoid Stale Closures
- Ensure all values used in effects are in the dependency array
```tsx
// ❌ Stale closure — count is captured once
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1); // Always increments from initial count
  }, 1000);
}, []); // Missing count

// ✅ Correct
useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
}, []);
```

#### Rule 6.4: Clean Up Side Effects
- Always clean up subscriptions, timers, event listeners
```tsx
useEffect(() => {
  const subscription = data$.subscribe(...);
  return () => subscription.unsubscribe();
}, [data$]);
```

#### Rule 6.5: Return Early from Effects
- If dependencies don't require the effect, don't run it
```tsx
useEffect(() => {
  if (!userId) return; // Skip if no userId
  const subscription = subscribeToUser(userId);
  return () => subscription.unsubscribe();
}, [userId]);
```

#### Rule 6.6: Extract Custom Hooks for Reusability
- Move complex logic into a hook
- Easier to test and reuse across components
```tsx
function useFormState(initialData) {
  const [data, setData] = useState(initialData);
  const handleChange = useCallback((e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);
  return [data, handleChange];
}
```

#### Rule 6.7: Avoid Creating Custom Hooks Unnecessarily
- A single `useEffect` is fine; don't extract into a hook for tiny logic
- Extract when logic is reused or testability requires it

#### Rule 6.8: Use useCallback Sparingly
- Overhead of `useCallback` can exceed benefit of memoization
- Use only when passing callback to memoized child
```tsx
// ❌ Unnecessary
const handleClick = useCallback(() => { count++; }, []);
<div onClick={handleClick} />

// ✅ Necessary
const memoChild = React.memo(({ onClick }) => <Child onClick={onClick} />);
const handleClick = useCallback(() => { count++; }, []);
<MemoChild onClick={handleClick} />
```

#### Rule 6.9: Use useReducer for Multi-Step State
- Centralizes related state updates
- Easier to test than multiple `useState` calls

#### Rule 6.10: Profile Hook Performance
- Use React DevTools to see which hooks cause re-renders
- Identify and memoize expensive dependencies

### 7. Server vs. Client Components (7 rules) — Next.js Specific

#### Rule 7.1: Use Server Components by Default
- Server Components reduce JavaScript shipped to browser
- Great for fetching data, accessing databases, storing secrets
```tsx
// app/page.tsx (Server Component by default in Next.js 13+)
export default async function Home() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

#### Rule 7.2: Mark Client Components Explicitly
- Use `'use client'` directive only for interactive components
```tsx
'use client';
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

#### Rule 7.3: Fetch Data in Server Components
- Fetch data in Server Components; pass via props to Client Components
- Reduces client bundle; secrets stay on server
```tsx
// Server
async function ServerComponent() {
  const data = await fetch('...');
  return <ClientComponent data={data} />;
}

// Client
'use client';
function ClientComponent({ data }) {
  return <div>{data}</div>;
}
```

#### Rule 7.4: Avoid Passing Large Objects to Client Components
- Serialization overhead
- Pass only necessary data
- Move computation to server if possible

#### Rule 7.5: Use Dynamic Imports for Client Components
- Load client-only libraries dynamically
```tsx
import dynamic from 'next/dynamic';
const DynamicChart = dynamic(() => import('./Chart'), { ssr: false });
```

#### Rule 7.6: Stream HTML with Suspense
- Use `<Suspense>` boundaries to stream HTML progressively
- User sees content faster; background tasks fetch data
```tsx
export default function Home() {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}
```

#### Rule 7.7: Parallelize Data Fetching
- Fetch independent data in parallel, not sequentially
- Use `Promise.all()` in Server Components

### 8. Monitoring and Debugging (4 rules)

#### Rule 8.1: Monitor Web Vitals
- Track Core Web Vitals (LCP, FID, CLS, TTFB)
- Use `next/analytics` or third-party tools (Sentry, LogRocket)
```tsx
import { reportWebVitals } from 'next/analytics';
reportWebVitals((metric) => {
  console.log(metric);
});
```

#### Rule 8.2: Use React DevTools Profiler
- Measure component render times
- Identify bottlenecks
- Flamegraph shows render hierarchy

#### Rule 8.3: Use Error Boundaries
- Catch React errors and display fallback UI
- Prevents white-screen crashes
```tsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    logErrorToService(error, info);
  }
  render() {
    if (this.state.hasError) return <div>Error occurred</div>;
    return this.props.children;
  }
}
```

#### Rule 8.4: Log Performance Metrics
- Use `performance` API to measure custom metrics
- Send to monitoring service
```tsx
const startTime = performance.now();
// ... do work
const duration = performance.now() - startTime;
console.log(`Operation took ${duration}ms`);
```

## Summary

These 70 rules prioritize **measurable performance gains** and **sustainable code quality**. Focus on:

1. **Profiling first** — identify bottlenecks before optimizing
2. **Lazy loading** — code-split aggressively
3. **Memoization** — use strategically, not everywhere
4. **Data fetching** — use React Query or SWR
5. **State management** — keep it local; use Zustand for global state
6. **Bundle size** — monitor and set budgets
7. **Error handling** — catch errors; monitor in production
8. **Server-side rendering** — offload computation when possible

For more details and interactive examples, visit the Vercel Engineering blog or the React documentation.
