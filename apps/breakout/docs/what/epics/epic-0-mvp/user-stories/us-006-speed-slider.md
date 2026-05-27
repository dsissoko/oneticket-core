# User Story 006 — Slider d'ajustement de vitesse de balle

## Résumé
Permettre au joueur d'ajuster la vitesse de la balle via un slider dans le menu, pour personnaliser la difficulté et adapter le jeu à son niveau.

## Use Case (Format Mike Cohn)

**En tant que** joueur,
**Je veux** ajuster la vitesse de la balle via un slider,
**Afin de** personnaliser la difficulté et adapter le jeu à mon niveau de compétence.

---

## Acceptance Criteria (Format Gherkin)

### Scenario 1 : Affichage du slider de vitesse dans le menu
- **Given** le menu s'affiche à l'écran
- **and Given** le joueur a accès aux options du jeu
- **When** le menu se charge
- **Then** le slider de vitesse est visible avec une position par défaut (intermédiaire)
- **and Then** une étiquette indique "Vitesse de la balle" ou équivalent

### Scenario 2 : Ajuster le slider à la position minimale
- **Given** le menu s'affiche
- **and Given** le slider est visible et ajustable
- **When** le joueur déplace le slider à sa position minimale (gauche)
- **Then** le slider affiche sa position minimale
- **and Then** une indication visuelle (nombre, texte "Très lent") montre la vitesse actuelle

### Scenario 3 : Vitesse minimale appliquée au jeu
- **Given** le slider est positionné à son minimum
- **and Given** le joueur a sélectionné cette vitesse
- **When** le joueur démarre une nouvelle partie
- **Then** la balle se déplace très lentement
- **and Then** la difficulté est réduite au maximum

### Scenario 4 : Ajuster le slider à la position maximale
- **Given** le menu s'affiche
- **and Given** le slider est visible et ajustable
- **When** le joueur déplace le slider à sa position maximale (droite)
- **Then** le slider affiche sa position maximale
- **and Then** une indication visuelle (nombre, texte "Très rapide") montre la vitesse actuelle

### Scenario 5 : Vitesse maximale appliquée au jeu
- **Given** le slider est positionné à son maximum
- **and Given** le joueur a sélectionné cette vitesse
- **When** le joueur démarre une nouvelle partie
- **Then** la balle se déplace très rapidement
- **and Then** la difficulté est augmentée au maximum

### Scenario 6 : Position intermédiaire du slider
- **Given** le menu s'affiche
- **and Given** le slider est visible et ajustable
- **When** le joueur positionne le slider à une position intermédiaire (centre ou autre)
- **Then** le slider affiche sa position intermédiaire
- **and Then** une indication visuelle montre la vitesse proportionnelle

### Scenario 7 : Vitesse intermédiaire appliquée au jeu
- **Given** le slider est positionné à une position intermédiaire
- **and Given** le joueur a sélectionné cette vitesse
- **When** le joueur démarre une nouvelle partie
- **Then** la balle se déplace à une vitesse proportionnelle à la position du slider
- **and Then** la difficulté est équilibrée

### Scenario 8 : Nouveau réglage appliqué au redémarrage
- **Given** une partie est en cours avec une certaine vitesse
- **and Given** la partie s'est terminée (victoire ou game over)
- **When** le joueur ajuste le slider et clique sur "Rejouer"
- **Then** le nouveau réglage de vitesse s'applique immédiatement
- **and Then** la balle redémarre avec la nouvelle vitesse configurée

### Scenario 9 : Persistance du réglage de vitesse
- **Given** le joueur a sélectionné un réglage de vitesse spécifique
- **and Given** la partie démarre et s'exécute
- **When** la partie progresse
- **Then** la vitesse de la balle reste cohérente avec le réglage sélectionné
- **and Then** aucune variation inattendue de vitesse ne se produit

### Scenario 10 : Feedback visuel lors de l'ajustement
- **Given** le menu s'affiche avec le slider
- **and Given** le slider est visible
- **When** le joueur ajuste le slider en temps réel
- **Then** un feedback visuel immédiat indique la nouvelle vitesse
- **and Then** le joueur peut prédire l'impact avant de démarrer la partie

---

## Tâches Techniques

1. **Création du slider HTML**
   - Utiliser un élément `<input type="range">` pour le slider
   - Définir les attributs `min`, `max`, `value`, et `step`
   - Intégrer le slider dans le menu principal

2. **Gestion des événements du slider**
   - Ajouter un écouteur `input` ou `change` pour détecter les ajustements
   - Mettre à jour l'affichage de la vitesse en temps réel (label ou feedback)
   - Mettre à jour la valeur dans le game state

3. **Stockage de la vitesse dans le game state**
   - Créer une propriété `ballSpeed` dans le game state
   - Stocker la valeur du slider (0-100 ou plage normalisée)
   - Récupérer cette valeur lors du lancement d'une partie

4. **Calcul de la vitesse réelle de la balle**
   - Mapper la valeur du slider (0-100) à une vitesse réelle (ex. 2-8 pixels/frame)
   - Appliquer cette vitesse au vecteur de mouvement de la balle
   - Respecter la proportionnalité pour les positions intermédiaires

5. **Affichage visuel du slider**
   - Styling CSS pour rendre le slider attrayant et intuitif
   - Ajouter une label ou un texte indicateur de vitesse (ex. "Lent", "Normal", "Rapide")
   - Assurer une bonne accessibilité et une taille suffisante pour le clic

6. **Validation et limites**
   - S'assurer que la valeur du slider reste dans les limites autorisées
   - Éviter les vitesses extrêmes qui rendraient le jeu injouable
   - Gérer les cas limites (vitesse 0 ou trop élevée)

7. **Intégration avec le système de réinitialisation**
   - Récupérer la valeur du slider à chaque démarrage de partie
   - Appliquer la vitesse sélectionnée à la balle nouvellement créée
   - Conserver la valeur du slider entre les parties (sans réinitialisation non désirée)

---

## Notes d'implémentation

- Le slider doit être intuitif : position à gauche = lent, à droite = rapide
- Une indication textuelle ou numérique doit accompagner le slider pour clarté
- La vitesse doit être appliquée immédiatement au démarrage d'une partie
- Les ajustements en temps réel du slider doivent offrir un feedback visuel instantané
- Pas de dépendances externes : utiliser uniquement du JavaScript vanilla, HTML5, CSS3
- Le stockage de la vitesse peut utiliser le game state local (pas de localStorage si non requis)

---

**Status**: Pending
**Dépendances**: Epic 0 — Breakout MVP, User Story 005 (Menus)
