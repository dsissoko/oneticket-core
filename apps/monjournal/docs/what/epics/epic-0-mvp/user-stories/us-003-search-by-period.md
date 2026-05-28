# US-003 — Rechercher ses entrées par période

## Story

En tant qu'utilisateur, je veux rechercher mes entrées par période (date de début et fin), afin de retrouver mes souvenirs sur une plage de temps spécifique.

## Expected Behavior

L'utilisateur accède à un formulaire de recherche qui lui permet :
1. De sélectionner une date de début (calendrier ou saisie manuelle)
2. De sélectionner une date de fin (calendrier ou saisie manuelle)
3. De lancer la recherche
4. De recevoir tous les résultats correspondants affichés en liste ou timeline filtrée

Les résultats incluent toutes les entrées dont la date est comprise entre la date de début et la date de fin (incluses).

## Acceptance Criteria

```gherkin
Feature: Rechercher par période

  Scenario: Accéder au formulaire de recherche
    Given L'utilisateur est sur la page d'accueil
    When Il clique sur "Recherche" ou "Chercher par date"
    Then Un formulaire s'affiche avec deux champs de date
    And Les champs sont étiquetés "Date de début" et "Date de fin"
    And Un bouton "Chercher" est visible
    
  Scenario: Rechercher avec une plage de dates valide
    Given L'utilisateur a entrées datées : 2026-05-20, 2026-05-25, 2026-06-01
    When Il saisit début = 2026-05-22 et fin = 2026-05-30
    And Il clique sur "Chercher"
    Then Seule l'entrée 2026-05-25 s'affiche dans les résultats
    And Les résultats affichent : 1 entrée trouvée
    
  Scenario: Rechercher avec dates incluses
    Given L'utilisateur a entrées datées : 2026-05-20, 2026-05-25, 2026-06-01
    When Il saisit début = 2026-05-25 et fin = 2026-05-25
    And Il clique sur "Chercher"
    Then L'entrée 2026-05-25 s'affiche exactement
    And Les entrées 2026-05-20 et 2026-06-01 ne s'affichent pas
    
  Scenario: Rechercher avec résultats vides
    Given L'utilisateur a entrées datées : 2026-05-20, 2026-06-01
    When Il saisit début = 2026-05-25 et fin = 2026-05-30
    And Il clique sur "Chercher"
    Then Aucun résultat ne s'affiche
    And Un message "Aucune entrée trouvée" s'affiche
    
  Scenario: Rechercher avec plage large (toutes les entrées)
    Given L'utilisateur a 5 entrées sur différentes dates
    When Il saisit début = 2020-01-01 et fin = 2026-12-31
    And Il clique sur "Chercher"
    Then Les 5 entrées s'affichent dans les résultats
    And Les résultats sont triés chronologiquement
    
  Scenario: Performance de recherche avec 1000 entrées
    Given L'utilisateur a 1000 entrées en localStorage
    When Il saisit une plage de dates et clique sur "Chercher"
    Then Les résultats s'affichent en moins de 100ms
    And L'interface reste réactive
    
  Scenario: Réinitialiser la recherche
    Given Une recherche a été effectuée et les résultats s'affichent
    When L'utilisateur clique sur "Réinitialiser" ou "Voir tout"
    Then Le formulaire est vidé
    And La liste complète des entrées s'affiche
    And Les filtres sont annulés
```

## Technical Constraints

- **localStorage** : Requête directe sur `journal_entries` sans API externe
- **Filter Logic** : `entries.filter(e => e.date >= startDate && e.date <= endDate)`
- **Date Format** : YYYY-MM-DD pour comparaison
- **Performance SLA** : < 100ms pour 1000 entrées
- **MSW** : Aucun appel API (localStorage local)
- **UI Components** : Champs de date Primer, boutons d'action
- **Validation** : Vérifier que `startDate <= endDate`, dates valides

## Related Epic

[Epic 0 — Journal Personnel MVP](../epic.md)

## Related Slices

<!-- @architect will populate this section after producing implementation slices -->
- Slice 1: Data model (Entry entity, localStorage adapter)
- Slice 3: Search and filter (date range queries)
