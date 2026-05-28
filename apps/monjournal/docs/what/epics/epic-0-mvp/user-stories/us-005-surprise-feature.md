# US-005 — Découvrir une entrée aléatoire du passé avec le bouton "Surprise"

## Story

En tant qu'utilisateur, je veux cliquer sur un bouton "Surprise" pour lire une entrée aléatoire de mon passé, afin de revivre des moments mémorables de façon inattendue et ludique.

## Expected Behavior

L'utilisateur accède à un bouton "Surprise" (visible sur la page d'accueil ou dans un menu). En cliquant sur ce bouton :
1. Une entrée est sélectionnée aléatoirement parmi toutes les entrées existantes
2. L'écran bascule vers l'affichage en détail de cette entrée
3. Un bouton "Autre surprise" permet de découvrir une autre entrée aléatoire
4. Un bouton "Retour" ferme la vue surprise

La sélection aléatoire est uniforme : chaque entrée a la même probabilité d'être choisie.

## Acceptance Criteria

```gherkin
Feature: Découvrir une entrée aléatoire

  Scenario: Accéder au bouton Surprise
    Given L'utilisateur est sur la page d'accueil
    When Il cherche le bouton "Surprise" ou "🎲 Découvrir"
    Then Le bouton est visible et clairement identifié
    And Le bouton est accessible via clavier (Tab, Entrée)
    
  Scenario: Afficher une entrée aléatoire
    Given L'utilisateur a au moins une entrée
    When Il clique sur "Surprise"
    Then Une entrée s'affiche en détail (date et texte complet)
    And Cette entrée provient de la liste existante
    And L'écran affiche le titre "Surprise du jour"
    
  Scenario: Sélection uniforme parmi toutes les entrées
    Given L'utilisateur a 10 entrées
    When Il clique 100 fois sur "Autre surprise"
    Then Chacune des 10 entrées a approximativement 10% de chance d'apparaître
    And Aucune entrée n'est systématiquement exclue ou favorisée
    
  Scenario: Découvrir d'autres entrées aléatoires
    Given Une entrée aléatoire s'affiche
    When L'utilisateur clique sur "Autre surprise"
    Then Une autre entrée s'affiche en détail
    And L'écran se met à jour sans rechargement
    And L'utilisateur peut cliquer plusieurs fois d'affilée
    
  Scenario: Retourner à la liste depuis la surprise
    Given Une entrée aléatoire s'affiche
    When L'utilisateur clique sur "Retour" ou "← Retour"
    Then La vue surprise se ferme
    And L'utilisateur revient à la liste / timeline précédente
    And Aucune entrée n'a été modifiée
    
  Scenario: Aucune entrée disponible
    Given L'utilisateur n'a aucune entrée créée
    When Il clique sur "Surprise"
    Then Un message "Aucune entrée trouvée" s'affiche
    And Un bouton "Créer une entrée" le redirige vers le formulaire
    
  Scenario: Performance avec 1000 entrées
    Given L'utilisateur a 1000 entrées
    When Il clique sur "Surprise"
    Then Une entrée s'affiche en moins de 50ms
    And Le bouton "Autre surprise" répond instantanément (< 50ms)
    And Pas d'événement console ou freeze
    
  Scenario: Interface accessible
    Given La vue surprise est affichée
    When L'utilisateur utilise un lecteur d'écran
    Then Le titre de l'entrée est annoncé
    And Les boutons "Autre surprise" et "Retour" sont identifiables
    And Les touches clavier (Tab, Entrée, Échap) fonctionnent normalement
```

## Technical Constraints

- **Random Selection** : Algorithme uniforme (Math.random() sur indices, éviter les biais)
- **Performance SLA** : < 50ms pour génération aléatoire, même avec 1000+ entrées
- **localStorage** : Lecture directe depuis `journal_entries`, aucune modification
- **MSW** : Aucun appel API (localStorage local)
- **UI Components** : Bouton Primer @primer/react, modal ou panneau détail
- **Accessibility** : WCAG 2.1 AA, labels explicites, navigation au clavier (Tab, Entrée, Échap)
- **Edge Case** : Gestion gracieuse si localStorage vide (message clair)
- **State Management** : Pas de state globale requise, logique purement locale

## Related Epic

[Epic 0 — Journal Personnel MVP](../epic.md)

## Related Slices

- [Slice 4 — Surprise Feature (Random Entry Picker)](../../../../how/slices/slice-4-surprise-feature/slice.md)
