# EPIC-4 : Système de briques et collisions

## Description
L'EPIC-4 couvre la création complète du système de briques et de collisions pour le jeu Breakout. Cet epic inclut la création et la gestion de la grille de briques, leur rendu visuel, la détection et la gestion des collisions entre la balle et les briques, ainsi que la destruction des briques lorsqu'elles sont impactées par la balle.

Ce système est fondamental au gameplay du jeu, permettant aux joueurs d'interagir avec les éléments du jeu et de progresser en détruisant les briques pour augmenter leur score.

## User Stories

### US-4.1 Créer la grille de briques
Créer la structure de données et l'initialisation pour une grille de briques configurable, permettant de définir les positions, dimensions et propriétés de chaque brique dans le jeu.

### US-4.2 Implémenter le rendu des briques
Implémenter le système de rendu visuel des briques avec les bonnes dimensions, couleurs et positionnement sur l'écran de jeu.

### US-4.3 Gérer les collisions balle-briques
Implémenter le système de détection des collisions entre la balle et les briques, calculant les points d'impact et les directions de rebond appropriées.

### US-4.4 Détruire les briques après impact
Implémenter la logique de destruction des briques suite à un impact avec la balle, mettant à jour le score et l'état du jeu.
