# Epic 0 — MVP Breakout

## Goal

Implémenter le jeu Breakout MVP fonctionnel avec gameplay complet : une expérience arcade classique en JavaScript vanilla où le joueur détruit un mur de briques en contrôlant une raquette pour maintenir une balle en jeu.

## Business Value

Fournir un jeu arcade classique jouable et divertissant, reconnaissable immédiatement par les joueurs, offrant une expérience simple et accessible sans dépendances externes. Capture l'essence du gameplay rétro dans une implémentation légère et performante.

## Scope

Implémentation complète du jeu Breakout selon la product-spec.md :

1. **Menu principal** — Affichage du slider de vitesse réglable, boutons "Démarrer" et "Quitter"
2. **Gameplay** — Terrain avec mur de briques (5 lignes), raquette mobile, balle rebondissante, affichage en temps réel des vies et du score
3. **Contrôles** — Flèches gauche/droite pour la raquette en jeu, souris pour les boutons de menu
4. **Physique de balle** — Rebonds corrects sur les murs, plafond, raquette et briques
5. **Gestion des vies** — Joueur commence avec 3 vies, perte au contact du bas, réinitialisation en cas de vies restantes
6. **Détection de victoire** — Toutes les briques détruites → menu victoire
7. **Détection de game over** — Vies = 0 → menu game over
8. **Menus d'après-jeu** — Menu victoire et menu game over avec options "Rejouer" et "Quitter"
9. **Vitesse ajustable** — Slider accessible depuis le menu principal, gamme paramétrable, appliquée au lancement

### Out of Scope

- Système de niveaux ou progression
- Persistance des scores
- Powerups ou bonus spéciaux
- Éléments visuels avancés (particules, animations complexes)
- Sons et musiques
- Multijoueur

## Related User Stories

(À documenter dans la tâche D — créées dans apps/breakout/docs/what/epics/epic-0-mvp/user-stories/)

## Related Slices

(À documenter dans la tâche D — dérivées de l'architecture et des user stories)
