# US-002 — Implémenter les composants de layout (AppLayout, Header, Footer, ThemeToggle)

## Story

En tant que développeur utilisant AppShell, je dois avoir des composants de layout complets et fonctionnels (AppLayout, Header, Footer, ThemeToggle) pour pouvoir construire des écrans d'application sur une base solide et cohérente.

Les composants doivent suivre les conventions de design (Tailwind + shadcn/ui), respecter la structure définie dans le produit-spec.md, et permettre une navigation fluide entre les écrans sans rechargement de page.

## Expected Behavior

### AppLayout Component
- Enveloppe toutes les pages avec une structure cohérente : Header → Outlet → Footer
- Applique du padding/margin consistent via Tailwind
- Utilise `<Outlet />` de React Router pour injecter le contenu des écrans
- Gère l'état du thème via le contexte `next-themes` (pas d'état local)
- Rend sans erreurs au démarrage de l'application

### Header Component
- Affiche le nom de l'application (`VITE_APP_NAME`) sur la gauche
- Le nom est cliquable et navigue vers `/`
- Affiche une dropdown "About & Help" sur la droite avec deux options :
  - "About" → navigue vers `/about`
  - "Help" → navigue vers `/help`
- Affiche le composant `ThemeToggle` sur la droite, après la dropdown
- Utilise `shadcn/ui Button` et `DropdownMenu` pour les composants UI
- Design responsive (desktop-first)
- Persiste visuellement l'état de la navigation (page actuelle)

### Footer Component
- Rend un conteneur de footer vide mais structuré
- Réserve de l'espace pour du contenu futur
- Utilise Tailwind pour le styling (pas de CSS inline)
- Respecte la hiérarchie visuelle du layout

### ThemeToggle Component
- Utilise le hook `useTheme()` de `next-themes`
- Affiche trois options : "System", "Light", "Dark"
- Permet la sélection du mode thème (light/dark/system)
- L'option sélectionnée est mise en évidence visuellement
- Clicker sur une option met à jour `localStorage` et la classe HTML
- Les changements s'appliquent instantanément sans rechargement de page
- Utilise `shadcn/ui Button` ou `DropdownMenu` pour l'affichage
- Le thème persiste après un rechargement (F5 / refresh)

## Acceptance Criteria

- [ ] **AppLayout se rend sans erreur** — Le composant rend correctement au montage et reçoit des écrans via `<Outlet />`
- [ ] **Header affiche le nom de l'app** — `VITE_APP_NAME` est visible et cliquable
- [ ] **Header navigue vers `/`** — Cliquer sur le nom de l'app navigue vers la page d'accueil
- [ ] **Dropdown "About & Help" est présente** — Menu déroulant visible sur la droite du header
- [ ] **Dropdown navigue vers `/about`** — Option "About" navigue correctement
- [ ] **Dropdown navigue vers `/help`** — Option "Help" navigue correctement
- [ ] **ThemeToggle est présent** — Composant visible sur la droite du header
- [ ] **ThemeToggle change de thème** — Sélectionner "Light", "Dark" ou "System" change le thème appliqué
- [ ] **Changement de thème est réactif** — Les styles Tailwind/CSS custom properties se mettent à jour instantanément
- [ ] **Pas de rechargement lors du changement de thème** — La page ne se recharge pas (pas de F5 automatique)
- [ ] **ThemeToggle persiste après refresh** — Rafraîchir la page (F5) garde le thème sélectionné
- [ ] **Footer est présent** — Conteneur vide mais structuré en bas de l'écran
- [ ] **Tous les composants utilisent shadcn/ui et Tailwind** — Pas de CSS inline, pas de composants custom
- [ ] **Navigation fonctionnelle** — Les liens internes naviguent sans erreur
- [ ] **TypeScript strict mode** — Pas d'erreurs TypeScript, pas de `any` types injustifiés
- [ ] **Composants se rendent dans tous les écrans** — AppLayout enveloppe correctement HomeScreen, AboutScreen, HelpScreen

## Related Epic

[Epic 0 — MVP Breakout AppShell](../epic.md)

## Related Slices

<!-- @architect fills this section after producing slices -->
