# Architecture — Breakout Game

## 1. Vue d'ensemble

Le jeu Breakout est une implémentation fidèle du classique arcade utilisant vanilla JavaScript (HTML/CSS/JS sans dépendances externes). L'architecture suit une **séparation claire entre moteur de jeu, gestion d'état, interface utilisateur et événements clavier**.

### Principes de conception

- **No Dependencies**: Zero frameworks ou bibliotheques externes
- **Separation of Concerns**: Moteur, état, rendu et contrôles sont isolés
- **Game Loop**: Boucle de jeu 60 FPS avec mise à jour et rendu atomiques
- **Collision Detection**: Système de collision centralisé et prévisible
- **Event-Driven Controls**: Clavier et souris gérés via event listeners

---

## 2. Structure du code

```
apps/breakout/
├── index.html              # HTML principal
├── styles.css              # Feuille de styles
├── js/
│   ├── main.js             # Point d'entrée et bootstrapping
│   ├── game.js             # Classe Game (orchestration)
│   ├── gameState.js        # État global du jeu
│   ├── engine/
│   │   ├── ball.js         # Classe Ball (logique et collisions)
│   │   ├── paddle.js       # Classe Paddle (contrôle et mouvement)
│   │   ├── brick.js        # Classe Brick (état et destruction)
│   │   ├── collisions.js   # Système de détection de collisions
│   │   └── physics.js      # Physique et réflexion
│   ├── ui/
│   │   ├── menu.js         # Menu UI (démarrage, slider, quitter)
│   │   ├── gameScreen.js   # Affichage du jeu (score, vies)
│   │   ├── gameOverScreen.js # Écran de fin (perte/victoire)
│   │   └── renderer.js     # Rendu canvas (balle, raquette, briques)
│   └── input/
│       ├── keyboard.js     # Gestion des événements clavier
│       └── mouse.js        # Gestion des événements souris
└── docs/
    ├── what/
    │   └── product-spec.md
    └── how/
        ├── architecture.md (ce fichier)
        └── c4/
            ├── system-context.md
            └── containers.md
```

---

## 3. Composants principaux du moteur de jeu

### 3.1 Ball (Balle)

**Responsabilité**: Logique du mouvement, physique et collisions de la balle.

**Propriétés**:
- `x, y`: Position du centre
- `vx, vy`: Vecteur vélocité
- `radius`: Rayon en pixels
- `speed`: Magnitude de vélocité (configurable)

**Méthodes clés**:
- `update(deltaTime)`: Met à jour position basée sur vélocité
- `draw(ctx)`: Rendu sur canvas
- `collidesWith(rect)`: Détecte collision avec rectangle (paddle, briques, murs)
- `reflect(normalX, normalY)`: Réfléchit la vélocité selon une normale

**Comportement**:
- Rebondit sur les murs latéraux et plafond
- Rebondit sur la raquette avec angle de réflexion basé sur point de contact
- Disparaît si elle sort par le bas (perte d'une vie)
- Vitesse constante pendant la partie (configurée au menu)

---

### 3.2 Paddle (Raquette)

**Responsabilité**: Contrôle du joueur, mouvement et collision.

**Propriétés**:
- `x, y`: Position du coin haut-gauche
- `width, height`: Dimensions
- `speed`: Vitesse de mouvement (pixels/seconde)
- `isMovingLeft, isMovingRight`: Flags d'input

**Méthodes clés**:
- `update(deltaTime)`: Met à jour position basée sur input
- `draw(ctx)`: Rendu sur canvas
- `getBounds()`: Retourne rectangle de collision
- `constrainToScreen(screenWidth)`: Empêche la raquette de sortir des bords

**Comportement**:
- Contrôlée par flèches gauche/droite clavier
- Reste confinée aux bords de l'écran
- Collisions avec balle réfléchissent la balle avec angle basé sur position de contact

---

### 3.3 Brick (Brique)

**Responsabilité**: État d'une brique, destruction et rendu.

**Propriétés**:
- `x, y`: Position du coin haut-gauche
- `width, height`: Dimensions standards
- `isDestroyed`: Flag de destruction (booléen)
- `color`: Couleur de rendu

**Méthodes clés**:
- `draw(ctx)`: Rendu sur canvas si pas détruite
- `getBounds()`: Retourne rectangle de collision
- `destroy()`: Marque comme détruite

**Comportement**:
- Grille 10×5 (10 colonnes, 5 rangées)
- Détruite au premier contact avec la balle
- Pas de briques multi-coups ou bonus

---

### 3.4 Collision Detection (Système de collision)

**Responsabilité**: Détecte et résout toutes les collisions.

**Méthodes**:
- `checkBallBrickCollisions(ball, bricks)`: Balle ↔ briques
- `checkBallPaddleCollision(ball, paddle)`: Balle ↔ raquette
- `checkBallWallCollisions(ball, canvasWidth, canvasHeight)`: Balle ↔ murs/plafond
- `checkBallOutOfBounds(ball, canvasHeight)`: Balle hors écran (perte)

**Algorithme AABB (Axis-Aligned Bounding Box)**:
- Détecte collision cercle ↔ rectangle
- Calcule point de contact et normale
- Résout avec réflexion vectorielle

---

### 3.5 Physics (Physique)

**Responsabilité**: Calculs physiques et réflexions.

**Méthodes**:
- `reflect(vx, vy, nx, ny)`: Réfléchit vecteur vélocité selon normale
- `calculateReflectionAngle(ballX, paddleX, paddleWidth)`: Angle réflexion basé sur contact paddle

**Modèle**: Réflexion simple avec normale de surface (pas d'accélération ou friction).

---

## 4. Gestion d'état

### 4.1 GameState (État global)

**Responsabilité**: Centralise tout l'état immutable du jeu.

**État**:
```javascript
{
  phase: 'menu' | 'playing' | 'paused' | 'gameOver' | 'victory',
  lives: 3,
  score: 0,
  ballSpeed: 150,  // pixels/seconde (configurable)
  bricksRemaining: 50,
  isPaused: false
}
```

**Transitions d'état**:
- `menu` → `playing`: Au clic "Start Game"
- `playing` → `paused`: Touche P
- `paused` → `playing`: Touche P
- `playing` → `gameOver`: Lives = 0
- `playing` → `victory`: Tous les briques détruits
- `gameOver` / `victory` → `menu`: Au clic "Replay" ou "Quit"

---

## 5. Patterns de gestion d'état et événements

### 5.1 Event Listeners (Clavier et souris)

**Clavier**:
- `ArrowLeft`: Paddle move left
- `ArrowRight`: Paddle move right
- `P`: Pause/resume

**Souris**:
- Click sur "Start Game": Démarre le jeu
- Slider ball speed: Configure la vitesse
- Click sur "Quit": Quitte
- Click sur "Replay": Rejoue

### 5.2 Game Loop (60 FPS)

```
requestAnimationFrame loop:
  1. Calculate deltaTime (time since last frame)
  2. Update game state:
     - Update ball position
     - Update paddle position
     - Detect collisions
     - Check end conditions
  3. Render:
     - Clear canvas
     - Draw paddle
     - Draw ball
     - Draw bricks
     - Draw UI (lives, score)
  4. Schedule next frame
```

### 5.3 Separation of Concerns

- **engine/**: Logique pure du moteur (pas de DOM)
- **ui/**: Rendu et interaction (canvas, HTML)
- **input/**: Événements clavier/souris
- **gameState**: État immutable

---

## 6. Interfaces utilisateur

### 6.1 Menu

**Éléments**:
- Titre "BREAKOUT"
- Slider "Ball Speed" (configurable range)
- Bouton "Start Game"
- Bouton "Quit"

**Comportement**:
- Affiche la vitesse actuelle de la balle
- Slider change la propriété `ballSpeed` du gameState
- Reste visible jusqu'au clic "Start Game"

---

### 6.2 Game Screen

**Éléments**:
- Canvas (jeu)
- HUD:
  - Lives restantes (ex: "Lives: 2")
  - Score (ex: "Score: 1250")
  - Bricks restantes (ex: "Bricks: 42")
  - Hint "Press P to pause"

**Comportement**:
- Affichage continu lors du jeu
- Mis à jour à chaque rendu

---

### 6.3 Game Over / Victory Screen

**Éléments**:
- Message (ex: "GAME OVER - You lost!" ou "VICTORY - All bricks destroyed!")
- Score final
- Lives finales
- Bouton "Replay"
- Bouton "Quit"

**Comportement**:
- Affiche au-dessus du canvas
- Bloque interactivité du jeu
- Retour au menu au clic

---

## 7. Flux de gameplay

### 7.1 Initialisation

1. Page charge → `main.js` exécute
2. Crée instance `Game` (orchestrateur)
3. Initialise `GameState` avec phase = 'menu'
4. Affiche menu
5. Attache event listeners clavier/souris

### 7.2 Démarrage du jeu

1. Joueur configure vitesse et clique "Start Game"
2. `gameState.phase` → 'playing'
3. Ball créée au centre, paddle au bas
4. Grille de 50 briques créées (10×5)
5. Boucle de jeu démarre

### 7.3 Boucle de jeu (playing)

```
Each frame:
  - Calculate deltaTime
  - Update ball: x += vx * dt, y += vy * dt
  - Update paddle: déplace basée sur input
  - Detect collisions:
    * Ball ↔ Bricks: détruit briques, réfléchit balle
    * Ball ↔ Paddle: réfléchit balle
    * Ball ↔ Walls/Ceiling: réfléchit balle
    * Ball out of bounds: décrémente lives
  - Check end conditions:
    * lives === 0 → phase = 'gameOver'
    * bricksRemaining === 0 → phase = 'victory'
  - Render canvas + HUD
```

### 7.4 Fin du jeu

- Boucle s'arrête
- Message final affiché
- Attente au clic "Replay" ou "Quit"
- Retour au menu

---

## 8. Points de décision ouverts

D'après product-spec.md, les questions ouvertes suivantes affectent l'architecture:

| Question | Impact | Recommendation |
|----------|--------|-----------------|
| Paddle wraparound vs stop? | `paddle.js` | Stop at boundaries (plus intuitif) |
| Styling (colors, fonts)? | `styles.css` | Couleurs rétro (orange/noir) |
| Ball speed constant or accelerate? | `physics.js` | Constant (spec dit "constant during play") |
| Collision angle calculation? | `collisions.js` | Simple reflect avec normale (suffisant) |
| Pause feature? | `gameState`, `game.js` | Oui, touche P (mentionné dans capabilities) |
| Default ball speed? | `gameState.js` | 150 pixels/seconde |

---

## 9. Technologies

- **Language**: Vanilla JavaScript (ES6+)
- **Rendering**: Canvas 2D API
- **DOM**: HTML5 + CSS3
- **Dependencies**: None
- **Target**: Modern web browsers (Chrome, Firefox, Safari, Edge)

---

## 10. Décisions d'architecture

### D1: Vanilla JavaScript sans dépendances
**Justification**: Spec exige "zéro dépendances externes".

### D2: Game Loop avec `requestAnimationFrame`
**Justification**: Synchronisation native avec écran, meilleure performance que `setTimeout`.

### D3: Canvas pour rendu
**Justification**: Jeu 2D simple, Canvas suffisant, léger.

### D4: Système AABB pour collisions
**Justification**: Suffisant pour briques rectangulaires, performant, mathématiquement prévisible.

### D5: État centralisé (GameState)
**Justification**: Facilite transitions d'état, testable, claire séparation données/logique.

### D6: Séparation engine / ui / input
**Justification**: Motor indépendant du rendu, facilite tests unitaires, permute UI futurs.

---

## 11. Considérations de performance

- **60 FPS Target**: `requestAnimationFrame` natif
- **Canvas Rendering**: Un seul contexte canvas, pas de DOM thrashing
- **Collision Detection**: Optimisé AABB (cercle vs rectangles)
- **Event Throttling**: Clavier événement-basé (pas de polling)

---

## 12. Roadmap future (out of scope)

- [ ] Multiple levels / brick patterns
- [ ] Power-ups (slow, multi-ball, etc.)
- [ ] Sound effects
- [ ] Particle effects / animations
- [ ] Touch/mobile controls
- [ ] High score persistence
- [ ] Difficulty levels (speed presets)

---

## 13. Références

- [C4 System Context](c4/system-context.md)
- [C4 Container](c4/containers.md)
- [Product Specification](../what/product-spec.md)
