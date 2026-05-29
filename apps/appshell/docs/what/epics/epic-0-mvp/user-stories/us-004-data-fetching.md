# User Story: us-004 — Configurer data-fetching avec React Query + MSW

## Overview

Cette user story établit l'infrastructure complète de data-fetching pour AppShell : configuration d'une instance QueryClient singleton, création du hook `useUsers()` pour récupérer les utilisateurs, setup MSW (Mock Service Worker) avec activation limitée au mode développement, définition du handler `GET /api/users` et préparation des données mock avec au moins 2 utilisateurs.

## User Story Statement

**En tant que** développeur utilisant AppShell,  
**Je veux** une infrastructure data-fetching complète avec React Query et MSW,  
**Afin de** pouvoir faire des appels API en développement sans backend réel, et basculer automatiquement vers l'API réelle en production.

## Acceptance Criteria

### 1. QueryClient Singleton
- [ ] Fichier `src/lib/query-client.ts` créé
- [ ] Instance unique de `QueryClient` exportée
- [ ] Configuration des options par défaut :
  - `staleTime: 5 * 60 * 1000` (5 minutes)
  - `gcTime: 10 * 60 * 1000` (10 minutes)
  - `retry: 1` (une tentative en cas d'erreur)
  - `refetchOnWindowFocus: true`

### 2. Hook useUsers()
- [ ] Fichier `src/hooks/useUsers.ts` créé
- [ ] Hook exporte une fonction `useUsers()`
- [ ] Hook utilise `useQuery()` de React Query
- [ ] Clé de requête : `['users']`
- [ ] Endpoint : `GET /api/users`
- [ ] Validation des données avec Zod schema
- [ ] Retourne objet avec `{ data, isLoading, isError, error, refetch }`

### 3. MSW Worker Setup
- [ ] Fichier `src/mocks/browser.ts` créé
- [ ] `setupWorker()` initialisé avec handlers
- [ ] Worker peut être importé et démarré

### 4. MSW Handler GET /api/users
- [ ] Fichier `src/mocks/handlers.ts` créé (ou complété)
- [ ] Handler `http.get('/api/users', ...)` défini
- [ ] Handler retourne `HttpResponse.json(mockUsers)`
- [ ] Réponse match le schema Zod

### 5. Mock Data
- [ ] Fichier `src/mocks/data/users.ts` créé
- [ ] Export `mockUsers` avec au moins 2 utilisateurs
- [ ] Structure minimale : `{ id, name }`
- [ ] Exemple :
  ```typescript
  export const mockUsers = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
  ];
  ```

### 6. MSW Dev-Only Guard
- [ ] Fichier `src/main.tsx` contient guard `import.meta.env.DEV`
- [ ] MSW démarré uniquement en développement :
  ```typescript
  if (import.meta.env.DEV) {
    await worker.start({ onUnhandledRequest: 'warn' });
  }
  ```

### 7. HomeScreen Displays Data
- [ ] `src/screens/HomeScreen.tsx` appelle `useUsers()`
- [ ] Affiche spinner pendant le chargement
- [ ] Affiche liste d'utilisateurs en cartes (shadcn Card)
- [ ] Affiche message d'erreur si fetch échoue

### 8. No Console Errors
- [ ] MSW interception fonctionne en développement
- [ ] Pas d'erreurs dans la console lors du fetch
- [ ] Pas d'avertissements MSW sur requêtes non traitées

### 9. Schema & Types
- [ ] Fichier `src/lib/schemas/users.ts` créé
- [ ] Zod schema défini : `userSchema` et `usersSchema`
- [ ] Fichier `src/types/index.ts` contient type `User` (ou dérivé du schema)

## Scope of Work

### Files to Create / Modify
- **Créer** `src/lib/query-client.ts` — QueryClient singleton
- **Créer** `src/hooks/useUsers.ts` — Hook de data-fetching
- **Créer** `src/lib/schemas/users.ts` — Zod schema pour User
- **Créer** `src/types/index.ts` — Types TypeScript partagés
- **Créer** `src/mocks/browser.ts` — MSW setupWorker
- **Créer** `src/mocks/handlers.ts` — MSW request handlers
- **Créer** `src/mocks/data/users.ts` — Mock data
- **Modifier** `src/main.tsx` — Ajouter MSW start avec guard
- **Modifier** `src/screens/HomeScreen.tsx` — Intégrer `useUsers()` et afficher données
- **Modifier** `src/App.tsx` — Wrapper `<QueryClientProvider>` (si nécessaire)

### Out of Scope
- Implémentation des autres endpoints MSW (CRUD complet)
- Pagination ou filtrage des utilisateurs
- Authentification ou autorisation
- Sauvegarde locale (localStorage) des utilisateurs
- Mutations (`useMutation()`) — concernées par une autre user story

## Gherkin Acceptance Scenarios

### Scenario 1: MSW interception in dev mode
```gherkin
Given that the app is running in development mode
When the HomeScreen renders
Then MSW intercepts the GET /api/users request
And the response contains the mock user data
And no console errors appear
```

### Scenario 2: Data loading states
```gherkin
Given that HomeScreen is mounting
When useUsers() is called
Then a loading spinner is displayed initially
And once data is fetched, the spinner disappears
And a list of user cards is shown
```

### Scenario 3: MSW disabled in production
```gherkin
Given that the app is built for production (DEV=false)
When the app starts
Then MSW worker is NOT started
And requests go to the real API endpoint
```

### Scenario 4: Mock data structure
```gherkin
Given that mock users are defined in mocks/data/users.ts
When the GET /api/users handler is called
Then it returns an array of user objects
And each user has id and name properties
```

## Technical Details

### QueryClient Configuration
```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});
```

### useUsers Hook Pattern
```typescript
// src/hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { usersSchema } from '@/lib/schemas/users';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      return usersSchema.parse(data);
    },
  });
}
```

### MSW Handler Pattern
```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { mockUsers } from './data/users';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json(mockUsers);
  }),
];
```

### MSW Bootstrap Pattern
```typescript
// src/main.tsx — top level
if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'warn',
  });
}
```

### HomeScreen Integration Pattern
```typescript
// src/screens/HomeScreen.tsx
import { useUsers } from '@/hooks/useUsers';
import { Card } from '@/components/ui/card';

export function HomeScreen() {
  const { data: users, isLoading, isError, error } = useUsers();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div className="grid gap-4">
      {users?.map((user) => (
        <Card key={user.id} className="p-4">
          <p className="font-bold">{user.name}</p>
        </Card>
      ))}
    </div>
  );
}
```

## Success Metrics

1. **Build Success** — `npm run build` completes without errors
2. **Dev Server** — `npm run dev` starts; app renders at `http://localhost:5173`
3. **MSW Interception** — Network tab shows `/api/users` intercepted by MSW worker
4. **Data Display** — HomeScreen displays mock user list (at least 2 users)
5. **Loading State** — Spinner visible during fetch (may be brief with mock data)
6. **Console Clean** — No errors, warnings, or MSW unhandled request messages
7. **Type Safety** — `npm run build` shows no TypeScript errors
8. **Dev-Only MSW** — Verify `import.meta.env.DEV` guard prevents MSW in production builds

## Dependencies

- **@tanstack/react-query** (^5.x) — Server state management
- **msw** (^2.x) — Mock Service Worker
- **zod** (latest) — Schema validation
- **react** (^18.0.0) — React library
- **typescript** (latest) — Type checking

## Definition of Done

- [ ] All files created and committed
- [ ] Code passes ESLint checks (no warnings)
- [ ] TypeScript strict mode — no type errors
- [ ] Acceptance criteria all passing
- [ ] Gherkin scenarios validated
- [ ] No console errors or warnings
- [ ] Builds without errors (`npm run build`)
- [ ] Dev server runs without errors (`npm run dev`)
- [ ] HomeScreen properly displays mock user data
- [ ] Pull request approved by @leaddev

## Related Documents

- [Epic 0 — MVP](../epic.md) — Parent epic
- [Product Specification](../../product-spec.md) — Vision and constraints
- [Architecture](../../../../how/architecture.md) — Technical guidelines

## Notes

- Cette user story prépare l'infrastructure pour toutes les stories de data-fetching futures
- QueryClient singleton évite les instances dupliquées
- MSW dev-only guard garantit zéro impacte en production
- Mock data peut être étendue avec plus d'utilisateurs ou champs supplémentaires dans les stories futures
- La validation Zod garantit la correspondance schema API réelle vs. mock

## Story Points

**Estimate:** 8 points

**Rationale:** 
- Setup infrastructure (QueryClient, MSW) — 3 pts
- Hook + data fetching — 2 pts
- Mock data + handlers — 2 pts
- Integration + testing — 1 pt
