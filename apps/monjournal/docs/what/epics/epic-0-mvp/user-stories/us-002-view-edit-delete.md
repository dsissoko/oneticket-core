# US-002 — Voir, éditer et supprimer ses entrées de journal

## Story

En tant qu'utilisateur, je veux voir, éditer et supprimer mes entrées de journal, afin de gérer mon contenu et corriger mes erreurs.

## Expected Behavior

L'utilisateur peut :
1. **Voir** : Consulter la liste de toutes ses entrées ou un détail complet d'une entrée
2. **Éditer** : Modifier le texte ou la date d'une entrée existante
3. **Supprimer** : Supprimer définitivement une entrée après confirmation

Les modifications sont sauvegardées automatiquement en localStorage. L'historique des timestamps (création / modification) est conservé à titre informatif.

## Acceptance Criteria

```gherkin
Feature: Voir, éditer et supprimer les entrées

  Scenario: Voir le détail d'une entrée
    Given L'utilisateur a des entrées existantes
    When Il clique sur une entrée dans la liste ou la timeline
    Then L'écran affiche le détail complet : date, texte, timestamps
    And Un bouton "Éditer" et un bouton "Supprimer" sont visibles
    
  Scenario: Éditer le texte d'une entrée
    Given L'écran de détail d'une entrée est affiché
    When L'utilisateur clique sur "Éditer"
    Then Un formulaire pré-rempli apparaît (date et texte)
    And Il peut modifier le texte
    And Il clique sur "Sauvegarder"
    Then L'entrée est mise à jour en localStorage
    And Le timestamp de modification (updatedAt) est mis à jour
    And Le texte modifié s'affiche immédiatement
    
  Scenario: Éditer la date d'une entrée
    Given Le formulaire d'édition est affiché
    When L'utilisateur change la date
    And Il clique sur "Sauvegarder"
    Then L'entrée est déplacée vers la nouvelle date
    And L'index est recalculé si nécessaire
    And La timeline est mise à jour
    
  Scenario: Supprimer une entrée avec confirmation
    Given L'écran de détail d'une entrée est affiché
    When L'utilisateur clique sur "Supprimer"
    Then Un dialogue de confirmation s'affiche
    And L'utilisateur doit cliquer "Confirmer la suppression"
    Then L'entrée est définitivement supprimée de localStorage
    And L'écran retourne à la liste / timeline
    And L'entrée n'apparaît plus nulle part
    
  Scenario: Annuler la suppression
    Given Un dialogue de suppression est affiché
    When L'utilisateur clique sur "Annuler"
    Then Le dialogue se ferme
    And L'entrée n'est pas supprimée
    
  Scenario: Pas de perte de données après modification
    Given Une entrée a été modifiée avec succès
    When L'utilisateur ferme l'application et la réouvre
    Then L'entrée modifiée est toujours présente avec les modifications
    And Aucune donnée n'a été perdue
```

## Technical Constraints

- **localStorage** : Toutes les modifications persistent dans `journal_entries`
- **Timestamps** : `createdAt` reste immuable, `updatedAt` est mis à jour à chaque modification
- **Entry Model** : `{ id: string, date: YYYY-MM-DD, text: string, createdAt: ISO8601, updatedAt: ISO8601 }`
- **Validation** : Date valide (passée ou présente), texte non vide
- **MSW** : Aucun appel API (localStorage local)
- **Performance** : Édition et suppression < 50ms
- **Confirmation** : Dialogue modal natif ou composant Primer @primer/react

## Related Epic

[Epic 0 — Journal Personnel MVP](../epic.md)

## Related Slices

- [Slice 1 — Entry CRUD Operations](../../../how/slices/slice-1-entry-crud/slice.md)
