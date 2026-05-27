# User Story

## Story

En tant que joueur, je veux détruire les briques en frappant la balle contre elles, afin de progresser vers la victoire.

## Expected Behavior

## Acceptance Criteria

### Gherkin

```gherkin
Scenario: Destruction de briques
  Given des briques en place
  When la balle frappe une brique
  Then cette brique disparaît

Scenario: Fin du jeu après destruction complète
  When toutes les briques sont détruites
  Then j'affiche le message Victoire et la partie se termine
```

## Related Slices
