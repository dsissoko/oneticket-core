# Product Specification — Breakout

<!-- SITE_DESCRIPTION: Un jeu arcade Breakout vanilla JavaScript où le joueur casse des briques avec une balle rebondissante. 3 vies, vitesse réglable. -->

## 1. Vision

Breakout est un jeu arcade classique en JavaScript vanilla qui capture l'essence du gameplay rétro : détruire un mur de briques en contrôlant une raquette pour garder une balle en jeu. Le jeu offre une expérience simple, accessible et entièrement jouée au clavier (flèches gauche/droite) ou à la souris (menus). Aucune dépendance externe, pas de progression multi-niveaux, juste du pur gameplay arcade.

## 2. Users and Actors

- **Joueur arcade** — Personne cherchant un divertissement rapide et classique. Utilise les flèches gauche/droite pour contrôler la raquette, souris pour naviguer les menus.
- **Navigateur** — Environnement d'exécution. Le jeu s'affiche en HTML/CSS/JS vanilla, compatible avec tous les navigateurs modernes.

## 3. Problems to Solve

- Fournir une expérience de jeu arcade classique reconnue et facile à comprendre
- Offrir un contrôle réactif et précis du gameplay
- Permettre une personnalisation simple du rythme de jeu (vitesse réglable)
- Conserver une implémentation légère sans dépendances externes

## 4. Product Goals

1. Livrer une version jouable complète du Breakout arcade
2. Offrir une courbe de difficulté contrôlée (vitesse ajustable via slider)
3. Fournir des retours clairs au joueur (vies, destruction de briques, états de jeu)
4. Garantir une expérience sans friction : contrôles simples, démarrage immédiat

## 5. Out of Scope

- Système de niveaux ou progression
- Persistance des scores (sauvegarde locale) — hors scope MVP
- Powerups ou bonus spéciaux
- Éléments visuels avancés (particules, animations complexes)
- Sons et musiques
- Multijoueur

## 6. Business Concepts

| Concept | Description |
|---------|-------------|
| **Brique** | Bloc destructible dans le mur. 5 lignes, disposition quadrillée. Détruite au contact de la balle. |
| **Balle** | Projectile rebondissant. Rebondit sur les murs, le plafond, la raquette et les briques. Cause une perte de vie si elle atteint le bas. |
| **Raquette** | Contrôleur du joueur. Se déplace horizontalement (gauche/droite) pour intercepter la balle. Fixée en bas du terrain. |
| **Vies** | Resource du joueur. Le joueur commence avec 3 vies. Chaque fois que la balle sort par le bas, une vie est perdue. Jeu terminé à 0 vies. |
| **Score** | Compteur affiché durant le jeu. Incrément fixe par brique détruite (logique simple, pas de multiplicateur). |
| **Vitesse** | Paramètre ajustable du jeu. Contrôle la vélocité de la balle. Gamme : très lente à très rapide (via slider dans le menu). |
| **État de jeu** | État actuel (menu principal, en cours de jeu, game over, victoire). Détermine le rendu et les interactions possibles. |

## 7. Product Capabilities

1. **Démarrage du jeu** — Menu principal avec bouton "Démarrer" et "Quitter". Option slider pour régler la vitesse de la balle.
2. **Gameplay** — Affichage du terrain, mur de briques (5 lignes), raquette mobile, balle rebondissante, affichage en temps réel des vies et du score.
3. **Contrôles clavier** — Flèches gauche/droite pour déplacer la raquette. Aucune autre interaction clavier en jeu.
4. **Contrôles souris** — Interaction avec les boutons de menu (Démarrer, Rejouer, Quitter). Pas de pointeur en jeu.
5. **Menus** — Menu principal (avant jeu), menu game over (rejouer/quitter), menu victoire (rejouer/quitter).
6. **Réglage de vitesse** — Slider accessible depuis le menu principal, gamme paramétrable (ex. 1-10), appliqué avant démarrage.

## 8. High-Level Workflows

### Workflow 1 : Démarrer et jouer une partie
1. Joueur ouvre l'application → Menu principal affiche le slider de vitesse et boutons "Démarrer" et "Quitter"
2. Joueur ajuste le slider de vitesse (optionnel)
3. Joueur clique "Démarrer" → Jeu passe en mode "En cours de jeu"
4. Terrain s'affiche : mur de briques (5 lignes), raquette en bas, balle au centre en haut
5. Balle commence à rebondir automatiquement
6. Joueur utilise flèches gauche/droite pour contrôler la raquette
7. Balle rebondit sur les murs, le plafond, la raquette et les briques
8. Chaque brique détruite incrément le score
9. Workflow continue jusqu'à game over ou victoire

### Workflow 2 : Perdre une vie (Game Over)
1. Balle atteint le bas de l'écran sans être interceptée
2. Jeu soustrait 1 à "Vies"
3. Si Vies > 0 : Balle réinitialise en haut, jeu reprend
4. Si Vies = 0 : Jeu passe en mode "Game Over" → Menu game over (Rejouer/Quitter)

### Workflow 3 : Gagner (Toutes les briques détruites)
1. Dernière brique est détruite
2. Jeu détecte que le mur est vide
3. Jeu passe en mode "Victoire" → Menu victoire (Rejouer/Quitter)

### Workflow 4 : Rejouer ou Quitter
1. Depuis le menu game over ou victoire :
   - Joueur clique "Rejouer" → Réinitialise le terrain, les vies (3), le score (0), et reprend depuis le menu principal
   - Joueur clique "Quitter" → Ferme le jeu ou retourne au menu principal

## 9. Business Rules

| Règle | Description | Critère d'entrée | Action | Critère de sortie |
|-------|-------------|-----------------|--------|-------------------|
| **R1 : Initier une partie** | Joueur appuie sur "Démarrer" depuis le menu | État = Menu, bouton cliqué | Réinitialise score (0), vies (3), balle en haut, briques intactes | État = En jeu, balle rebondit |
| **R2 : Rebond sur les murs** | Balle touche mur gauche/droit | Balle en mouvement, X atteint limite | Inverse direction horizontale (vX = -vX) | Balle continue dans nouvelle direction |
| **R3 : Rebond sur le plafond** | Balle touche le plafond | Balle en mouvement, Y ≤ 0 | Inverse direction verticale (vY = -vY) | Balle continue dans nouvelle direction |
| **R4 : Rebond sur la raquette** | Balle touche la raquette | Balle en mouvement, Y au niveau raquette, X dans zone raquette | Inverse direction verticale (vY = -vY) | Balle continue vers le haut |
| **R5 : Collision avec brique** | Balle touche une brique | Balle en mouvement, brique intacte | Brique détruite, score += 1, inverse direction balle (haut/bas selon côté) | Brique supprimée, balle continue |
| **R6 : Balle sort en bas** | Balle dépasse Y = hauteur écran | Balle en mouvement, Y > limite bas | Vies -= 1. Si Vies > 0 : Réinitialise balle en haut. Si Vies = 0 : État = Game Over | État = Game Over OU balle réinitialisée |
| **R7 : Victoire** | Toutes les briques détruites | Nombre briques = 0 | État = Victoire, affiche menu victoire | Menu victoire actif |
| **R8 : Vitesse configurable** | Joueur règle le slider avant démarrage | Menu principal actif, slider accessible | vX et vY initiaux réglés selon slider | Vitesse appliquée au lancement |
| **R9 : Contrôle clavier uniquement** | Flèches gauche/droite contrôlent la raquette | État = En jeu | Flèche gauche : raquette se déplace à gauche (X -= vitesseRaquette). Flèche droite : raquette se déplace à droite (X += vitesseRaquette) | Raquette repositionnée |
| **R10 : Limites raquette** | Raquette ne dépasse pas les murs | Raquette en mouvement | Raquette X limité à [0, largeur écran - largeur raquette] | Raquette reste visible et valide |

## 10. Success Criteria

1. **Jeu jouable** — Une partie complète (démarrage → victoire ou game over) peut être jouée sans erreurs
2. **Contrôles réactifs** — Flèches gauche/droite répondent immédiatement, sans latence perceptible
3. **Physique de balle correcte** — Rebonds calculés correctement sur tous les éléments (murs, plafond, raquette, briques)
4. **Gestion des vies** — Perte de vies et game over détectés correctement
5. **Détection de victoire** — Destruction de toutes les briques détectée, victoire affichée
6. **Vitesse ajustable** — Slider fonctionne, vitesse appliquée au lancement, vraiment perceptible en jeu
7. **Menus fonctionnels** — Clics souris sur boutons (Démarrer, Rejouer, Quitter) fonctionnent correctement
8. **Pas de dépendances externes** — Code vanilla JavaScript/HTML/CSS uniquement

## 11. Open Questions

- Taille exacte de chaque brique (pixels) et espacement entre briques ?
- Vitesse de déplacement de la raquette : fixe ou basée sur la vélocité de la balle ?
- Animation de destruction de brique (disparition immédiate ou fade out) ?
- Sons/feedback visuel au contact brique/balle ?
