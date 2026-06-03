---
name: oneticket-ui-for-vite-react-primer
description: Aligner une SPA React + Primer sur les conventions visuelles GitHub (layout, panels, header, skins, dark/light) en réutilisant des primitives simples plutôt que patcher au cas par cas.
---

# React + Primer GitHub-style UI (local)

## Objectif

Fournir un mode opératoire **reproductible** pour :

- structurer une page React + `@primer/react` avec un layout proche de GitHub,
- utiliser des primitives de layout (`PageLayout`, `Panel`, `Stack`) + des tokens de spacing,
- intégrer un header type “app bar” avec icône GitHub (`@primer/octicons-react`),
- connecter le thème (skins + dark/light) exposé par la feature `theme`,
- garder une UI responsive propre sans multiplier les CSS ad hoc.

Ce skill complète :

- `local/architecture-for-vite-react-primer` (structure MVVM côté front),
- `bas/design-for-vite-react-primer` (patterns Primer/GitHub),
- `bagustris/style-for-vite-react-primer` (polish des UIs Primer),
- `anthropics/frontend-design` (direction esthétique).

Il est **spécifique au stack** React + Primer + GitHub-style.

## Pré-requis

- Projet frontend sous `frontend/` scaffoldé avec React + Vite + TypeScript.
- Déjà en place :
  - `@primer/react` installé,
  - `@tanstack/react-query` + MSW,
  - feature `theme` (skins + color mode) et les features métier du projet.
- Ajouter si nécessaire :
  - `@primer/octicons-react` (icônes GitHub),
  - un petit module de tokens de layout, par ex. `frontend/src/theme/tokens.ts`.

## Cible UI

- **Topbar** :
  - bandeau horizontal en haut avec :
    - à gauche : icône GitHub (`MarkGithubIcon`) + nom d’app,
    - à droite : switcher de skin + bouton dark/light.
- **Layout de page** :
  - `PageLayout` :
    - largeur max (~1200px),
    - centre la page (`margin-inline: auto`),
    - titre + sous-titre en haut,
    - contenu structuré via `Stack`.
- **Panels GitHub-like** :
  - `Panel` :
    - fond subtil (`var(--bg-subtle)`),
    - bordure `var(--border)`,
    - rayon (8px) + padding cohérent,
    - sert à encapsuler le contenu métier du projet.
- **Responsive** :
  - layout en colonne,
  - largeur max contrôlée par les tokens,
  - spacing géré via `Stack` + tokens plutôt que via des valeurs magiques.

## Process (à appliquer dans `frontend/`)

1. **Tokens de layout**
   - Créer `src/theme/tokens.ts` avec au minimum :
     - `layoutTokens.pageMaxWidth`,
     - `spacingTokens.sectionGap` / `cardGap`.

2. **Primitives de layout**
   - Créer `src/shared/components/Stack.tsx` :
     - simple wrapper `div` en `display: grid` avec prop `gap`.
   - Créer `src/shared/components/Panel.tsx` :
     - `div` stylé avec bordure, fond `var(--bg-subtle)`, rayon, padding.
   - Créer `src/shared/components/PageLayout.tsx` :
     - utilise `layoutTokens` + `Stack` pour :
       - centrer le contenu,
       - afficher titre + sous-titre,
       - contenir les panels métier.

3. **Header / topbar**
   - Dans `src/App.tsx` :
     - ajouter un `header` topbar :
       - bloc `brand` avec `MarkGithubIcon` + titre d’app,
       - bloc `topbar-actions` avec `ThemeSkinSwitcher`.
     - envelopper le contenu principal dans `PageLayout`.

4. **Feature pages**
   - Dans les pages features du projet :
      - remplacer la structure brute par des `Stack` et `Panel` selon les besoins métier.
      - laisser la logique (hooks, view-model, API) inchangée.

5. **Thème & skins**
   - S’appuyer sur la feature `theme` existante :
     - `useThemeSkin` pour `data-skin`,
     - `useColorMode` pour `data-color-mode`.
   - Dans `src/index.css` :
     - déclarer des variables `--bg`, `--bg-subtle`, `--border`, `--accent`, etc.
     - ajuster ces variables pour :
       - `:root` (clair par défaut),
       - `:root[data-color-mode='dark']`,
       - `:root[data-skin='ocean']`, `:root[data-skin='sunset']`, et leurs versions dark.

6. **Responsive & polish**
   - Vérifier que :
     - `.app-main` utilise le spacing défini,
     - les panels se stackent verticalement,
     - typographie et spacing sont lisibles sur mobile.
   - Utiliser les checklists de :
     - `bas/design-for-vite-react-primer` pour les choix de composants Primer,
     - `bagustris/style-for-vite-react-primer` pour les détails (variants, hiérarchie visuelle).

## Règles

- Ne pas introduire d’autre design system (pas de Tailwind, pas de MUI).
- Ne pas modifier la logique métier (hooks, modèles, API) via ce skill : uniquement la couche UI/layout.
- Préférer l’évolution des tokens / primitives partagées (PageLayout/Panel/Stack) plutôt que des patchs CSS dispersés.
- Après application du skill, exécuter systématiquement :
  - `cd frontend && npm run build`,
  - `cd frontend && npm run test:smoke`.

