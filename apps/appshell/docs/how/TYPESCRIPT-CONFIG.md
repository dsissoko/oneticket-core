# TypeScript Configuration Guide

## Overview

The `apps/appshell/app/tsconfig.json` file enforces strict type safety across the application. All TypeScript files must compile without errors in strict mode.

**Key principle:** "Strict by Default"
- No `any` types allowed without explicit justification
- All null/undefined possibilities must be handled
- Unused variables and parameters are errors

---

## Compiler Options Explained

### Target & Output

```json
{
  "target": "ES2020",           // Modern JavaScript target
  "module": "ESNext",           // ES module format
  "jsx": "react-jsx"            // React 17+ JSX runtime
}
```

**ES2020 Target:** Targets modern browsers (Chrome 80+, Firefox 75+, Safari 13.1+, Edge 80+). Excludes IE11 for cleaner, more maintainable code.

**jsx: "react-jsx":** No need to manually import React in every file; uses `react/jsx-runtime` automatically.

---

### Type Safety (Strict Mode)

These settings enforce strict type checking:

```json
{
  "strict": true,                        // Master flag for all strict checks
  "noImplicitAny": true,                 // Error on bare 'any' types
  "strictNullChecks": true,              // Null/undefined must be explicit
  "strictFunctionTypes": true,           // Strict function signature checking
  "strictBindCallApply": true,           // Strict .call/.apply checking
  "strictPropertyInitialization": true,  // Class properties must initialize
  "noImplicitThis": true,                // Explicit type for 'this'
  "noUnusedLocals": true,                // Error on unused variables
  "noUnusedParameters": true,            // Error on unused parameters
  "noImplicitReturns": true              // All code paths must return
}
```

#### Examples

**Bad (will not compile):**
```typescript
// Missing type annotation
function add(a, b) { return a + b; }  // ❌ Error: noImplicitAny

// Missing null check
const user: User = userData;  // ❌ Error: could be null
console.log(user.name);

// Unused variable
const unused = 42;  // ❌ Error: noUnusedLocals
```

**Good (compiles):**
```typescript
// Explicit types
function add(a: number, b: number): number { return a + b; }

// Null-safe
const user: User | null = userData;
if (user) {
  console.log(user.name);
}

// Used or prefixed with _
const unused = 42;  // Still error!
const _unused = 42; // OK: signals intentionally unused
```

---

### Module Resolution

```json
{
  "moduleResolution": "bundler",        // Modern bundler (Vite, Webpack, Esbuild)
  "resolveJsonModule": true,            // Allow import JSON files
  "allowImportingTsExtensions": true    // Allow .ts/.tsx imports (monorepos)
}
```

**"bundler":** Understands package.json "exports" field, modern module formats.

**resolveJsonModule:** Enables `import pkg from './package.json'`

---

### Interoperability

```json
{
  "esModuleInterop": true,              // CommonJS/ESM compatibility
  "allowSyntheticDefaultImports": true, // Default imports from non-default exports
  "skipLibCheck": true                  // Don't type-check node_modules
}
```

These settings allow libraries and code using older CommonJS patterns to work with modern ESM imports.

---

### Build Settings

```json
{
  "noEmit": true,                // Don't emit .js files (Vite handles that)
  "isolatedModules": true,       // Each file transpiles independently
  "useDefineForClassFields": true // Standard class field syntax
}
```

**noEmit:** TypeScript only type-checks; Vite handles bundling and transpilation.

**isolatedModules:** Ensures TypeScript can transpile files independently (better for monorepos).

---

### Include/References

```json
{
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**include:** All `.ts` and `.tsx` files in the `src/` directory are type-checked.

**references:** `tsconfig.node.json` handles build configuration files (vite.config.ts, tailwind.config.ts, etc.) separately, keeping app types distinct from build types.

---

## Best Practices

### 1. Avoid Broad `any` Types

Instead of:
```typescript
const data: any = response.json();
```

Use:
```typescript
const data: GetDataResponse = response.json();
// Or
const data = response.json() as GetDataResponse;
```

### 2. Handle Null/Undefined Explicitly

Instead of:
```typescript
const user: User = fetchUser();  // What if null?
console.log(user.name);
```

Use:
```typescript
const user: User | null = fetchUser();
if (user) {
  console.log(user.name);
}
```

### 3. Type Function Parameters and Returns

Instead of:
```typescript
function getUserName(user) {  // Implicit any
  return user.name;           // Could be anything
}
```

Use:
```typescript
function getUserName(user: User): string {
  return user.name;
}
```

### 4. Mark Intentionally Unused Variables

Instead of leaving `noUnusedLocals` errors:
```typescript
// Bad: error or disabled lint
const value = importantFunction();

// Good: prefix with _ to signal intent
const _value = importantFunction();  // I'm deliberately not using this
```

---

## Strict Mode in Practice

### Type Inference

TypeScript infers types when possible:

```typescript
// ✅ OK: TypeScript infers number
const count = 42;
count = "42";  // ❌ Error: cannot assign string to number

// ✅ OK: TypeScript infers string
const name = "Alice";
name = null;  // ❌ Error: cannot assign null to string

// Need explicit type if nullable:
const maybeEmail: string | null = fetchEmail();
```

### React Component Types

```typescript
// Component props
interface CardProps {
  title: string;
  isOpen?: boolean;  // Optional boolean
  onClick?: (e: React.MouseEvent) => void;  // Optional handler
}

// ✅ OK
function Card({ title, isOpen = false, onClick }: CardProps) {
  return <div onClick={onClick}>{title}</div>;
}

// ❌ Error if we don't provide 'title'
<Card />

// ✅ OK
<Card title="My Card" isOpen />
```

### Async/Await

```typescript
// ✅ OK: explicit return type
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// ❌ Error: no implicit any
async function fetchUser(id) {  // id has implicit any
  // ...
}
```

---

## Debugging TypeScript Errors

### Error: "Object is possibly 'undefined'"

**Cause:** Variable could be null/undefined but code assumes it's not.

**Fix:**
```typescript
// ❌ Error
const user: User | undefined = getUser();
console.log(user.name);  // Error: user could be undefined

// ✅ Fix 1: Check before use
if (user) {
  console.log(user.name);
}

// ✅ Fix 2: Use optional chaining
console.log(user?.name);

// ✅ Fix 3: Assert non-null (use sparingly)
console.log(user!.name);  // I'm certain it's not undefined
```

### Error: "Type '...' is not assignable to type '...'"

**Cause:** You're trying to assign a value of one type to a variable of another.

**Fix:**
```typescript
// ❌ Error
const count: number = "42";

// ✅ Fix: Convert the value
const count: number = parseInt("42", 10);

// ✅ Fix: Change the type
const count: string = "42";
```

### Error: "Parameter implicitly has type 'any'"

**Cause:** Function parameter is missing a type annotation.

**Fix:**
```typescript
// ❌ Error
const handleClick = (e) => {
  console.log(e.target.value);  // e has implicit any
};

// ✅ Fix: Add explicit type
const handleClick = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};
```

---

## Disabling Strict Checks (Rarely)

Sometimes you need to bypass strict mode temporarily. Use `@ts-ignore` or `@ts-expect-error`:

```typescript
// @ts-expect-error: Temporarily allow 'any' type
const data: any = unknownValue;

// @ts-ignore: Skip next line type checking
const broken = doSomethingWeird();
```

**Rule:** Use sparingly, and add a comment explaining why. Preferably, refactor to avoid the need.

---

## Related Documentation

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [React TypeScript Handbook](https://react-typescript-cheatsheet.netlify.app/)

