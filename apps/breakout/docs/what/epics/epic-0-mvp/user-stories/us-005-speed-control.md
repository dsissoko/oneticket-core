À partir de l'epic-0-mvp, crée le fichier pour la cinquième user story : US-005 - Contrôler la vitesse de la balle.

Titre : Ajuster la vitesse de la balle via un slider

Description :
En tant que joueur, je veux ajuster la vitesse de la balle avec un slider accessible depuis le menu, afin de moduler la difficulté du jeu selon mes préférences.

Critères d'acceptation (format Gherkin) :
- Étant donné le menu est affiché
- Quand je vois le slider de vitesse
- Alors je peux le déplacer de très lent à très rapide
- Et quand je démarre ou redémarre une partie
- Alors la vitesse de balle reflète mon réglage
- Et le réglage persiste entre les parties

Notes de mise en œuvre :
- Élément HTML input range
- Stockage local de la préférence (localStorage)
- Mapping plage slider → vitesse en pixels/frame
- Test de plages extrêmes (très lent, très rapide)

Utilise le template OneTicket standard pour user story.