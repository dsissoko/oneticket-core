---
title: 'Product Specification - Breakout Game'
---

# Breakout — Game Product Specification

<!-- Jeu arcade Breakout en JavaScript vanilla : détruire des briques avec une balle rebondissante et une raquette contrôlée au clavier. -->

## 1. Vision

Créer un jeu arcade Breakout classique en JavaScript vanilla (HTML/CSS/JS) sans dépendances externes, offrant une expérience de jeu nostalgique et accessible. Le jeu met l'accent sur la mécanique simple mais engageante : détruire des briques avec une balle rebondissante tout en gérant trois vies.

## 2. Users and Actors

| Acteur | Description |
|---|---|
| **Joueur casual** | Personne cherchant une expérience de jeu arcade classique, avec peu de complexité mais riche en interaction. |
| **Système de jeu** | Gère la physique des rebonds, la collision, le score et l'état du jeu. |

## 3. Problems to Solve

- Les joueurs recherchent une expérience de jeu rétro sans configuration complexe.
- Manque de contrôle accessible sur la vitesse de jeu pour adapter le niveau de difficulté.
- Interface intuitive pour démarrer, rejouer et quitter une partie rapidement.

## 4. Product Goals

1. Fournir une mécanique de jeu Breakout fluide et responsive.
2. Offrir une difficulté configurable via un slider de vitesse.
3. Suivre l'état du joueur (vies, briques restantes) de manière claire.
4. Supporter les interactions au clavier (raquette) et souris (menus).
5. Délivrer le jeu en JavaScript vanilla sans dépendances externes.

## 5. Out of Scope

- Systèmes de niveaux ou progression de difficulté progressive.
- Power-ups ou objets spéciaux tombant du ciel.
- Multiplayer ou modes compétitifs.
- Sauvegarde de score persistante ou classements.
- Animations 3D ou graphismes avancés.
- Audio ou musique de fond (version 1.0).

## 6. Business Concepts

| Concept | Définition |
|---|---|
| **Balle** | Objet en mouvement qui rebondit sur les murs, le plafond, la raquette et détruit les briques au contact. |
| **Raquette** | Contrôle du joueur qui intercepte la balle pour la relancer vers le haut. Positionnée en bas de l'aire de jeu. |
| **Briques** | Objectifs à détruire. Disposées en 5 lignes horizontales au-dessus de l'aire de jeu. |
| **Mur** | Limites latérales de l'aire de jeu contre lesquelles la balle rebondit. |
| **Plafond** | Limite supérieure de l'aire de jeu contre laquelle la balle rebondit. |
| **Vies** | Ressource du joueur. Diminue d'une unité quand la balle atteint le bas sans être interceptée. Partie perdue à 0 vies. |
| **Vitesse de balle** | Paramètre ajustable via slider. Affecte la vélocité linéaire de la balle en pixels par frame. |

## 7. Product Capabilities

| Capacité | Description |
|---|---|
| **Contrôle raquette au clavier** | Mouvement gauche/droite via flèches du clavier (←/→). |
| **Physique de rebond** | La balle rebondit sur les murs, plafond, raquette et briques avec angle de réflexion calculé. |
| **Détection de collision** | Système de collision entre balle et tous les éléments statiques/dynamiques. |
| **Gestion des vies** | Affichage du compteur de vies ; perte d'une vie au-dessous de la raquette. |
| **Destruction des briques** | Suppression d'une brique au contact de la balle ; compteur mis à jour. |
| **Slider de vitesse** | Contrôle continu de la vitesse de balle (très lente → très rapide). |
| **Menus interactifs** | Écrans pour Démarrer, Rejouer, Quitter accessibles à la souris. |
| **Affichage d'état** | Affichage en temps réel des vies, briques restantes et statut du jeu (en cours, game over, victoire). |

## 8. High-Level Workflows

### Workflow 1 : Démarrage d'une partie

1. Joueur accède au menu principal.
2. Joueur clique sur "Démarrer" (interaction souris).
3. Jeu initialise l'aire de jeu avec briques (5 lignes), raquette en bas, balle au repos sur la raquette.
4. Joueur peut ajuster la vitesse via le slider avant ou pendant le jeu.
5. Joueur appuie sur une flèche (←/→) ou clique sur l'aire de jeu pour lancer la balle.
6. Partie commence.

### Workflow 2 : Jeu en cours

1. Balle rebondit automatiquement sur les murs, plafond et raquette.
2. Joueur contrôle la raquette au clavier pour intercepter la balle.
3. Balle détruit les briques au contact.
4. Joueur observe le compteur de vies et le nombre de briques restantes.
5. Jeu continue jusqu'à victoire (0 briques) ou défaite (0 vies).

### Workflow 3 : Fin de partie

1. Condition de victoire : toutes les briques détruites → affichage "Victoire !".
2. Condition de défaite : plus de vies → affichage "Game Over".
3. Joueur clique sur "Rejouer" pour réinitialiser ou "Quitter" pour fermer.

## 9. Business Rules

| Règle | Contexte |
|---|---|
| **Vies initiales** | Le joueur commence avec 3 vies. |
| **Balle au-dessous** | Si la balle franchit la limite basse sans être interceptée, perte d'une vie. |
| **Balle bloquée en bas** | La partie s'arrête immédiatement après perte de la dernière vie. |
| **Briques détruites** | Chaque collision balle-brique détruit une brique (pas de points cumulatifs v1.0). |
| **Victoire** | Toutes les briques de l'aire de jeu sont détruites avant la perte de 3 vies. |
| **Vitesse ajustable** | Le slider permet des ajustements continus sans interruption du jeu. |
| **Raquette limites** | La raquette reste dans les limites latérales de l'aire de jeu (pas de sortie). |
| **Balle rebond** | Angle de rebond = angle d'incidence (loi de réflexion simple). |

## 10. Success Criteria

- [ ] Jeu Breakout fonctionnel en JavaScript vanilla sans erreurs de rendu ou crash.
- [ ] Balle rebondit correctement sur tous les éléments (murs, plafond, raquette, briques).
- [ ] Joueur peut contrôler la raquette fluidement au clavier (←/→).
- [ ] Vies gérées correctement : affichage et décrément au moment opportun.
- [ ] Toutes les briques détruites = écran de victoire.
- [ ] 0 vies = écran de défaite (game over).
- [ ] Slider de vitesse fonctionne et affecte la balle en temps réel.
- [ ] Menus (Démarrer, Rejouer, Quitter) réactifs à la souris.
- [ ] Aire de jeu affiche l'état en temps réel (vies, briques, statut).
- [ ] Code bien structuré, lisible et sans dépendances externes.

## 11. Open Questions

1. Quel est le nombre exacte de briques par ligne ? (Pas précisé : à définir avec le PO).
2. Y a-t-il une taille/hauteur fixe pour l'aire de jeu, ou responsive ?
3. La vitesse initiale de la balle est-elle définie, ou héritée du slider ?
4. L'angle du rebond sur la raquette tient-il compte du point de contact (gauche/centre/droite) ?
5. Y a-t-il un score affiché (même sans système de points) pour suivi du joueur ?
6. La couleur des briques dépend-elle de la rangée, ou uniforme ?
