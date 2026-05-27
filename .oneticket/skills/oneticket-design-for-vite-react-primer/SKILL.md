# skills/bas/primer-design/SKILL.md

## Objective

Help the agent design and implement **frontend interfaces that use GitHub’s Primer design system** (and `@primer/react`) in a way that is consistent, simple and production‑grade.

This skill complements:
- `local/react-primer-feature-architecture` (structure, MVVM),
- `anthropics/frontend-design` (direction artistique),
by répondant à la question “comment j’écris concrètement du React + Primer propre ?”.

---

## Scope

- Target stack: React + `@primer/react`
- Concerns:
  - choix des composants Primer (Button, TextInput, Textarea, Label, Spinner, ThemeProvider, etc.),
  - patterns d’interface simples (formulaires, listes, panneaux, headers),
  - mapping des états métier vers des composants/variants Primer (par exemple Labels de statut).
- Hors scope:
  - logique métier (couverte par les modèles / hooks),
  - architecture globale (couverte par `react-primer-feature-architecture`).

---

## Primer UI Principles (for this template)

1. **HTML for layout, Primer for controls**
   - Layout général (grille, sections, wrappers) → HTML + CSS du projet (`index.css`, `App.css`).
   - Contrôles interactifs (boutons, inputs, textarea, badges de statut, spinners) → composants `@primer/react`.

2. **Limiter la surface Primer**
   - Se concentrer sur un petit set de composants maîtrisés :
     - `Button` pour les actions,
     - `TextInput` / `Textarea` pour les champs,
     - `Label` ou `StateLabel` pour les statuts,
     - `Spinner` pour les états de chargement,
     - `ThemeProvider` pour le mode clair/sombre.

3. **Props réalistes**
   - Utiliser exclusivement les variants réellement supportés par la version installée d’`@primer/react`
     (par exemple `default | primary | invisible | danger | link` pour `Button`).
   - Éviter d’inventer des props (par ex. `fontSize`, `mt`, `outline`, etc.) sur les composants Primer
     si elles ne sont pas présentes dans leurs définitions TypeScript.

4. **Prévoir l’accessibilité de base**
   - Associer les labels et champs (labels explicites, `aria-label` quand nécessaire).
   - Utiliser les composants Primer pour les boutons, liens, spinners, de façon à bénéficier de leur comportement accessible par défaut.

---

## Recommended UI Patterns

### 1. Simple form (create / edit)

- Layout :
  - wrapper de formulaire = `<form>` + classes CSS du projet,
  - sections alignées verticalement avec des marges cohérentes.
- Champs :
  - chaque champ = `<label>` contenant un titre (texte) et un `TextInput` / `Textarea` Primer,
  - bouton de soumission = `Button` Primer avec `variant="primary"`.

### 2. Listes d’éléments (ex: todos)

- La liste elle-même reste un `<ul>` / `<li>` stylé via CSS.
- Pour les états métier :
  - utiliser `Label` ou `StateLabel` avec des variants mappées au domaine (ex: `todo` → `attention`, `done` → `success`),
  - garder la typographie (titre, détail) en HTML + CSS, sans forcer Primer sur tout.
- Les actions (supprimer, changer d’état, export) passent par des `Button` Primer.

---

## Process for the Agent

1. **Inspect Primer types before using a component**
   - lire `node_modules/@primer/react/dist/index.d.ts` (ou les `types.d.ts` associés)
   - vérifier que le composant/variant/propriété existe réellement.

2. **Appliquer le pattern layout HTML + contrôles Primer**
   - structure de page et blocs → balises HTML + CSS,
   - interactions utilisateur (boutons, champs, badges) → composants Primer.

3. **Aligner avec `react-primer-feature-architecture`**
   - garder les composants Primer dans le répertoire `ui/` d’une feature,
   - ne pas faire d’appels API ni de logique métier dans ces composants,
   - laisser les hooks/view-model mapper le modèle métier vers les props Primer.

---

## Rules

- Ne jamais inventer de composants ou de variants Primer non présents dans les types.
- Ne pas encapsuler toute la mise en page dans des composants Primer quand un wrapper HTML est suffisant.
- Utiliser Primer pour ce qu’il fait bien : contrôles cohérents, statuts lisibles, spinners, theming.

