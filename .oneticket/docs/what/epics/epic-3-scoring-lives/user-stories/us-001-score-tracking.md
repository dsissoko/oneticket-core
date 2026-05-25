## Story
En tant que joueur, je veux voir mon score augmenter quand je détruis des briques, pour mesurer ma progression.

## Expected Behavior
- Score initial à 0
- Points awarded selon type de brique
- Score affiché en temps réel

## Acceptance Criteria
- Given: Le joueur détruit une brique standard
- When: Collision
- Then: +10 points ajoutés au score
- Given: Le joueur détruit une brique renforcée
- When: Collision
- Then: +20 points ajoutés au score
- Score visible en permanence à l'écran