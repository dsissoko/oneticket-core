# User Story US-001: Configurer la structure du squelette AppShell

## Résumé

Initialiser le squelette AppShell en créant les fichiers de configuration et la structure de répertoires minimale pour permettre un démarrage rapide d'un projet SPA.

## Cas d'usage

- **En tant que** développeur de frontend
- **Je veux** disposer de tous les fichiers de configuration (package.json, vite.config.ts, tsconfig.json, tailwind.config.ts, postcss.config.js, .env.example, vitest.config.ts, vitest.setup.ts)
- **afin que** je puisse construire une application SPA fonctionnelle sans configurations manuelles complexes

## Critères d'acceptation

### Scénario 1: Exécuter la commande build sans erreurs

- **Étant donné** que tous les fichiers de configuration sont en place
- **Et** que les dépendances npm sont installées
- **Quand** j'exécute `npm run build`
- **Alors** la construction complète sans erreurs ou avertissements
- **Et** un dossier `dist/` est généré avec les artefacts compilés

### Scénario 2: Structure complète du répertoire src/ est créée

- **Étant donné** que le projet est initialisé
- **Quand** j'inspecte la structure de répertoire
- **Alors** tous les répertoires suivants existent:
  - `src/`
  - `src/components/`
  - `src/components/ui/`
  - `src/screens/`
  - `src/hooks/`
  - `src/lib/`
  - `src/lib/schemas/`
  - `src/mocks/`
  - `src/mocks/data/`
  - `src/styles/`
  - `src/types/`
  - `public/`

### Scénario 3: Tous les fichiers de configuration sont présents et valides

- **Étant donné** que le projet est initialisé
- **Quand** je vérifie la présence des fichiers de configuration
- **Alors** les fichiers suivants existent:
  - `package.json` — valide et contient les dépendances requises
  - `vite.config.ts` — configuration Vite valide avec plugin React
  - `tsconfig.json` — configuration TypeScript en mode strict
  - `tailwind.config.ts` — configuration Tailwind complète
  - `postcss.config.js` — configuration PostCSS avec plugin Tailwind
  - `.env.example` — fichier de variables d'environnement d'exemple
  - `vitest.config.ts` — configuration Vitest pour les tests unitaires
  - `vitest.setup.ts` — fichier de configuration des tests globaux
  - `eslint.config.js` — configuration ESLint pour la qualité du code
  - `prettier.config.js` — configuration Prettier pour le formatage

### Scénario 4: npm run dev démarre sans erreurs

- **Étant donné** que le projet est initialisé et les dépendances installées
- **Quand** j'exécute `npm run dev`
- **Alors** le serveur de développement démarre sans erreurs
- **Et** l'application est accessible à `http://localhost:5173`

### Scénario 5: npm run test exécute le framework de test

- **Étant donné** que le projet est initialisé et les dépendances installées
- **Quand** j'exécute `npm run test`
- **Alors** Vitest se lance et peut exécuter les tests (même s'il n'y a pas encore de tests)

## Notes d'implémentation

- Tous les fichiers de configuration doivent suivre les conventions de nommage du projet
- Les variables d'environnement doivent être documentées dans `.env.example`
- La configuration TypeScript doit utiliser `strict: true`
- Vite doit être configuré avec le plugin React et le support du HMR
- Tailwind CSS doit être configuré pour supporter les modes clair et sombre
- Vitest doit être configuré avec jsdom comme environnement de test

## Dépendances

- Aucune dépendance sur d'autres user stories (tâche de base)

## Tâches liées

- Epic: epic-0-mvp — AppShell Complete Skeleton Setup
- Task: task/issue-797-D

---

**Fichier**: `us-001-skeleton-setup.md`
**Créé**: 2026-05-29
**État**: En cours de création
