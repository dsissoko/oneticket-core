# skills/bagustris/primer-style/SKILL.md

## Objective

Help the agent **review and refine** existing React + Primer UIs so that they follow Primer conventions and stay simple, readable and consistent.

Where `bas/primer-design` guide la création initiale d’écrans, ce skill est plutôt orienté **“polish / refactor”**.

---

## Scope

- React apps utilisant `@primer/react` et/ou les classes CSS Primer.
- Concerne surtout :
  - la façon dont les composants Primer sont combinés,
  - l’alignement avec les patterns de design courants (actions, listes, headers, formulaires).

---

## Review Checklist (for the agent)

1. **Utilisation des bons composants**
   - boutons d’action → `Button` plutôt qu’un `<button>` custom stylé à la main,
   - statuts ou tags → `Label` / `StateLabel` selon le cas,
   - spinners → `Spinner` plutôt qu’un loader maison.

2. **Simplicité des arbres JSX**
   - éviter de multiplier les wrappers inutiles,
   - préférer quelques conteneurs clairs avec classes CSS, et des composants Primer bien identifiés à l’intérieur.

3. **Cohérence des variants**
   - utiliser les variants Primer de façon cohérente (ex: `primary` pour l’action principale, `danger` pour la suppression),
   - éviter de surcharger le design avec trop de variantes visuelles sur le même écran.

4. **Lisibilité**
   - vérifier que les titres, textes et actions ressortent correctement avec les choix de composants Primer,
   - quand la structure devient complexe, envisager de factoriser en composants UI plus petits.

---

## Process

1. Lire rapidement la feature React concernée (fichiers `ui/`).
2. Identifier :
   - les endroits où un composant Primer serait plus approprié qu’un HTML custom,
   - les patterns récurrents pouvant être factorisés (listes, cartes, toolbars).
3. Proposer des modifications ciblées :
   - remplacement de composants HTML par des composants Primer,
   - simplification de la structure JSX,
   - harmonisation des variants / tailles de boutons, labels, etc.
4. Garder la logique métier et les hooks intactes; ne modifier que la couche UI.

---

## Rules

- Ne pas changer la logique métier, les hooks ou les modèles lors d’une revue de style : se concentrer uniquement sur la présentation.
- Prioriser la lisibilité et la cohérence par rapport à des micro‑optimisations esthétiques.

