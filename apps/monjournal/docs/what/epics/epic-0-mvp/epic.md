# Epic 0 — Journal Personnel MVP

## Goal

Créer l'expérience core d'une application de journal intime simple et privée. Le MVP permet au diariste de **créer, modifier et consulter ses entrées**, de **retrouver des entrées par période**, de **découvrir des moments oubliés aléatoirement**, et de **visualiser son historique sur une timeline**. Tout cela sans infrastructure backend, stockage local uniquement, avec interface GitHub Primer et déploiement sur GitHub Pages.

## Business Value

- **Simplicité** : Zéro friction pour écrire une entrée (< 1 minute, < 3 clics)
- **Redécouverte** : Accès ludique à son passé via le bouton Surprise
- **Accès rapide** : Retrouver des entrées par période sans recherche textuelle complexe
- **Intimité** : Données privées, stockage local, aucune synchronisation
- **Accessibilité** : Déploiement gratuit sur GitHub Pages, aucune dépendance externe

## Scope

### Fonctionnalités

#### 1. Gestion des Entrées
- **Créer** : Formulaire simple (date + textarea), sauvegarde automatique en localStorage
- **Éditer** : Modification du texte et de la date, historique des timestamps conservé
- **Supprimer** : Suppression avec confirmation, définitive et irréversible
- **Afficher** : Liste et détail d'une entrée avec date

#### 2. Recherche par Période
- Sélectionner date de début et date de fin (incluses)
- Retourner toutes les entrées dans la plage
- Afficher résultats en liste ou vue filtrée

#### 3. Timeline Visuelle
- Fil chronologique des entrées avec ancres de dates
- Navigation par scroll
- Clic sur une date pour filtrer les entrées du jour
- Clic sur une entrée pour lire ou éditer

#### 4. Lecture Aléatoire (Surprise)
- Bouton dédicacé affichant une entrée au hasard
- Redémarrer pour une autre sélection
- Sélection uniforme parmi toutes les entrées

#### 5. Thèmes et Skins
- Mode clair / sombre (avec détection de préférence système + sélecteur manuel)
- Design GitHub Primer (couleurs, typo, espacement, composants)
- Réactivité mobile-first

### Contraintes Techniques

- **Zéro backend** : localStorage uniquement, aucune API serveur
- **MSW** : Mock Service Worker pour futurs tests d'intégration API (préparation pour phase 2)
- **localStorage** : Persistence maximale ~5-10 MB par domaine (behavior à définir si dépassé)
- **GitHub Pages** : Déploiement statique, aucune configuration additionnelle
- **Stack** : React 18+ + Vite + TypeScript + Primer UI + localStorage
- **Accessibilité** : WCAG 2.1 niveau AA minimum

### Out of Scope MVP

- Synchronisation multi-appareils
- Chiffrement ou authentification
- Export/Import JSON
- Étiquettes (tags) ou catégories
- Statistiques d'écriture
- Partage d'entrées
- Notifications ou rappels
- Récurrence d'entrées

## Expected Results (Acceptance Criteria)

### Résultats Fonctionnels
- [ ] Utilisateur crée une entrée en < 1 minute sans documentation
- [ ] Recherche par période retourne résultats en < 100ms pour 1000 entrées
- [ ] Timeline charge et affiche 100+ entrées sans ralentissement
- [ ] Bouton Surprise fonctionne immédiatement sans latence visible
- [ ] Thème sombre et clair s'appliquent à l'interface complète
- [ ] Aucune perte de données après fermeture/rechargement du navigateur

### Résultats Techniques
- [ ] localStorage utilisé correctement avec gestion d'erreur si plein
- [ ] Composants React réutilisables (Entry, Timeline, SearchForm, etc.)
- [ ] MSW configuré mais inactif (préparation phase 2)
- [ ] Tests unitaires sur logique métier (filtrage, sélection aléatoire)
- [ ] Tests E2E sur workflows principaux (création → recherche → surprise)

### Résultats Design / UX
- [ ] Interface cohérente avec GitHub Primer design system
- [ ] Responsive sur mobile, tablette, desktop
- [ ] Accessibilité WCAG 2.1 AA (contraste, labels, navigation clavier)
- [ ] Dark mode indiscernable du light mode fonctionnellement
- [ ] Pas de boutons, inputs ou textes en-dessous des normes Primer

### Résultats Déploiement
- [ ] Application accessible sur GitHub Pages (public repo)
- [ ] Pas de erreurs console en production
- [ ] Optimisé pour les navigateurs modernes (ES2020+)
- [ ] Bundle < 500KB gzippé (React + Primer + logique métier)

## Related User Stories

<!-- @analyst will populate this after task C (user story decomposition) -->
<!-- Expected structure:
- ./user-stories/us-001-create-entry.md
- ./user-stories/us-002-edit-entry.md
- ./user-stories/us-003-delete-entry.md
- ./user-stories/us-004-search-by-period.md
- ./user-stories/us-005-timeline-visualization.md
- ./user-stories/us-006-random-reading.md
- ./user-stories/us-007-theme-switcher.md
-->

## Related Slices

<!-- @architect will populate this after producing implementation slices -->
<!-- Expected slices from architecture:
- Slice 1: Data model (Entry entity, localStorage adapter)
- Slice 2: CRUD operations (create, edit, delete, read)
- Slice 3: Search and filter (date range queries)
- Slice 4: Timeline component and navigation
- Slice 5: Random selection (Surprise feature)
- Slice 6: Theme switcher and Primer integration
- Slice 7: E2E tests and deployment validation
-->
