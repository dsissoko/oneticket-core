# US-007 — Menu de réglage de la vitesse

## Story

En tant que joueur, je veux accéder à un menu avec un slider ou des boutons pour régler la vitesse de la balle (5 niveaux), afin de personnaliser la difficulté avant de jouer.

## Expected Behavior

- Au lancement de l'application, un menu de titre s'affiche
- Un menu de sélection de vitesse est accessible avec 5 niveaux clairs :
  - **Très lente** (0.5x)
  - **Lente** (0.75x)
  - **Normal** (1.0x) — sélectionné par défaut
  - **Rapide** (1.5x)
  - **Très rapide** (2.0x)
- L'utilisateur peut naviguer entre les niveaux avec les flèches gauche/droite
- L'utilisateur peut sélectionner un niveau avec la souris ou le clavier (Entrée)
- Le niveau sélectionné est visuellement mis en évidence
- Un bouton "Jouer" ou "Démarrer" lance la partie avec la vitesse choisie
- Le menu apparaît également après une victoire ou une défaite pour rejouer

## Acceptance Criteria

```gherkin
Feature: Menu de réglage de la vitesse

Scenario: Menu de vitesse s'affiche au lancement
  Given L'application Breakout démarre
  When La page se charge
  Then Le menu de sélection de vitesse s'affiche
  And Les 5 niveaux sont visibles
  And "Normal" est sélectionné par défaut

Scenario: Utilisateur sélectionne vitesse très lente
  Given Le menu de vitesse s'affiche
  When L'utilisateur sélectionne "Très lente"
  Then "Très lente" est mise en évidence
  And Les autre niveaux ne sont pas sélectionnés

Scenario: Utilisateur sélectionne vitesse rapide
  Given Le menu de vitesse s'affiche
  When L'utilisateur sélectionne "Rapide"
  Then "Rapide" est mise en évidence
  And Le texte/couleur indique le choix

Scenario: Navigation avec flèches gauche/droite
  Given "Normal" est sélectionné
  When L'utilisateur appuie sur Flèche droite
  Then La sélection passe à "Rapide"
  When L'utilisateur appuie sur Flèche gauche
  Then La sélection revient à "Normal"

Scenario: Navigation au clavier boucle les options
  Given "Très rapide" est sélectionné (dernière option)
  When L'utilisateur appuie sur Flèche droite
  Then La sélection revient à "Très lente" (ou reste sur "Très rapide")

Scenario: Utilisateur lance la partie
  Given Le menu de vitesse s'affiche
  And "Lente" est sélectionné
  When L'utilisateur clique sur "Jouer" ou appuie sur Entrée
  Then La partie démarre avec vitesse "Lente"
  And La balle se déplace à la vitesse configurée
  And Le menu disparaît

Scenario: Vitesse affecte la balle au démarrage
  Given L'utilisateur a sélectionné "Très rapide"
  When La partie commence
  Then La balle se déplace très rapidement
  And Le jeu est très difficile

Scenario: Menu réapparaît après victoire
  Given Le joueur a gagné
  When L'écran de victoire affiche "Rejouer"
  And L'utilisateur clique sur "Rejouer"
  Then Le menu de sélection de vitesse réapparaît
  And La sélection est réinitialisée à "Normal"

Scenario: Menu réapparaît après défaite
  Given Le joueur a perdu
  When L'écran Game Over affiche "Rejouer"
  And L'utilisateur clique sur "Rejouer"
  Then Le menu de sélection de vitesse réapparaît
  And La sélection est réinitialisée à "Normal"
```

## Technical Notes

- Créer un composant/écran "SpeedMenu" avec 5 options
- Implémenter une gestion d'état pour la vitesse sélectionnée (currentSpeed)
- Ajouter des événements `keydown` pour Flèche gauche/droite et Entrée
- Supporter aussi les clics souris sur les boutons de vitesse
- Stocker la vitesse sélectionnée et la passer au jeu au démarrage
- Mettre en évidence visuellement la sélection courante (couleur, bordure, police)

## Related Slices

À définir lors de l'implémentation.
