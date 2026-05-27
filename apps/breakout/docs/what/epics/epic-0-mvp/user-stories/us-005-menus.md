# User Story 005 — Menus de jeu

## Résumé
Fournir un système de menus interactif permettant au joueur de démarrer une partie, rejouer après une fin de partie, ou quitter le jeu, pour une gestion fluide du flux de jeu.

## Use Case (Format Mike Cohn)

**En tant que** joueur,
**Je veux** accéder à un menu pour démarrer une partie, rejouer ou quitter,
**Afin de** gérer le flux de jeu et recommencer facilement.

---

## Acceptance Criteria (Format Gherkin)

### Scenario 1 : Affichage du menu principal au lancement
- **Given** le jeu démarre
- **and Given** la page de jeu charge
- **When** le DOM et le contexte du jeu se initialisent
- **Then** l'écran de menu principal s'affiche avec les boutons Démarrer, Rejouer et Quitter

### Scenario 2 : Lancer une partie depuis le menu
- **Given** le menu principal s'affiche à l'écran
- **and Given** le joueur voit le bouton "Démarrer"
- **When** le joueur clique sur le bouton "Démarrer"
- **Then** la partie commence (balle lancée, raquette active, compteur de vies visible)
- **and Then** l'écran de menu disparaît et laisse place à la zone de jeu

### Scenario 3 : Rejouer après la fin d'une partie
- **Given** une partie est terminée (victoire ou game over)
- **and Given** l'écran de fin de partie s'affiche avec le bouton "Rejouer"
- **When** le joueur clique sur "Rejouer"
- **Then** le jeu redémarre avec :
  - Les briques réinitialisées
  - La balle réinitialisée au centre
  - Les vies remises à 3
  - La raquette réinitialisée au centre

### Scenario 4 : Quitter le jeu
- **Given** le menu s'affiche (menu principal ou menu de fin)
- **and Given** le joueur voit le bouton "Quitter"
- **When** le joueur clique sur "Quitter"
- **Then** la page se ferme ou retourne à l'accueil (comportement selon contexte d'exécution)

### Scenario 5 : Interaction souris fluide
- **Given** le jeu se trouve sur n'importe quel écran de menu
- **and Given** les boutons sont rendus et visibles
- **When** l'utilisateur survole les boutons avec la souris
- **Then** les boutons affichent un effet visuel (changement de couleur, ombrage, ou style) indiquant l'interactivité
- **and When** l'utilisateur clique sur un bouton
- **Then** le clic est détecté et le bouton exécute son action correspondante

---

## Tâches Techniques

1. **Structure DOM des menus**
   - Créer un conteneur HTML pour le menu principal
   - Créer trois boutons : Démarrer, Rejouer, Quitter
   - Styling CSS pour menus responsive et visuellement attrayants

2. **Gestion des événements souris**
   - Ajouter écouteurs `click` sur chaque bouton
   - Ajouter styles `:hover` et `:active` pour feedback visuel

3. **Transitions d'état du jeu**
   - Menu principal → Jeu en cours (au clic sur "Démarrer")
   - Jeu en cours → Menu de fin (victoire ou game over)
   - Menu de fin → Jeu en cours (au clic sur "Rejouer")
   - N'importe quel état → Fermeture (au clic sur "Quitter")

4. **Réinitialisation complète du jeu**
   - Réinitialiser les briques (créer un nouveau mur)
   - Réinitialiser la balle (position et direction)
   - Réinitialiser les vies à 3
   - Réinitialiser la raquette

---

## Notes d'implémentation

- Les menus doivent disparaître lors du lancement d'une partie et réapparaître à la fin
- Les boutons doivent être intuitifs et accessibles (taille minimale, contraste suffisant)
- Les transitions entre états doivent être fluides (pas de flash ou de saccade)
- Pas de dépendances externes : utiliser uniquement du JavaScript vanilla, HTML5, CSS3

---

**Status**: Pending
**Dépendances**: Epic 0 — Breakout MVP
