Crée le fichier us-002-game-engine.md. Utilise le template dans .oneticket/templates/us.md avec les informations suivantes :

## Story
En tant que développeur, je veux une boucle de jeu stable à ~60 FPS avec gestion d'état et mise à jour physics, afin que le jeu soit réactif et fluide.

## Expected Behavior
- Boucle de jeu exécutée à ~60 FPS
- État du jeu (position balle, position raquette, briques, vies) mis à jour à chaque frame
- Deltatime mesuré pour normaliser le mouvement
- Pas de stuttering ou ralentissements visibles

## Acceptance Criteria
- [ ] Game loop implémentée (requestAnimationFrame ou setInterval)
- [ ] État du jeu stocké et accessible
- [ ] Update() et render() séparés
- [ ] FPS stable ~60
- [ ] Pas de fuite mémoire sur session longue

## Related Slices
- slice-2-game-engine
