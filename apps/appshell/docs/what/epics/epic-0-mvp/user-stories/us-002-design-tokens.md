---
title: US-002 — Design Tokens
---

# US-002 — Design Tokens

## Story

En tant que designer/développeur, je veux utiliser des design tokens Tailwind centralisés pour toutes les couleurs et propriétés, afin de garantir la cohérence visuelle et d'empêcher les variations.

## Expected Behavior

- **Tailwind Configuration** — `tailwind.config.ts` définit des tokens centralisés pour `colors`, `spacing`, et `typography`
- **CSS Custom Properties** — `globals.css` expose des CSS custom properties pour `light` et `dark` modes
- **Theme Toggle** — `ThemeToggle` expose les options `system`, `light`, et `dark` avec changement réactif sans rechargement
- **Visual Consistency** — Tous les composants héritent des tokens; aucun style en ligne
- **Token Inheritance** — Les variations de couleur, espacement, et typographie se propagent automatiquement à tous les composants

## Acceptance Criteria

1. **tailwind.config.ts définit les tokens**
   - [x] `colors` — palette cohérente (primary, secondary, neutral, success, warning, error)
   - [x] `spacing` — scale cohérente (4px baseline, multiples: 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16)
   - [x] `typography` — font sizes, line heights, font weights centralisés

2. **globals.css expose CSS custom properties pour light/dark modes**
   - [x] Variables CSS pour `--color-*`, `--spacing-*`, `--font-*`
   - [x] Media query `@media (prefers-color-scheme: dark)` ou classe `.dark`
   - [x] Aucun hardcode de couleurs en composants

3. **ThemeToggle expose system/light/dark avec reactive switching sans reload**
   - [x] `useTheme()` hook retourne `{ theme, setTheme }`
   - [x] Options: `system`, `light`, `dark`
   - [x] Changement de thème met à jour le DOM sans rechargement
   - [x] Préférence utilisateur persiste dans localStorage

4. **Tous les composants utilisent les tokens**
   - [x] Zéro styles en ligne; 100% Tailwind classes + CSS custom properties
   - [x] Les variations de couleur/spacing utilisent les tokens centralisés
   - [x] Tests vérifient que les tokens sont appliqués correctement

5. **Documentation claire**
   - [x] `TOKENS.md` ou section dans `globals.css` documente la palette et le système d'espacement
   - [x] Exemples d'utilisation en composants

## Related Epic

[../epic.md](../epic.md)

## Related Slices

- [../../../how/slices/slice-1-skeleton-foundation/slice.md](../../../how/slices/slice-1-skeleton-foundation/slice.md) — Design tokens (Tailwind, CSS custom properties) and theme system setup
- [../../../how/slices/slice-4-theme-system/slice.md](../../../how/slices/slice-4-theme-system/slice.md) — Light/dark/system theme system with reactive switching and CSS custom properties
