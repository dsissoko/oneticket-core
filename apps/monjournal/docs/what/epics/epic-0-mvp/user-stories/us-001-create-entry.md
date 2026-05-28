# US-001 — Créer une nouvelle entrée de journal

## Story

En tant qu'utilisateur, je veux créer une nouvelle entrée de journal pour une date donnée avec du texte libre, afin de documenter mes pensées quotidiennes.

## Expected Behavior

L'utilisateur accède à un formulaire simple qui lui permet :
1. De sélectionner une date (calendrier ou saisie manuelle, aujourd'hui par défaut)
2. De saisir du texte libre de toute longueur dans une textarea
3. De sauvegarder l'entrée en un clic
4. De recevoir une confirmation que l'entrée a été créée
5. De voir l'entrée apparaître immédiatement dans la timeline et la liste

La sauvegarde se fait automatiquement en localStorage. Plusieurs entrées peuvent être créées pour la même date.

## Acceptance Criteria

```gherkin
Feature: Créer une nouvelle entrée de journal

  Scenario: Créer une entrée pour aujourd'hui avec texte
    Given L'utilisateur est sur la page d'accueil
    When Il clique sur "Nouvelle entrée"
    Then Un formulaire s'affiche avec la date d'aujourd'hui préremplie
    And Le champ texte est vide et prêt à être rempli
    
  Scenario: Sauvegarder une entrée avec date et texte
    Given Le formulaire de création est affiché
    When L'utilisateur saisit du texte dans la textarea
    And Il clique sur "Sauvegarder"
    Then L'entrée est sauvegardée en localStorage
    And Un message de confirmation s'affiche
    And L'entrée apparaît dans la timeline avec sa date
    
  Scenario: Créer plusieurs entrées pour la même date
    Given Une première entrée existe pour le 2026-05-28
    When L'utilisateur crée une deuxième entrée pour le 2026-05-28
    Then Les deux entrées coexistent avec indices différents (index 0, index 1)
    And Les deux apparaissent dans la timeline pour cette date
    
  Scenario: Sauvegarder une entrée avec texte long
    Given Le formulaire de création est affiché
    When L'utilisateur saisit 5000 caractères de texte
    And Il clique sur "Sauvegarder"
    Then L'entrée est sauvegardée complètement en localStorage
    And Aucune limite de texte n'est appliquée
    
  Scenario: Réinitialiser le formulaire après création
    Given Une entrée a été créée avec succès
    When L'utilisateur ferme le formulaire ou clique "Nouvelle entrée" à nouveau
    Then Le formulaire est réinitialisé avec la date du jour
    And Le champ texte est vidé
```

## Technical Constraints

- **localStorage** : Toutes les entrées sont sérialisées en JSON et stockées sous une clé unique `journal_entries`
- **Entry Model** : `{ id: string, date: YYYY-MM-DD, text: string, createdAt: ISO8601, updatedAt: ISO8601 }`
- **Validation** : Date valide (passée ou présente), texte non vide
- **MSW** : Aucun appel API pour cette fonctionnalité (localStorage local)
- **Performance** : Création doit être instantanée (< 50ms)

## Related Epic

[Epic 0 — Journal Personnel MVP](../epic.md)

## Related Slices

- [Slice 1 — Entry CRUD Operations](../../../how/slices/slice-1-entry-crud/slice.md)
