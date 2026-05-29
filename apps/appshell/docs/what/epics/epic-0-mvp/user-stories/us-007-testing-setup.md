# US-007 — Configurer infrastructure de test (Vitest + Testing Library + jsdom)

## Story

En tant que développeur d'une app AppShell, je souhaite avoir une infrastructure de test fonctionnelle et complète afin de pouvoir écrire et exécuter des tests unitaires et d'intégration pour les composants React, les hooks et les screens sans configuration supplémentaire.

## Expected Behavior

Après complétion de cette user story, l'infrastructure de test doit être entièrement configurée et opérationnelle :

1. **Vitest Configuration** (`vitest.config.ts`) :
   - Environnement jsdom configuré pour simuler le navigateur
   - Test runner prêt pour les tests React
   - Fichier setup automatiquement exécuté avant les tests

2. **Test Setup File** (`vitest.setup.ts`) :
   - Intégration de Testing Library globals (screen, render, waitFor, etc.)
   - Configuration jsdom si nécessaire
   - Supports pour les assertions courantes

3. **Example Test** (`src/screens/__tests__/HomeScreen.test.tsx`) :
   - Teste le rendu de HomeScreen
   - Valide l'intégration avec React Query et MSW
   - Démontre le pattern recommandé pour les tests de composants

4. **Exécution** :
   - `npm run test` exécute tous les tests sans erreurs
   - Testing Library est importable directement
   - jsdom environment fonctionne correctement pour les tests DOM

## Acceptance Criteria

```gherkin
Scénario: Configuration Vitest complète
  Étant donné que je suis développeur dans AppShell
  Quand j'exécute npm run test
  Alors les tests se lancent avec succès
  Et jsdom environnement est actif
  Et Testing Library utilities sont disponibles

Scénario: Testing Library importable
  Étant donné que je suis dans un fichier test
  Quand j'importe les utilities de @testing-library/react
  Alors l'import réussit sans erreur
  Et render, screen, waitFor, etc. sont utilisables

Scénario: Exemple de test HomeScreen
  Étant donné que HomeScreen.test.tsx existe
  Quand le test s'exécute
  Alors il teste le rendu du composant
  Et il valide l'intégration avec useUsers()
  Et il démontre le pattern recommandé

Scénario: npm run test passe sans erreurs
  Étant donné que tous les fichiers de test sont en place
  Quand j'exécute npm run test
  Alors tous les tests passent
  Et le code de sortie est 0
  Et aucune erreur jsdom n'est signalée
```

## Technical Details

### Fichiers à créer ou modifier

1. **`vitest.config.ts`** (nouveau ou modifié)
   - Définir environnement jsdom
   - Configurer setupFiles pour `vitest.setup.ts`
   - Configurer test globals (optionnel mais recommandé)

2. **`vitest.setup.ts`** (nouveau)
   - Import @testing-library/react avec expect extend
   - Configuration jsdom globale si nécessaire
   - Exports pour les utilities courantes

3. **`src/screens/__tests__/HomeScreen.test.tsx`** (nouveau)
   - Test d'exemple pour HomeScreen
   - Utilise render de Testing Library
   - Valide le rendu du composant
   - Exemple d'assertion basique

### Dependencies requises

- `vitest` (test runner)
- `@testing-library/react` (React testing utilities)
- `@testing-library/dom` (DOM utilities)
- `jsdom` (DOM simulator)
- `@vitest/ui` (optionnel, interface de test)

### Critères de succès techniques

- ✓ `npm run test` exécute sans erreurs
- ✓ Testing Library importable dans les fichiers test
- ✓ jsdom environment actif pour les tests DOM
- ✓ Au minimum un test example fonctionne
- ✓ Aucune warning ou erreur jsdom non gérées

## Related Epic

[Epic: epic-0-mvp — AppShell Complete Skeleton Setup](../epic.md)

Partie du système de skeleton AppShell pour assurer la qualité de code et la testabilité.

## Related Slices

Aucune slice définie à ce stade.
