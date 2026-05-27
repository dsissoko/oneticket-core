# US-003 - Contrôler la raquette au clavier

## Titre
Contrôler la raquette avec les flèches du clavier

## Description
En tant que joueur, je veux contrôler la raquette avec les flèches gauche et droite, afin de frapper la balle et de rester dans le jeu.

## Critères d'acceptation (format Gherkin)

```gherkin
Fonctionnalité: Contrôle au clavier de la raquette

Scénario: Déplacement à gauche
  Étant donné le jeu est en cours
  Quand j'appuie sur la flèche gauche
  Alors la raquette se déplace vers la gauche

Scénario: Déplacement à droite
  Étant donné le jeu est en cours
  Quand j'appuie sur la flèche droite
  Alors la raquette se déplace vers la droite

Scénario: Limites d'écran
  Étant donné le jeu est en cours
  Quand j'appuie sur une flèche de direction
  Alors la raquette ne peut pas sortir de l'écran

Scénario: Touches ignorées
  Étant donné le jeu est en cours
  Quand j'appuie sur une touche autre que les flèches
  Alors les autres touches sont ignorées
```

## Notes de mise en œuvre

- **Gestionnaire d'événements clavier**: Implémentation d'un listener pour les événements keydown/keyup
- **Mise à jour continue de position raquette**: Position mise à jour à chaque frame du jeu
- **Contraintes de limites d'écran**: Vérification que la raquette ne dépasse pas les bordures gauche et droite
- **Pas de temps delta pour fluidité**: Utilisation du delta time pour assurer une animation fluide indépendante de la fréquence d'images
