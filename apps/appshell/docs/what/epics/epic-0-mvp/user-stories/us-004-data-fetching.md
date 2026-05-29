# US-004 — Data Fetching Pattern

## Story

En tant qu'utilisateur, je veux voir des données (users list) via React Query + MSW afin de comprendre le pattern.

## Expected Behavior

- React Query est configuré avec un QueryClient et provider
- Un endpoint /api/users retourne une liste d'utilisateurs (mockée avec MSW)
- Un hook `useUsers()` encapsule la logique de fetch
- Les données sont affichées dans une page dédiée avec loading et error states
- MSW intercepte les appels API et retourne des données mockées
- Les mutations CRUD sont démontrées (createUser, updateUser, deleteUser)

## Acceptance Criteria

- [ ] QueryClient est créé et wrappé avec QueryClientProvider
- [ ] Endpoint /api/users est défini dans MSW avec handler GET
- [ ] Hook `useUsers()` utilise useQuery avec clé unique 'users'
- [ ] Hook `useUser(id)` est implémenté pour fetcher un utilisateur spécifique
- [ ] Hook `useProfile()` démontre une query authentifiée
- [ ] Mutation hooks existent : `useCreateUser()`, `useUpdateUser()`, `useDeleteUser()`
- [ ] Page /users affiche la liste avec loading spinner et error message
- [ ] MSW handlers pour GET, POST, PUT, DELETE sont implémentés
- [ ] Les données mockées contiennent des utilisateurs d'exemple réalistes

## Related Epic

[Epic 0 — AppShell MVP](epic-0-mvp/epic.md)

## Related Slices

<!-- @architect fills this section after producing slices -->
