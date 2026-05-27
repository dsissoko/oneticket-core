À partir de l'epic-0-mvp, crée le fichier pour la quatrième user story : US-004 - Créer les menus du jeu.

Titre : Créer les menus de démarrage, rejouer et quitter

Description :
En tant que joueur, je veux accéder à des menus simples pour démarrer, rejouer ou quitter le jeu, afin de contrôler le flux de jeu.

Critères d'acceptation (format Gherkin) :
- Étant donné le jeu est au repos
- Quand je vois l'écran de menu
- Alors je peux cliquer sur "Démarrer" pour commencer
- Et après une partie terminée (victoire ou défaite)
- Quand je clique sur "Rejouer"
- Alors une nouvelle partie commence
- Et je peux cliquer sur "Quitter" pour fermer le jeu

Notes de mise en œuvre :
- Écran d'accueil
- Écran game over avec options
- Écran victoire avec options
- Gestionnaire d'événements souris pour les boutons
- États de jeu (menu, playing, game_over, victory)

Utilise le template OneTicket standard pour user story.