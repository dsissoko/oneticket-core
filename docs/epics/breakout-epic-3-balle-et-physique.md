# EPIC-3 : Mécanique de balle (physique simple)

## Description

L'EPIC-3 couvre l'implémentation complète de la mécanique de la balle dans le jeu Breakout. Cet epic est centré sur la création d'une balle jouable avec une trajectoire fluide et une physique simple mais efficace. Les éléments clés incluent :

- **Création et rendu de la balle** : Représentation visuelle de la balle sous forme de cercle ou de sprite
- **Mouvement et trajectoire** : Implémentation du système de mouvement basique avec vitesse vectorielle
- **Rebonds sur les murs** : Gestion des collisions avec les limites de l'écran
- **Rebonds sur la raquette** : Interaction intelligente avec la raquette du joueur incluant une déflection basée sur l'angle de frappe

## Objectifs

- Mettre en place une mécanique de balle fluide et prévisible
- Assurer que la balle interagit correctement avec tous les éléments du jeu
- Fournir une base solide pour l'ajout de briques et d'autres éléments de jeu

## User Stories

### US-3.1 : Créer l'objet balle et son rendu
Créer la classe/structure de la balle avec les propriétés nécessaires (position, rayon, couleur) et implémenter le rendu de la balle à l'écran.

### US-3.2 : Implémenter le mouvement et les rebonds sur les murs
Mettre en place le système de mouvement de la balle avec vitesse vectorielle et gérer les rebonds sur les quatre murs de l'écran de jeu.

### US-3.3 : Gérer les rebonds sur la raquette avec angle de déflection
Implémenter la collision entre la balle et la raquette, permettant une déflection de la balle en fonction de l'endroit où elle frappe la raquette.
