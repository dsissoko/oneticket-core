# User Story 004 — Système de vies et détection game over

## Résumé
Permettre au joueur de perdre des vies lorsque la balle franchit le bas de l'écran, avec détection et affichage de l'état game over lorsque le joueur épuise ses vies.

## Use Case (Format Mike Cohn)

- **En tant que** joueur
- **Je veux** perdre une vie si la balle atteint le bas de l'écran
- **Afin que** le jeu progresse et se termine lorsque j'épuise mes vies

## Acceptance Criteria (Format Gherkin)

### Critère 1 — Décompte initial des vies

```gherkin
Scénario: Le joueur commence une partie avec 3 vies

Étant donné que le joueur démarre une nouvelle partie
Quand le jeu initialise l'état de jeu
Alors le compteur de vies affiche 3
```

### Critère 2 — Perte de vie et réinitialisation de la balle

```gherkin
Scénario: La balle franchit le bas de l'écran et le joueur perd une vie

Étant donné que le joueur a au moins 1 vie restante
Et que le jeu est en cours
Quand la balle franchit la limite basse de l'aire de jeu
Alors le compteur de vies diminue de 1
Et la balle est réinitialisée au centre de l'aire de jeu
Et la balle repart avec une direction aléatoire
Et le jeu reprend automatiquement
```

### Critère 3 — État Game Over

```gherkin
Scénario: Le joueur atteint 0 vie et Game Over s'affiche

Étant donné que le joueur a 0 vie restante
Et que la balle vient de franchir la limite basse
Quand la détection de game over est activée
Alors le jeu s'arrête
Et l'écran Game Over s'affiche
Et le message "GAME OVER" est visible
Et un bouton "Rejouer" est disponible
```

### Critère 4 — Rejouer après Game Over

```gherkin
Scénario: Le joueur clique sur "Rejouer" après un game over

Étant donné que l'écran Game Over s'affiche
Et que les briques sont toutes en place (réinitialisées)
Quand le joueur clique sur le bouton "Rejouer"
Alors le compteur de vies revient à 3
Et la balle est positionnée au centre
Et les briques sont restaurées dans leur état initial
Et le jeu redémarre automatiquement
```

## Tâches techniques

1. **Compteur de vies**
   - Variable pour suivre le nombre de vies restantes
   - Incrément/décrément sécurisé
   - Synchronisation avec l'affichage HUD

2. **Affichage HUD**
   - Affichage du compteur de vies en temps réel dans l'interface
   - Positionnement visible pendant le jeu
   - Mise à jour immédiate après chaque perte de vie

3. **Détection franchissement bas de l'écran**
   - Vérification continue si la balle dépasse la limite basse
   - Déclenchement d'une action de perte de vie
   - Gestion des limites précises de l'aire de jeu

4. **Réinitialisation de la balle**
   - Reset position au centre de l'aire de jeu
   - Sélection aléatoire d'une direction initiale
   - Restauration de la vitesse configurée

5. **État Game Over**
   - Détection quand le compteur atteint 0
   - Arrêt du jeu et du rendu
   - Affichage de l'écran de fin
   - Bouton "Rejouer" fonctionnel

6. **Réinitialisation du jeu (Rejouer)**
   - Reset complet : briques, balle, vies
   - Retour à l'état initial de gameplay
   - Reprise du jeu automatiquement

## Critères de succès

- ✅ Le joueur peut voir son nombre de vies décroître à chaque franchissement du bas
- ✅ L'interface HUD affiche correctement le nombre de vies restantes
- ✅ Après perte d'une vie (sauf la dernière), la balle revient au centre et le jeu continue
- ✅ Lorsque le joueur atteint 0 vie, l'écran Game Over s'affiche clairement
- ✅ Le joueur peut relancer une partie via le bouton "Rejouer" avec un reset complet
- ✅ Aucune erreur de console lors de ces transitions d'état

## Notes d'implémentation

- La réinitialisation de la balle doit être seamless (pas de pause visible)
- La direction aléatoire au centre doit être calculée pour éviter les trajectoires plates (y > 0)
- Le Game Over doit bloquer tout input de jeu jusqu'à clic sur "Rejouer"
- Les transitions entre les états (actif → perte de vie → game over) doivent être claires pour l'utilisateur

---

**ID Épic parent** : Epic 0 — Breakout MVP  
**Dépendances** : US-002 (Balle avec physique réaliste), US-001 (Raquette)  
**Ordre de développement** : À séquencer après US-001 et US-002
