## Story
En tant que joueur, je veux que les collisions soient détectées précisément, afin que le jeu soit équitable et prévisible.

## Expected Behavior
- Collision avec les murs, raquette et briques
- Pas de comportement inattendu (glitch de collision)

## Acceptance Criteria
- Given: La balle en mouvement
- When: Elle entre en contact avec un élément
- Then: Le système détecte la collision
- Given: Plusieurs collisions simultanées
- Then: Chaque collision est traitée correctement