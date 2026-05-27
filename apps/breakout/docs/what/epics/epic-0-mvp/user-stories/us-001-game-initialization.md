À partir de l'epic-0-mvp, crée le fichier pour la première user story : US-001 - Initialiser l'état du jeu.

Titre : Initialiser l'état du jeu

Description :
En tant que joueur, je veux que le jeu s'initialise correctement au démarrage, afin de commencer une partie dans un état connu et prévisible.

Critères d'acceptation (format Gherkin) :
- Étant donné le jeu vient de démarrer
- Quand la page est chargée
- Alors l'aire de jeu contient 5 lignes de briques intactes
- Et la balle est positionnée au centre de l'écran
- Et la raquette est au bas de l'écran
- Et le compteur de vies affiche 3
- Et le jeu est en attente du clic de démarrage

Notes de mise en œuvre :
- Initialiser les structures de données du jeu
- Créer la grille de briques (5 lignes)
- Positionner les objets de jeu
- Afficher l'écran initial avec les contrôles

Utilise le template OneTicket standard pour user story.