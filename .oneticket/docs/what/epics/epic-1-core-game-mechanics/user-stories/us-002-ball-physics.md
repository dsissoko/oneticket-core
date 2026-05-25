## Story
En tant que joueur, je veux que la balle se déplace de manière prévisible, afin de pouvoir anticiper mes actions.

## Expected Behavior
- La balle se déplace en ligne droite
- Vitesse constante
- Change de direction au rebond

## Acceptance Criteria
- Given: La balle est en mouvement
- When: Elle touche un mur
- Then: Elle rebondit dans la direction opposée
- Given: Elle touche la raquette
- Then: Elle rebondit selon l'angle d'impact
- Given: Elle touche une brique
- Then: Elle rebondit et la brique est détruite