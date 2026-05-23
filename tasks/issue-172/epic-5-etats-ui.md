# Epic 5 : États du Jeu et UI

## Description
Gestion des états du jeu (menu, en cours, victoire, game over) et affichage des écrans correspondants.

## Contenu du fichier
Ajouter au jeu :
- Machine d'états : START, PLAYING, WIN, GAME_OVER
- Écran de démarrage : "Appuyez sur ESPACE pour commencer"
- Écran de victoire : Score final + "Vous avez gagné! Appuyez sur ESPACE pour rejouer"
- Écran de game over : Score final + "Game Over! Appuyez sur ESPACE pour rejouer"
- Transition entre états
- Possibilité de redémarrer après victoire ou défaite
- Pause du jeu hors état PLAYING

## Critères d'acceptation
- Écran de démarrage affiché au lancement
- Jeu démarre au premier ESPACE
- Écrans de fin affichés correctement
- Redémarrage fonctionne (ESPACE)
- États bien séparés et pas d'appels redondants