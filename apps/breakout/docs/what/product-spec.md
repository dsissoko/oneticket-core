# Product Specification — Breakout

## Product Name
Breakout

## Short Description
Jeu arcade classique en JavaScript vanilla où le joueur contrôle une raquette pour détruire des briques avec une balle rebondissante.

## Problem & Users

### Problem Statement
Offrir une expérience de jeu arcade rétro simple et addictive aux joueurs souhaitant une démonstration de mécaniques de jeu de base en JavaScript vanilla.

### Target Users
- Joueurs appréciant les jeux arcade classiques
- Développeurs découvrant les mécaniques de jeu en JavaScript pur
- Amateurs de rétro gaming

## Core Capabilities for V1

### Gameplay

#### 1. Aire de Jeu avec Mur de Briques
- Aire de jeu rectangulaire délimitée par des bordures
- Mur initial composé de 5 lignes de briques
- Les briques sont espacées régulièrement
- Chaque brique peut être détruite une seule fois

#### 2. Balle Rebondissante avec Physique Réaliste
- Balle circulaire se déplaçant à vitesse constante dans l'aire de jeu
- Rebond sur les murs (haut, gauche, droite)
- Rebond sur les briques détruites
- Rebond sur la raquette
- Vitesse de balle ajustable via slider de menu

#### 3. Raquette Contrôlable
- Raquette horizontale située au bas de l'aire de jeu
- Contrôle au clavier : flèches gauche/droite uniquement
- Mouvements fluides et immédiatement réactifs
- Limitation du mouvement aux bordures de l'écran
- Détection de collision avec la balle

#### 4. Système de Vies
- Joueur commence avec 3 vies
- Perte d'une vie lorsque la balle atteint le bas de l'écran
- Réinitialisation de la balle au centre après perte d'une vie
- Game Over lorsque le joueur épuise ses vies

#### 5. Détection Victoire et Game Over
- **Victoire** : Toutes les briques sont détruites
- **Défaite** : Le joueur perd ses 3 vies (la balle franchit la limite basse)
- Affichage d'un message de fin de partie approprié

#### 6. Menu Principal
- Écran initial avec trois boutons :
  - **Démarrer** : Lance le jeu
  - **Rejouer** : Redéémarre le jeu (réinitialise les briques, la balle, et les vies à 3)
  - **Quitter** : Ferme l'application (ou retour au menu)
- Souris pour interagir avec les boutons

#### 7. Slider de Vitesse de Balle
- Élément de contrôle dans le menu permettant d'ajuster la vitesse
- Plage : très lent à très rapide
- Affectation immédiate du paramètre avant lancer du jeu

## Business Rules

### Game Rules

1. **Contrôle au Clavier**
   - Flèches gauche et droite uniquement pour déplacer la raquette
   - Pas d'autre interaction clavier en jeu

2. **Interaction au Menu (Souris)**
   - Les boutons du menu réagissent aux clics de souris
   - Le slider de vitesse est manipulable à la souris

3. **Perte de Vie**
   - Une vie est perdue si la balle franchit la limite basse de l'aire de jeu
   - Après la perte, la balle est réinitialisée au centre avec une direction aléatoire

4. **Pas de Système de Niveaux en V1**
   - Le jeu n'a qu'une seule configuration de mur initial
   - Aucune progression de difficulté ou déblocage de niveaux

5. **Pas de Progression Persistante en V1**
   - Aucun système de score persistant
   - Aucune sauvegarde d'état de partie
   - Chaque partie est indépendante

6. **Vitesse de Balle**
   - Ajustable uniquement via le slider du menu
   - Reste constante pendant le jeu
   - Ne change pas lors des rebonds

7. **Raquette Immobile par Défaut**
   - La raquette ne se déplace que lorsqu'une touche est maintenue
   - Elle reste à sa position si aucune touche n'est pressée

## Technical Stack

- **Language** : JavaScript vanilla (ECMAScript 2015+)
- **Markup** : HTML5
- **Styling** : CSS3
- **Build Tool** : Aucun (exécution directe dans le navigateur)
- **Framework** : Aucun
- **External Dependencies** : Aucune
- **Rendering** : Canvas 2D ou DOM (à déterminer lors de l'architecture)

## Constraints

- Aucune dépendance externe autorisée
- Respect strict de JavaScript vanilla
- Compatibilité navigateur moderne (ES2015+)
- Fichiers statiques uniquement

## Success Criteria

- Le jeu est jouable sans erreur de console
- Toutes les mécaniques décrites fonctionnent correctement
- Les rebonds sont visuellement cohérents et réalistes
- La raquette répond immédiatement aux entrées clavier
- Le menu fonctionne correctement avec la souris
- Le jeu peut être redémarré via le bouton "Rejouer"
