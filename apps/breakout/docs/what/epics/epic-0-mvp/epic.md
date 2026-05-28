---
title: 'Epic 0 — MVP Breakout'
---

# Epic 0 — MVP Breakout

## Goal

Créer une implémentation fonctionnelle et jouable d'un jeu Breakout classique en JavaScript vanilla (HTML/CSS/JS) sans dépendances externes. Le jeu doit offrir une expérience de gameplay complète avec les mécaniques essentielles : contrôle de la raquette, rebonds de balle, destruction de briques, gestion des vies et conditions de fin.

## Business Value

- **Expérience utilisateur complète** : Jouabilité fluide et intuitive dès le lancement
- **Fondation solide** : Base technique stable pour des améliorations futures (niveaux, power-ups, score avancé)
- **Code maintenable** : Implémentation vanilla sans dépendances externes pour garantir la pérennité du projet
- **Validation du concept** : Démontrer la faisabilité d'un jeu arcade classique en technologies web standard

## Scope

### Inclus en V1

1. **Système de jeu de base**
   - Aire de jeu délimitée (murs gauche, droite, haut)
   - Grille de briques (5 lignes) disposées en haut de l'écran
   - Balle physique se déplaçant dans l'aire
   - Raquette contrôlable par le joueur

2. **Mécanique de jeu**
   - Rebonds de balle sur les murs (gauche, droite, haut)
   - Rebonds de balle sur la raquette avec angle variable selon le point de contact
   - Détection de collision avec les briques — destruction au premier contact
   - Gestion des vies (3 vies au démarrage, perte si balle sort en bas)

3. **Interface utilisateur**
   - Menu principal avec boutons : Démarrer, Quitter
   - Écran de sélection/contrôle avec slider de vitesse (avant lancement)
   - Affichage en jeu du nombre de vies restantes
   - Écran de fin (victoire ou défaite) avec boutons : Rejouer, Quitter

4. **Contrôles**
   - Clavier : flèche gauche et flèche droite pour déplacer la raquette
   - Souris : click sur les boutons des menus et du slider

5. **Paramétrage**
   - Slider ajustable de vitesse de la balle (lent → rapide)
   - Vitesse constante pendant la partie

### Exclus en V1

- Système de niveaux progressifs
- Système de score avec classement
- Power-ups ou bonus spéciaux
- Animation ou effets sonores avancés
- Mode multijoueur
- Sauvegarde de progression
- Responsive design pour mobile (focus desktop uniquement)

## Related User Stories

Les user stories suivantes implémentent cet epic :

- US-001 — Initialiser le jeu et afficher le menu principal
- US-002 — Implémenter la physique et les rebonds de balle
- US-003 — Gérer la détection des collisions avec les briques
- US-004 — Implémenter le système de vies
- US-005 — Créer l'interface de contrôle et le slider de vitesse
- US-006 — Implémenter les conditions de fin (victoire/défaite)
- US-007 — Gérer la navigation entre les menus et les états de jeu

## Related Slices

Les slices d'implémentation suivants structurent le travail technique :

- Slice 1 — Configuration du projet et structure HTML/CSS de base
- Slice 2 — Moteur de jeu (boucle, physique, détection de collisions)
- Slice 3 — Système d'état et gestion des menus
- Slice 4 — Intégration complète et test de gameplay
