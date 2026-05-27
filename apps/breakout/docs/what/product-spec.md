---
title: 'Product Specification'
---

# Product Specification

<!-- SITE_DESCRIPTION: Jeu arcade Breakout frontend en JavaScript vanilla avec mur de briques, balle rebondissante et gestion des vies -->

## 1. Vision

Créer un jeu Breakout classique entièrement en JavaScript frontend (HTML/CSS/JS vanilla, sans dépendances externes) : le joueur contrôle une raquette pour envoyer une balle détruire un mur de briques, avec un système de vies et des paramètres ajustables.

## 2. Users and Actors

- **Joueur** : personne qui joue au jeu, utilise les flèches du clavier pour mouvoir la raquette et la souris pour naviguer les menus

## 3. Problems to Solve

- Besoin d'un jeu casual et rétro accessible depuis le navigateur sans installation
- Expérience de jeu fluide avec feedback physique clair (rebonds, destruction de briques)
- Paramétrage facile de la difficulté via la vitesse de la balle

## 4. Product Goals

1. Livrer un jeu Breakout jouable et divertissant
2. Permettre au joueur d'ajuster la vitesse de la balle selon ses préférences
3. Fournir une expérience de jeu claire avec gestion des vies et états (jeu en cours, victoire, défaite)

## 5. Out of Scope

- Système de niveaux et progression
- Sauvegardes de partie ou scores persistants
- Effets visuels avancés ou animations sophistiquées
- Support multijoueur
- Intégration avec un backend/serveur

## 6. Business Concepts

- **Mur de briques** : grille de briques destructibles (5 lignes)
- **Balle** : objet rebondissant sur les parois, plafond, raquette
- **Raquette** : contrôlée au clavier, barre mobile horizontalement
- **Vies** : le joueur commence avec 3 vies, en perd 1 si la balle tombe en bas
- **Vitesse** : paramètre ajustable de très lente à très rapide via slider

## 7. Product Capabilities

1. **Jeu jouable** : aire de jeu avec briques, balle rebondissante, raquette mobile
2. **Gestion des vies** : affichage du nombre de vies, perte de vie au-delà de la limite basse
3. **États de jeu** : menu de démarrage, jeu en cours, victoire (toutes briques détruites), défaite (0 vies)
4. **Paramétrage de difficulté** : slider de vitesse de balle accessible depuis le menu
5. **Menus** : écran de démarrage, écran de fin (victoire/défaite), option rejouer/quitter

## 8. High-Level Workflows

### Démarrage de partie
1. Joueur voit le menu principal
2. Joueur clique sur « Démarrer »
3. Jeu initialise l'aire de jeu avec le mur de briques complet
4. Balle est immobile sur la raquette, prête à être lancée
5. Joueur clique pour lancer la balle

### Jeu en cours
1. Balle rebondit sur les parois, plafond, raquette et briques
2. Chaque brick détruite est retirée de l'écran
3. Joueur déplace la raquette avec flèches gauche/droite
4. Si balle atteint le bas : perte d'une vie, balle repositionnée sur raquette
5. Si 0 vies restantes : game over
6. Si toutes les briques détruites : victoire

### Fin de partie
1. Affichage de l'écran de victoire ou défaite
2. Joueur peut rejouer (nouvelle partie) ou quitter

### Ajustement de difficulté
1. Depuis le menu, accès à un slider de vitesse
2. Plage : très lente → très rapide
3. Vitesse appliquée à la prochaine partie

## 9. Business Rules

- La raquette ne se déplace qu'avec les flèches gauche/droite du clavier
- La souris est réservée aux menus et clics
- Chaque briquée peut être détruite une seule fois par partie
- La balle rebondit sur les 4 côtés de l'écran (murs et plafond)
- La vitesse de la balle doit être adjustable **avant** le démarrage d'une partie
- Une partie qui commence avec 3 vies est la configuration standard

## 10. Success Criteria

- [ ] Jeu est jouable jusqu'à victoire ou défaite complète
- [ ] Les rebonds physiques (murs, plafond, raquette, briques) sont fluides et prévisibles
- [ ] Le joueur peut terminer une partie en moins de 5 minutes en moyenne
- [ ] Slider de vitesse fonctionne et affecte visiblement la difficulté
- [ ] Pas d'erreurs console ; jeu stable sur les navigateurs modernes (Chrome, Firefox, Safari)

## 11. Open Questions

- La balle doit-elle avoir un angle de rebond déterministe ou aléatoire selon le point d'impact sur la raquette ?
- La balle doit-elle accélérer au fil du temps ou rester à vitesse constante ?
- Le mur doit-il avoir une couleur ou un motif spécifique par ligne ?
