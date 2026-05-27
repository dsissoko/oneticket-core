À partir de l'epic-0-mvp, crée le fichier pour la deuxième user story : US-002 - Implémenter la physique de balle.

Titre : Implémenter la physique de la balle (rebond et collision)

Description :
En tant que joueur, je veux que la balle rebondisse naturellement sur les murs, le plafond et la raquette, afin que le jeu soit jouable et fluide.

Critères d'acceptation (format Gherkin) :
- Étant donné la balle se déplace
- Quand elle touche un mur ou le plafond
- Alors elle rebondit avec un angle approprié
- Et quand elle touche la raquette
- Alors elle rebondit vers le haut
- Et quand elle atteint le bas de l'écran
- Alors le joueur perd une vie
- Et la balle est réinitialisée

Notes de mise en œuvre :
- Détection de collision balle-murs
- Détection de collision balle-raquette
- Détection de collision balle-briques
- Calcul des vecteurs de rebond
- Gestion de la vitesse de balle (paramétrable)

Utilise le template OneTicket standard pour user story.