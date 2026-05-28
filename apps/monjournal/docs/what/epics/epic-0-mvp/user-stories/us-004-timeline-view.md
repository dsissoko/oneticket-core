# US-004 — Voir une timeline visuelle chronologique de ses entrées

## Story

En tant qu'utilisateur, je veux voir une timeline visuelle chronologique de mes entrées avec ancres de dates, afin de naviguer rapidement dans mon journal et de visualiser mon historique.

## Expected Behavior

L'utilisateur accède à une vue de timeline qui affiche :
1. Un fil chronologique vertical ou horizontal avec ses entrées
2. Des ancres de dates comme points de repère visuels
3. La possibilité de naviguer par scroll (mobile-friendly)
4. La possibilité de cliquer sur une date pour filtrer les entrées du jour
5. La possibilité de cliquer sur une entrée pour la consulter en détail

Les entrées sont affichées en ordre chronologique (récentes d'abord par défaut, ou au choix de l'utilisateur).

## Acceptance Criteria

```gherkin
Feature: Timeline visuelle chronologique

  Scenario: Afficher la timeline sur la page d'accueil
    Given L'utilisateur charge la page d'accueil
    When Aucun filtre n'est actif
    Then La timeline complète s'affiche avec toutes les entrées
    And Un fil vertical ou horizontal est visible
    And Les ancres de dates sont marquées visuellement
    
  Scenario: Timeline affiche les entrées par ordre chronologique
    Given L'utilisateur a entrées datées : 2026-05-20, 2026-05-25, 2026-06-01
    When La page charge
    Then L'affichage par défaut montre l'ordre : 2026-06-01, 2026-05-25, 2026-05-20 (récentes d'abord)
    Or L'affichage peut être inversé par un sélecteur (anciennes d'abord)
    
  Scenario: Cliquer sur une date pour filtrer le jour
    Given La timeline est affichée
    And Il y a 2 entrées pour 2026-05-25 et 1 pour 2026-05-20
    When L'utilisateur clique sur l'ancre "25 mai 2026"
    Then Seules les 2 entrées du 25 mai s'affichent
    And Un badge ou indicateur montre "Filtrée : 25 mai"
    And Un bouton "Voir tout" permet de réinitialiser
    
  Scenario: Cliquer sur une entrée pour lire en détail
    Given La timeline affiche des entrées
    When L'utilisateur clique sur une entrée
    Then L'écran bascule vers le détail de l'entrée
    And La date et le texte complet sont affichés
    And Les boutons "Éditer", "Supprimer", "Retour" sont visibles
    
  Scenario: Naviguer la timeline avec plusieurs entrées
    Given L'utilisateur a 100 entrées sur 3 mois
    When La page charge
    Then La timeline se charge sans ralentissement
    And Le scroll fonctionne fluidement
    And Les ancres de dates sont lisibles et distincts
    
  Scenario: Timeline responsive sur mobile
    Given L'utilisateur accède depuis un mobile (< 768px)
    When La page charge
    Then La timeline s'affiche en mode vertical compact
    And Les ancres de dates sont espacées pour éviter le chevauchement
    And Le scroll vertical fonctionne normalement
    And Aucun texte n'est coupé ou inaccessible
    
  Scenario: Timeline affiche plusieurs entrées pour la même date
    Given 3 entrées existent pour 2026-05-25
    When La timeline s'affiche
    Then Les 3 entrées s'affichent sous l'ancre "25 mai 2026"
    And Elles sont espacées visuellement
    And Elles restent cliquables individuellement
    
  Scenario: Pas de ralentissement avec 1000 entrées
    Given L'utilisateur a 1000 entrées en localStorage
    When La page charge et affiche la timeline
    Then Le rendu se fait en moins de 1 seconde
    And Le scroll reste fluide (60 fps)
    And Aucun message d'erreur console n'apparaît
```

## Technical Constraints

- **Rendering** : Virtualisation ou pagination pour 1000+ entrées (React windowing optional)
- **Chronological Order** : Tri par date décroissante (récentes d'abord) ou croissante, configurable
- **Date Anchors** : Regroupement visuel par date, avec labels HTML / CSS
- **Mobile Responsive** : CSS Grid/Flexbox, breakpoints Primer (xs, sm, md, lg)
- **Performance** : Rendu < 1s, scroll à 60fps, bundle <= 500KB gzippé
- **Accessibility** : Contraste WCAG AA, labels pour ancres, navigation au clavier
- **MSW** : Aucun appel API (localStorage local)
- **Components** : Primitives Primer (@primer/react) pour coercion visuelle

## Related Epic

[Epic 0 — Journal Personnel MVP](../epic.md)

## Related Slices

<!-- @architect will populate this section after producing implementation slices -->
- Slice 1: Data model (Entry entity, localStorage adapter)
- Slice 2: CRUD operations (read operation)
- Slice 4: Timeline component and navigation
