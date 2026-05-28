---
title: 'Breakout Product Specification'
---

# Breakout — Spécification Produit

<!-- SITE_DESCRIPTION: Jeu Breakout arcade JavaScript vanilla — destruction de briques, gestion de balle, contrôle à la raquette -->

## 1. Vision

Breakout est un jeu arcade frontend rétro basé sur le classique des années 1970. Le joueur contrôle une raquette pour faire rebondir une balle et détruire un mur de briques. Le jeu offre une expérience de gameplay simple mais engageante, sans dépendances externes et entièrement en JavaScript vanilla.

## 2. Utilisateurs et Acteurs

- **Joueur** : L'utilisateur qui joue au jeu en contrôlant la raquette, détruisant les briques et essayant d'atteindre la victoire avant d'épuiser ses vies.

## 3. Problèmes à Résoudre

1. Offrir une expérience arcade classique et accessible en frontend pur
2. Permettre au joueur de contrôler précisément le jeu avec le clavier
3. Gérer la physique de la balle (rebonds, collisions)
4. Suivre l'état du jeu (vies, briques restantes, victoire/défaite)
5. Permettre l'ajustement de la difficulté via la vitesse de la balle

## 4. Objectifs Produit

- V1 : Jeu Breakout fonctionnel avec gameplay de base et menus
- Simplicité maximale : zéro dépendance, HTML/CSS/JS vanilla uniquement
- Jouabilité satisfaisante : contrôles réactifs et physique prévisible
- Configurable : vitesse de la balle ajustable via slider

## 5. Hors Périmètre (V1)

- Système de niveaux ou progression
- Score ou classements
- Effets sonores ou musique
- Animations avancées
- Multijoueur
- Persistance (sauvegarde de progression)
- Intelligence artificielle ennemie

## 6. Concepts Métier

- **Raquette** : Élément contrôlé par le joueur, située au bas de l'écran. Mouvements gauche/droite uniquement.
- **Balle** : Projectile qui rebondit sur les murs, le plafond, la raquette et les briques.
- **Briques** : Éléments destructibles organisés en mur sur 5 lignes. Une collision balle-brique détruit la brique.
- **Vies** : Le joueur dispose de 3 vies. Chaque fois que la balle atteint le bas de l'écran, une vie est perdue.
- **Vitesse de balle** : Paramètre ajustable via slider accessible depuis le menu (plage : très lente → très rapide).

## 7. Capacités Produit

1. **Affichage du jeu** : Rendu du mur de briques (5 lignes), de la raquette et de la balle
2. **Contrôle de la raquette** : Déplacement via flèches gauche/droite du clavier
3. **Physique de la balle** : Rebonds sur les murs, plafond, raquette et briques ; destruction des briques au contact
4. **Gestion des vies** : Décrément de 1 à chaque fois que la balle atteint le bas ; affichage des vies restantes
5. **États du jeu** : Menu principal, jeu en cours, victoire, défaite (game over)
6. **Ajustement de difficulté** : Slider accessible depuis le menu pour modifier la vitesse de la balle
7. **Navigation menus** : Souris pour cliquer sur les boutons (démarrer, rejouer, quitter)

## 8. Workflows de Haut Niveau

### Démarrage du jeu
1. Affichage du menu principal (boutons : Démarrer, Paramètres, Quitter)
2. Joueur clique "Démarrer"
3. Menu des paramètres s'ouvre (slider vitesse balle)
4. Joueur valide et la partie démarre

### Gameplay
1. Balle se déplace et rebondit
2. Joueur contrôle la raquette avec flèches gauche/droite
3. Collisions détruisent les briques
4. Si balle atteint le bas : perte de 1 vie et reset de la balle
5. Si vies = 0 : game over
6. Si briques = 0 : victoire

### Fin de partie
1. Affichage de l'écran de résultat (victoire ou défaite)
2. Menu de rejouer ou quitter

## 9. Règles Métier

- **Composition du mur** : 5 lignes de briques organisées de manière régulière
- **Nombre de vies** : 3 vies initiales, aucune vies bonus
- **Vitesse de balle** : Ajustable via slider ; affecte directement la vélocité
- **Rebonds** : La balle rebondit sur les murs (gauche/droite), le plafond, la raquette et les briques
- **Destruction** : Chaque collision balle-brique détruit la brique immédiatement
- **Conditions de défaite** : Zéro vies restantes
- **Conditions de victoire** : Zéro briques restantes (mur entièrement détruit)
- **Contrôles** : Flèches gauche/droite pour la raquette, souris pour les menus uniquement

## 10. Critères de Succès

- ✅ Jeu complet et jouable en JavaScript vanilla
- ✅ Pas de dépendances externes
- ✅ Contrôles réactifs et intuitifs
- ✅ Physique de balle crédible
- ✅ États du jeu clairs (menu, gameplay, victoire, défaite)
- ✅ Slider vitesse fonctionnel et perceptible
- ✅ Pas de bugs critiques affectant la jouabilité

## 11. Questions Ouvertes

- Quelle palette de couleurs pour le design ? (classique arcade, modern minimal, etc.)
- Faut-il des pauses/reprises dans le gameplay ?
- Quelle doit être la taille de l'aire de jeu par rapport à la fenêtre ?
