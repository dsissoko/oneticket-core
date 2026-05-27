# Epic 0 — Breakout MVP

## Titre
Epic 0 - Breakout MVP

## Vision
Créer un jeu Breakout fonctionnel en JavaScript vanilla offrant une expérience arcade classique et addictive avec des mécaniques de base solides.

## Périmètre MVP

Le jeu Breakout MVP doit inclure :

- **Aire de jeu** : Espace de jeu rectangulaire avec mur de 5 lignes de briques
- **Balle rebondissante** : Physique réaliste avec rebonds sur les murs, le plafond, les briques et la raquette
- **Raquette contrôlable** : Déplacement fluide via flèches gauche/droite du clavier
- **Système de vies** : 3 vies initiales, perte d'une vie si la balle franchit le bas de l'écran
- **Menus** : Écran d'accueil avec boutons Démarrer, Rejouer, Quitter
- **Slider de vitesse** : Ajustement de la vitesse de la balle avant le lancement
- **Détection victoire/game over** : Affichage des états de fin de partie appropriés

## User Stories

### US 1 — Contrôler la raquette au clavier
**En tant que** joueur,
**Je veux** contrôler une raquette avec les flèches gauche et droite,
**Afin de** renvoyer la balle et poursuivre le jeu.

**Critères d'acceptation**
- La raquette se déplace à gauche lorsque la flèche gauche est pressée
- La raquette se déplace à droite lorsque la flèche droite est pressée
- La raquette reste confinée aux bordures de l'aire de jeu
- Les mouvements sont fluides et immédiatement réactifs
- La raquette s'arrête lorsque la touche est relâchée

---

### US 2 — Balle avec physique réaliste
**En tant que** joueur,
**Je veux** voir la balle rebondir réalistically sur les murs, le plafond et la raquette,
**Afin de** jouer correctement et prévoir les trajectoires.

**Critères d'acceptation**
- La balle rebondit sur les murs gauche et droit en inversant sa trajectoire horizontale
- La balle rebondit sur le plafond en inversant sa trajectoire verticale
- La balle rebondit sur la raquette avec un angle dépendant du point d'impact
- La balle rebondit sur les briques en les détruisant
- La vitesse reste constante après chaque rebond (pas d'accélération)

---

### US 3 — Système de vies et game over
**En tant que** joueur,
**Je veux** perdre une vie si la balle atteint le bas de l'écran,
**Afin que** le jeu progresse et se termine lorsque j'épuise mes vies.

**Critères d'acceptation**
- Le joueur démarre avec 3 vies
- Une vie est perdue lorsque la balle franchit la limite basse de l'aire de jeu
- Après la perte d'une vie, la balle est réinitialisée au centre avec une direction aléatoire
- L'affichage des vies restantes se met à jour en temps réel
- Le jeu s'arrête (état Game Over) lorsque le joueur atteint 0 vie
- Un message "Game Over" s'affiche à la fin

---

### US 4 — Destruction des briques et victoire
**En tant que** joueur,
**Je veux** détruire les briques du mur,
**Afin de** progresser vers la victoire et compléter une partie.

**Critères d'acceptation**
- Chaque brique est détruite lorsque la balle la touche
- Chaque brique peut être détruite une seule fois (reste disparue)
- Les briques disparaissent visuellement après destruction
- Lorsque toutes les briques sont détruites, la victoire est atteinte
- Un message "Victoire" s'affiche et le jeu s'arrête
- L'état final est stable (pas de balle libre après victoire)

---

### US 5 — Menu principal et navigation
**En tant que** joueur,
**Je veux** accéder à un menu pour démarrer une partie, rejouer ou quitter,
**Afin de** gérer le flux de jeu et recommencer facilement.

**Critères d'acceptation**
- Un écran de menu s'affiche au lancement du jeu
- Le menu contient trois boutons interactifs : Démarrer, Rejouer, Quitter
- Le bouton Démarrer lance une nouvelle partie
- Le bouton Rejouer redémarre le jeu (réinitialise briques, balle, vies à 3)
- Le bouton Quitter ferme l'application ou retourne au menu principal
- Les boutons réagissent visuellement aux survols et clics souris

---

### US 6 — Slider de vitesse de balle
**En tant que** joueur,
**Je veux** ajuster la vitesse de la balle via un slider,
**Afin de** personnaliser la difficulté avant de lancer une partie.

**Critères d'acceptation**
- Un slider est présent dans le menu principal
- Le slider offre une plage de vitesse (très lent à très rapide)
- L'ajustement du slider s'applique immédiatement à la prochaine partie
- La vitesse sélectionnée se maintient lors des redémarrages
- Le slider est intuitif et réactif à la souris

---

## Critères d'acceptation globaux

1. **Jouabilité complète** : Le jeu est jouable de bout en bout sans erreur de console
2. **5 lignes de briques** : Le mur initial contient exactement 5 lignes de briques régulièrement espacées
3. **Détection correcte** : Les états victoire (toutes briques détruites) et game over (0 vie) sont détectés correctement
4. **Menus fonctionnels** : Les menus principal et de fin de partie fonctionnent sans accroc
5. **Physique cohérente** : Les rebonds sont visuellement réalistes et prévisibles
6. **Aucune dépendance externe** : Pur JavaScript vanilla, HTML5, CSS3, pas de frameworks
7. **Pas d'erreurs de rendu** : Le canvas/DOM se met à jour fluidement sans saccades notables

---

## Notes techniques

- **Stack** : JavaScript vanilla, HTML5, CSS3, Canvas 2D
- **Pas de frameworks** : Développement en JavaScript pur
- **Pas de dépendances externes** : Aucune bibliothèque tierce autorisée
- **Architecture** : À déterminer en phase d'architecture (game loop, collision detection, rendering)

## Dépendances
- Dépend de : `product-spec.md` (défini)

---

**Status** : Pending (En attente de planification des sprints)
