# Slice 1 — Project Setup and HTML/CSS Base

## Goal

Établir la structure de base du projet Breakout : fichiers HTML/CSS/JS, configuration canvas, mise en place du DOM des menus, et initialisation du système de rendu.

Livrable testable : Une page HTML chargeable dans le navigateur affichant un canvas vide et un menu principal statique (sans interaction).

## Related Epics

- [Epic 0 — MVP Breakout](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-001 — Game Setup](../../../what/epics/epic-0-mvp/user-stories/us-001-game-setup.md)
- [US-005 — Paddle Controls and Input Handling](../../../what/epics/epic-0-mvp/user-stories/us-005-paddle-controls.md)

## Impacted Components

### Frontend Container
- **UI & Menus (DOM)** : Structure HTML basique, CSS pour menus
- **Canvas Renderer** : Initialisation canvas 2D, setup contexte
- **Game Engine** : Scaffolding minimal pour future boucle de jeu

## Interfaces

### HTML Structure
```html
<body>
  <div id="game-container">
    <canvas id="game-canvas"></canvas>
    <div id="menu-container">
      <!-- Menus injectés via JavaScript -->
    </div>
  </div>
</body>
```

### Canvas Setup
```javascript
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;   // Largeur playfield
canvas.height = 600;  // Hauteur playfield
```

### CSS Grid/Flex
- Centrage du canvas
- Menus overlaid (position: absolute ou z-index)
- Boutons stylisés (Start, Quit, Replay)
- Slider de vitesse

## Data Changes

Aucune logique métier à ce stade. Seule la **structure de données HTML/CSS** est établie.

```javascript
// Pas de GameState à cette étape
// Juste la préparation des conteneurs DOM
```

## Sequence Flow

```
1. HTML page loads
   ├─ Canvas element créé
   ├─ Canvas context (2D) récupéré
   ├─ Canvas width/height définis
   └─ Menu DOM templates injectés

2. CSS applié
   ├─ Canvas centré
   ├─ Menus stylisés (hidden par défaut)
   ├─ Boutons visuels
   └─ Slider de vitesse

3. Initialisation JavaScript
   ├─ Game container trouvé
   ├─ Canvas et ctx assignés
   ├─ Menu principal affiché
   └─ Listeners d'événements prêts (future)
```

## Implementation Checklist

### HTML Setup
- [ ] Fichier `index.html` créé avec structure basique
- [ ] Canvas element (`<canvas id="game-canvas">`)
- [ ] Menu container (`<div id="menu-container">`)
- [ ] Script tags pointant vers JS modules

### Canvas Configuration
- [ ] Canvas width: 800px
- [ ] Canvas height: 600px
- [ ] Context 2D obtenu et assigné
- [ ] Canvas centralisé dans viewport

### CSS Styling
- [ ] Menu principal visible (Start button, Quit button)
- [ ] Speed control screen (caché)
- [ ] Win/Loss screens (cachés)
- [ ] Buttons cliquables (pas de fonctionnalité, juste visuel)
- [ ] Lives counter area (placeholder)

### JavaScript Files Structure
```
/
├── index.html
├── styles.css
└── js/
    ├── main.js           (entry point)
    ├── GameEngine.js
    ├── GameState.js
    ├── UIManager.js
    ├── InputHandler.js
    ├── CanvasRenderer.js
    ├── Physics/
    │   ├── BallPhysics.js
    │   ├── PaddlePhysics.js
    │   ├── CollisionDetector.js
    │   └── BounceResolver.js
    └── GameObjects/
        ├── Ball.js
        ├── Paddle.js
        └── Brick.js
```

### Module Scaffolding
- [ ] GameEngine.js : classe avec `constructor(canvas, gameState)` (empty methods)
- [ ] GameState.js : classe avec propriétés ball, paddle, bricks[], lives, status, ballSpeed
- [ ] UIManager.js : classe avec `showMainMenu()`, `showSpeedControl()`, etc.
- [ ] CanvasRenderer.js : classe avec `render(gameState)` (empty)
- [ ] InputHandler.js : classe avec event listeners (empty)
- [ ] Physics modules : classes scaffolded (empty methods)

### No Game Logic Yet
- [ ] Pas de boucle de jeu lancée
- [ ] Pas d'événements clavier/souris traités
- [ ] Pas de mouvement ou collision
- [ ] Juste affichage statique

## Observability Impact

### Console Logging (Startup)
```javascript
console.log('Game initialized');
console.log('Canvas ready:', { width: 800, height: 600 });
console.log('Menu displayed:', 'main');
```

### Browser DevTools
- Vérification du canvas dimensions dans Elements tab
- Vérification des classes JavaScript chargées
- Pas d'erreurs de console

## Success Criteria (Definition of Done)

- ✅ Page HTML charge sans erreurs (console vide)
- ✅ Canvas 800x600 visible et blanc
- ✅ Menu principal affiché avec boutons Start, Quit
- ✅ Speed control screen caché mais structuré
- ✅ Win/Loss screens cachés mais structurés
- ✅ Tous les modules JavaScript importés et initialisés
- ✅ Pas de logique de jeu, juste structure et CSS
- ✅ Code vanilla JS (pas de dépendances externes)

## Testing Notes

### Manual Smoke Test
1. Ouvrir `index.html` dans le navigateur
2. Vérifier : canvas visible, menu affiché
3. Vérifier : console vide (no errors)
4. Vérifier : structure CSS correcte (centrage, spacing)

### Browser Compatibility
- Chrome/Chromium (OK)
- Firefox (OK)
- Safari (OK)
- Edge (OK)

## Dependencies

- Aucune dépendance externe
- ES6 modern JavaScript
- HTML5 Canvas API

## Timeline Estimate

- **Effort** : 0.5–1 jour
- **Risk** : Très bas (aucune logique complexe)
- **Blocker** : Aucun
