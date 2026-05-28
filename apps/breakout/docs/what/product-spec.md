---
title: 'Product Specification - Breakout'
---

# Breakout Game — Product Specification

<!-- SITE_DESCRIPTION: A classic arcade Breakout game in vanilla JavaScript without external dependencies -->

## 1. Vision

Créer un jeu arcade Breakout classique en JavaScript vanilla (HTML/CSS/JS) sans dépendances externes. Le jeu offre l'expérience authentique du Breakout original avec des mécaniques simples mais engageantes : rebondir une balle sur une raquette pour détruire des briques.

## 2. Users and Actors

| Actor | Description |
|---|---|
| Joueur | Personne jouant au jeu Breakout. Contrôle la raquette via clavier et interagit avec les menus à la souris. |
| Système | Engine de jeu gérant la physique, la détection des collisions et la progression du jeu. |

## 3. Problems to Solve

- Besoin d'une implémentation simple et accessible d'un jeu Breakout sans dépendances externes
- Besoin de mécaniques de jeu fluides : mouvement de la balle, collisions, destruction de briques
- Besoin d'une gestion claire des états de jeu (menu, en cours, victoire, défaite)
- Besoin d'une interface intuitive pour le joueur avec contrôles clavier et interaction souris

## 4. Product Goals

1. Offrir une expérience de jeu Breakout fonctionnelle et jouable en V1
2. Implémenter les mécaniques de base sans complexité excessive
3. Maintenir un code vanilla sans dépendances pour garantir la maintenabilité
4. Fournir une base solide pour des améliorations futures (niveaux, score, power-ups)

## 5. Out of Scope

- Système de niveaux progressifs (non inclus en V1)
- Système de score avec classement
- Power-ups ou bonus spéciaux
- Animation ou effets sonores avancés
- Mode multijoueur
- Sauvegarde de progression
- Responsive design pour mobile (focus desktop)

## 6. Business Concepts

| Concept | Description |
|---|---|
| **Balle** | Objet se déplaçant dans l'aire de jeu, rebondissant sur les obstacles et la raquette |
| **Raquette** | Contrôlée par le joueur, permet de relancer la balle pour éviter la défaite |
| **Briques** | Éléments à détruire disposés en mur. 5 lignes de briques en V1 |
| **Vies** | Le joueur commence avec 3 vies. Une vie est perdue si la balle sort en bas de l'écran |
| **Aire de jeu** | Zone de jeu délimitée par des murs (gauche, droite, haut) et un bas où la balle se perd |
| **Vitesse de la balle** | Paramètre ajustable via slider (lent à rapide) avant le lancement d'une partie |

## 7. Product Capabilities

### V1 Capabilities

1. **Aire de jeu avec mur de briques**
   - Affichage d'une grille de briques (5 lignes)
   - Les briques sont visuellement distinctes et destructibles

2. **Physique et collisions**
   - Balle rebondissant sur les murs (gauche, droite, haut)
   - Balle rebondissant sur le plafond
   - Balle rebondissant sur la raquette avec angle variable selon le point de contact
   - Détection de collision avec les briques — destruction à contact

3. **Système de vies**
   - 3 vies au démarrage
   - Une vie perdue si la balle sort en bas de l'écran
   - Affichage du nombre de vies restantes

4. **Conditions de fin**
   - **Victoire** : Toutes les briques sont détruites
   - **Défaite** : Le joueur n'a plus de vies
   - Écran de fin approprié pour chaque condition

5. **Contrôles**
   - Raquette contrôlée par **flèche gauche** et **flèche droite** du clavier
   - Mouvements fluides et réactifs

6. **Interface de menu**
   - Menu principal avec boutons pour : Démarrer, Quitter
   - Menu de fin de partie avec : Rejouer, Quitter
   - Tous les boutons interactifs à la souris (click)

7. **Slider de vitesse**
   - Ajustement de la vitesse de la balle avant le lancement
   - Échelle : lent → rapide
   - Impact visible sur le gameplay immédiatement au lancement

## 8. High-Level Workflows

### Workflow : Commencer une partie

```
1. Joueur ouvre le jeu → affichage du menu principal
2. Joueur clique sur "Démarrer"
3. Joueur peut ajuster la vitesse de la balle via le slider
4. Joueur clique pour lancer la balle
5. Le gameplay commence
```

### Workflow : Gameplay

```
1. Balle est en mouvement
2. Joueur contrôle la raquette (flèches gauche/droite)
3. Balle rebondit sur obstacles et briques
4. Briques détruites au contact
5. Vies décrémentées si balle sort en bas
6. Boucle jusqu'à victoire ou défaite
```

### Workflow : Fin de partie

```
1. Condition de fin atteinte (victoire ou défaite)
2. Affichage d'un écran de fin avec le résultat
3. Joueur peut : Rejouer (nouvelle partie) ou Quitter (au menu)
```

## 9. Business Rules

1. **Rebond de la balle**
   - La balle rebondit à 45° ou variante selon la surface touchée
   - Le rebond sur la raquette varie légèrement selon le point d'impact (bord gauche → angle plus à gauche, etc.)

2. **Destruction de briques**
   - Une brique est détruite au premier contact avec la balle
   - Une seule brique peut être détruite par rebond

3. **Gestion des vies**
   - Le joueur perd une vie si la balle dépasse le bas de l'écran
   - La balle est réinitialisée au-dessus de la raquette après la perte d'une vie
   - Le joueur ne peut pas perdre de vie supplémentaire en même temps

4. **Vitesse de la balle**
   - La vitesse est un paramètre ajustable (slider) avant le lancement
   - La vitesse reste constante pendant la partie (sauf rebonds qui changent direction)
   - La vitesse ne dépend pas du nombre de briques détruites (pas de progressivité en V1)

5. **Conditions de fin**
   - **Victoire** : Nombre de briques restantes == 0
   - **Défaite** : Nombre de vies restantes == 0 après une perte

6. **État du menu**
   - Le menu est toujours accessible via les boutons de fin de partie
   - Quitter la partie revient au menu principal

## 10. Success Criteria

- [ ] Jeu complètement jouable et fonctionnel sans erreurs critiques
- [ ] La balle rebondit correctement sur tous les obstacles
- [ ] Les briques se détruisent au contact de la balle
- [ ] Système de vies fonctionne correctement (3 vies, perte au bas)
- [ ] Les conditions de victoire et défaite se déclenchent correctement
- [ ] Les contrôles clavier (flèches) sont réactifs et fluides
- [ ] Le slider de vitesse impacte visiblement le gameplay
- [ ] Tous les menus sont fonctionnels et navigables à la souris
- [ ] Code vanilla sans dépendances externes

## 11. Open Questions

- Doit-on afficher un score ou un compteur de briques restantes ?
- Quelle est la taille idéale de chaque brique relative à la balle ?
- Quel nombre de briques par ligne (nombre total de briques) ?
- La raquette doit-elle avoir une vitesse de mouvement ou être instantanée ?
- Y a-t-il des visuels/couleurs spécifiques attendus ?
