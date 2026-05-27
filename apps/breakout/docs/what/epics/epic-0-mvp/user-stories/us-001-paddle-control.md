# User Story 001: Contrôler la raquette avec les flèches

## Summary
Permettre au joueur de contrôler une raquette avec les flèches gauche et droite pour renvoyer la balle

## Use Case

- **As a** joueur
- **I want to** contrôler une raquette avec les flèches gauche et droite
- **so that** je peux renvoyer la balle et continuer le jeu

## Acceptance Criteria

### Scenario 1: Mouvement vers la gauche
- **Given** le jeu est en cours
- **When** l'utilisateur appuie sur la flèche gauche
- **Then** la raquette se déplace vers la gauche

### Scenario 2: Limite gauche de l'aire de jeu
- **Given** la raquette est à la limite gauche de l'aire de jeu
- **When** l'utilisateur appuie sur la flèche gauche
- **Then** la raquette ne dépasse pas le bord

### Scenario 3: Mouvement vers la droite
- **Given** le jeu est en cours
- **When** l'utilisateur appuie sur la flèche droite
- **Then** la raquette se déplace vers la droite

### Scenario 4: Limite droite de l'aire de jeu
- **Given** la raquette est à la limite droite de l'aire de jeu
- **When** l'utilisateur appuie sur la flèche droite
- **Then** la raquette ne dépasse pas le bord

## Technical Tasks

1. Structure HTML pour la raquette
2. Styling CSS pour l'affichage et les animations
3. Event listeners pour les touches clavier (ArrowLeft, ArrowRight)
4. Logique de déplacement avec gestion des limites de l'aire de jeu
5. Tests unitaires pour les mouvements et les limites

## Definition of Done

- ✅ La raquette se déplace correctement avec les flèches
- ✅ Les limites de l'aire de jeu sont respectées
- ✅ Pas de lag ou de saccades
- ✅ Les événements clavier sont robustes
- ✅ Tests automatisés en place
