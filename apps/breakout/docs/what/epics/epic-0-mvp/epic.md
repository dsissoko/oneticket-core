---
title: 'Epic 0 — MVP Breakout'
---

# Epic 0 — MVP Breakout

## Goal

Livrer une version jouable du jeu Breakout classique : le joueur contrôle une raquette pour destruire un mur de briques avec une balle rebondissante, avec gestion des vies et paramétrage de la vitesse.

## Business Value

- Produit jouable et divertissant prêt pour les utilisateurs finaux
- Démontre la faisabilité d'un jeu frontend vanilla sans dépendances externes
- Fournit une base solide pour des améliorations futures (niveaux, sauvegardes, etc.)

## Scope

Inclus :
- Jeu fonctionnel avec aire de jeu, mur de briques, balle rebondissante, raquette
- Gestion des vies (3 vies initiales, perte au-delà de la limite basse)
- États de jeu clairs : menu, jeu en cours, victoire, défaite
- Menus pour démarrer, rejouer, quitter
- Slider de vitesse de balle ajustable depuis le menu
- Contrôles au clavier (flèches) et souris (menus)

Non inclus :
- Système de niveaux ou progression
- Sauvegardes de partie ou scores persistants
- Animations ou effets visuels avancés
- Support multijoueur

## Related User Stories

- US-001 — Initialiser l'aire de jeu
- US-002 — Implémenter la physique de la balle
- US-003 — Implémenter la raquette et ses contrôles
- US-004 — Gérer les vies et la fin de partie
- US-005 — Créer le système de menus
- US-006 — Implémenter le slider de vitesse

## Related Slices

- Slice 1 — Moteur de rendu et boucle de jeu
- Slice 2 — Physique de la balle et collisions
- Slice 3 — Interface utilisateur et menus
