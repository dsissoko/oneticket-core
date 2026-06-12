---
title: 'Sprint 1 — Auth0 Foundation'
---

# Sprint 1 — Auth0 Foundation

Integrate Auth0 authentication on the appshell scaffold — secure access, avatar dropdown, account page

This sprint establishes the authentication foundation for AppShell Auth0. Starting from the appshell template, we add Auth0 integration with a RequireAuth guard on all routes, an avatar dropdown in the header, and a placeholder /account page showing Auth0 user info. No business screens, no sidebar layout, no business MSW handlers.

## Cross-references
- Epic: [Epic 0 — MVP Breakout](epic-0-mvp/epic.md)
- US: [US-001 — Auth0 Integration](us-001-auth0-integration.md)

---

## Technical Notes

### 1. Starting Point: AppShell Template

This sprint begins from the appshell scaffold. Run `@leaddev init-appshell` before any implementation. The scaffold provides:
- Vite + React + TypeScript project structure
- React Router with basic route definitions
- `AppLayout` component with header
- Tailwind CSS + shadcn/ui base configuration
- Error boundary at root level

### 2. Auth0 Integration

#### 2.1 Dependency

Add `@auth0/auth0-react` to `package.json`:
```bash
npm install @auth0/auth0-react
```

#### 2.2 Environment Variables

Create `.env.example` at the project root:
```
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
```

These variables are consumed at build time by Vite via `import.meta.env`. No runtime `.env` is committed — each deployment environment provides its own values.

#### 2.3 Auth0Provider in `main.tsx`

Wrap the entire application with `Auth0Provider` in `main.tsx`:

```tsx
import { Auth0Provider } from '@auth0/auth0-react';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{ redirect_uri: window.location.origin }}
    cacheLocation="localstorage"
  >
    <App />
  </Auth0Provider>,
);
```

- `redirect_uri` must match the Allowed Callback URLs configured in the Auth0 dashboard.
- `cacheLocation: "localstorage"` persists the session across page refreshes without requiring a round-trip to Auth0 on every load.

### 3. RequireAuth Route Guard

Create `src/components/RequireAuth.tsx`:

```tsx
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useLocation } from 'react-router-dom';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>; // Replace with a proper spinner/skeleton
  }

  if (!isAuthenticated) {
    loginWithRedirect({ appState: { returnTo: location.pathname } });
    return null;
  }

  return <>{children}</>;
}
```

Wrap **all** application routes with `<RequireAuth>`:
```tsx
<Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
  {/* child routes */}
</Route>
```

### 4. Header Avatar & Dropdown

In the existing `AppLayout` header, add a shadcn `Avatar` component in the top-right corner:

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';

function UserMenu() {
  const { user, logout } = useAuth0();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={user?.picture} alt={user?.name} />
          <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/account">Mon compte</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

If shadcn `avatar` and `dropdown-menu` components are not yet installed, run:
```bash
npx shadcn@latest add avatar dropdown-menu
```

### 5. Account Page

Create `src/pages/AccountPage.tsx`:

```tsx
import { useAuth0 } from '@auth0/auth0-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AccountPage() {
  const { user } = useAuth0();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mon compte</h1>
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.picture} alt={user?.name} />
          <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}
```

Add the route under the protected layout:
```tsx
<Route path="account" element={<AccountPage />} />
```

### 6. Scope Boundaries — What Is NOT in This Sprint

The following are explicitly **excluded** from Sprint 1:
- **No zustand** — client state management is not needed yet.
- **No axios** — no backend API calls in this sprint.
- **No sonner** — no toast notifications needed.
- **No business MSW handlers** — only the Auth0 SDK is involved; no API mocking required.
- **No sidebar layout** — the AppLayout header is sufficient for this sprint.
- **No business screens** — only the `/account` placeholder page.

### 7. Component Boundaries

| File | Responsibility |
|---|---|
| `src/main.tsx` | Auth0Provider wrapping the entire app |
| `src/components/RequireAuth.tsx` | Route guard — checks `isAuthenticated`, triggers `loginWithRedirect()` |
| `src/components/AppLayout.tsx` | Existing layout — add `UserMenu` avatar in header (top-right) |
| `src/pages/AccountPage.tsx` | Displays Auth0 user profile (name, email, picture) |
| `.env.example` | Documents required environment variable placeholders |

### 8. Testing Considerations

- `RequireAuth` should be unit-tested with a mocked `useAuth0()` hook (via `@auth0/auth0-react` mock).
- The `/account` page should render user info when `useAuth0().user` is populated.
- No E2E tests for Auth0 login flow in this sprint — Auth0 Universal Login cannot be automated without test credentials.
