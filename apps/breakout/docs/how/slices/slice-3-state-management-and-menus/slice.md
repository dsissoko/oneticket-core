# Slice 3 — State Management and Menu Navigation

## Goal

Implémenter les transitions d'état complètes du jeu, la navigation entre menus et le slider de vitesse. Le résultat est un jeu où on peut démarrer depuis le menu principal, configurer la vitesse, jouer et voir les écrans de victoire/défaite avec navigation fluide.

Livrable testable : Navigation complète menu → speed control → gameplay → win/loss → replay/quit.

## Related Epics

- [Epic 0 — MVP Breakout](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-001 — Game Setup](../../../what/epics/epic-0-mvp/user-stories/us-001-game-setup.md)
- [US-004 — Lives System and Game State Management](../../../what/epics/epic-0-mvp/user-stories/us-004-lives-and-game-state.md)
- [US-005 — Paddle Controls and Input Handling](../../../what/epics/epic-0-mvp/user-stories/us-005-paddle-controls.md)
- [US-006 — Menus and Game State Navigation](../../../what/epics/epic-0-mvp/user-stories/us-006-menus-and-state-navigation.md)

## Impacted Components

### Game State Manager
- **GameState** : Propriété `status` pour états (menu, speedControl, playing, won, lost)
- **GameState** : Propriété `ballSpeed` pour multiplicateur vitesse (0.5 à 2.0)
- **GameState** : Méthodes `reset()`, `resetBall()`, `loseLife()`

### UI Manager
- **UIManager** : Affichage menus dynamiques (DOM manipulation)
- **UIManager.showMainMenu()** : Start, Quit buttons
- **UIManager.showSpeedControl()** : Slider 0.5–2.0, Start, Back buttons
- **UIManager.showWinScreen()** : Message, Replay, Main Menu, Quit
- **UIManager.showLoseScreen()** : Message, Replay, Main Menu, Quit
- **UIManager.hideAllMenus()** : Masquer tous les menus

### Input Handler
- **InputHandler** : Écoute clavier pour sliders (click & drag)
- **InputHandler** : Gestion des clics boutons

### Game Engine
- **GameEngine** : Gestion transitions `status` du GameState
- **GameEngine** : Pause/resume basé sur status

## Interfaces

### GameState Status Transitions
```javascript
Status transitions:
  'menu' → 'speedControl' (user clicks "Start")
  'speedControl' → 'playing' (user clicks "Start Game")
  'speedControl' → 'menu' (user clicks "Back")
  'playing' → 'won' (all bricks destroyed)
  'playing' → 'lost' (lives reach 0)
  'won' → 'speedControl' (user clicks "Replay")
  'won' → 'menu' (user clicks "Main Menu")
  'lost' → 'speedControl' (user clicks "Replay")
  'lost' → 'menu' (user clicks "Main Menu")
```

### UIManager.render()
```javascript
class UIManager {
  render(status) {
    switch(status) {
      case 'menu':
        this.showMainMenu();
        break;
      case 'speedControl':
        this.showSpeedControl();
        break;
      case 'won':
        this.showWinScreen();
        break;
      case 'lost':
        this.showLoseScreen();
        break;
      // 'playing': tous les menus cachés, juste canvas visible
    }
  }
}
```

### Speed Slider Interface
```javascript
// Slider range: 0.5 (slow) to 2.0 (fast)
// Value displayed in real-time
// Applied to GameState.ballSpeed
ballSpeed: number // Multiplicateur vitesse

// Slider HTML input
<input type="range" min="0.5" max="2.0" step="0.1" value="1.0" id="speed-slider">
```

### Menu Button Handlers
```javascript
// Main Menu
document.getElementById('btn-start').addEventListener('click', () => {
  gameState.status = 'speedControl';
  uiManager.render('speedControl');
});

document.getElementById('btn-quit').addEventListener('click', () => {
  // Close game or reload
});

// Speed Control
document.getElementById('btn-start-game').addEventListener('click', () => {
  gameState.status = 'playing';
  gameEngine.start();
  uiManager.hideAllMenus();
});

document.getElementById('btn-back').addEventListener('click', () => {
  gameState.status = 'menu';
  uiManager.render('menu');
});

// Win/Loss Screens
document.getElementById('btn-replay').addEventListener('click', () => {
  gameState.reset();
  gameState.status = 'speedControl';
  uiManager.render('speedControl');
});

document.getElementById('btn-main-menu').addEventListener('click', () => {
  gameState.reset();
  gameState.status = 'menu';
  uiManager.render('menu');
});

document.getElementById('btn-quit').addEventListener('click', () => {
  // Close game
});
```

## Data Changes

### GameState Extended
```javascript
{
  ball: { ... },
  paddle: { ... },
  bricks: [ ... ],
  lives: 3,
  status: 'menu'|'speedControl'|'playing'|'won'|'lost',
  ballSpeed: 1.0,  // New: multiplicateur [0.5, 2.0]
  
  // New methods
  reset()       // Réinitialise ball, paddle, bricks, lives
  resetBall()   // Reposition ball à (400, 300)
}
```

### Persistent State (V1 In-Memory)
- Status transitions preserved in GameState.status
- Ball speed selected persists until new speed chosen
- Lives counter persists during active game

## Sequence Flow

### Main Menu → Start Game
```
1. User clicks "Start Game" button
   └─ Event fired: click on #btn-start

2. Input Handler captures click
   └─ Calls gameState.status = 'speedControl'

3. UIManager renders new state
   └─ showSpeedControl() creates slider, Start/Back buttons

4. User adjusts slider to desired speed
   └─ Slider input fires change event
   └─ gameState.ballSpeed updated in real-time
   └─ Display label updates (e.g., "Speed: 1.5x")

5. User clicks "Start Game" button
   └─ gameState.status = 'playing'
   └─ gameEngine.start() launches game loop
   └─ UIManager hides all menus
   └─ Canvas shows gameplay
```

### Playing → Win
```
1. During gameplay, bricks destroyed one by one
   └─ CollisionDetector detects brick hit
   └─ GameState.destroyBrick(index)

2. Last brick destroyed
   └─ GameState.isGameWon() returns true
   └─ GameEngine detects win condition
   └─ gameState.status = 'won'
   └─ gameEngine.pause()

3. UIManager renders win screen
   └─ showWinScreen() displays:
      - "You Win!" message
      - Final stats (lives remaining, time?)
      - Replay, Main Menu, Quit buttons

4. User clicks "Replay"
   └─ gameState.reset()
   └─ gameState.status = 'speedControl'
   └─ New game ready to start
```

### Playing → Loss
```
1. During gameplay, ball exits bottom
   └─ CollisionDetector detects ball.y > 600
   └─ GameState.loseLife()
   └─ lives -= 1

2. If lives === 0
   └─ GameState.isGameLost() returns true
   └─ gameState.status = 'lost'
   └─ gameEngine.pause()

3. UIManager renders loss screen
   └─ showLoseScreen() displays:
      - "Game Over — You Lost!" message
      - Stats (bricks destroyed, final lives: 0)
      - Replay, Main Menu, Quit buttons

4. User clicks "Replay"
   └─ gameState.reset()
   └─ gameState.status = 'speedControl'
   └─ New game ready
```

## Implementation Checklist

### GameState Status Management
- [ ] GameState.status property (default: 'menu')
- [ ] GameState.ballSpeed property (default: 1.0, range 0.5–2.0)
- [ ] GameState.reset() : réinitialise toutes les données
- [ ] GameState.isGameWon() : return bricks.filter(b => !b.destroyed).length === 0
- [ ] GameState.isGameLost() : return lives === 0

### UIManager Implementation
- [ ] UIManager.showMainMenu() : display Start, Quit buttons
- [ ] UIManager.showSpeedControl() : display slider, Start, Back buttons
- [ ] UIManager.showWinScreen() : display win message, stats, buttons
- [ ] UIManager.showLoseScreen() : display loss message, stats, buttons
- [ ] UIManager.hideAllMenus() : remove all menu DOM elements
- [ ] UIManager.updateLivesDisplay(lives) : update lives counter

### HTML Menu Templates
- [ ] Main menu HTML
- [ ] Speed control screen HTML
- [ ] Win screen HTML
- [ ] Loss screen HTML
- [ ] All templates hidden by default (display: none or hidden)

### CSS for Menu States
- [ ] Menu containers positioned absolutely over canvas
- [ ] z-index: 10 to appear above canvas
- [ ] Buttons styled and clickable
- [ ] Slider styled (HTML range input)
- [ ] Text centered, readable fonts

### Input Event Handlers
- [ ] #btn-start : click → status = 'speedControl'
- [ ] #btn-start-game : click → status = 'playing', gameEngine.start()
- [ ] #btn-back : click → status = 'menu'
- [ ] #btn-replay : click → reset, status = 'speedControl'
- [ ] #btn-main-menu : click → reset, status = 'menu'
- [ ] #btn-quit : click → close game
- [ ] #speed-slider : input → gameState.ballSpeed = value

### Game Engine State Checking
- [ ] gameEngine checks gameState.status each frame
- [ ] If status === 'playing' : run full loop
- [ ] If status !== 'playing' : pause (no updates, no renders except UI)
- [ ] On status change to 'won' or 'lost' : pause engine
- [ ] On status change to 'playing' : resume engine

### Canvas Display Control
- [ ] During 'playing' : canvas visible, menus hidden
- [ ] During 'menu', 'speedControl', 'won', 'lost' : canvas still visible (background), menus overlay

## Observability Impact

### Console Logging
```javascript
// Status transitions
console.log('Status changed:', { from, to });

// Speed slider updates
console.log('Ball speed:', gameState.ballSpeed);

// Win/Loss
console.log('Game ended:', { status, lives, bricksDestroyed });
```

### Browser DevTools
- Menu DOM elements appear/disappear correctly
- No event listener leaks on menu transitions

## Success Criteria (Definition of Done)

- ✅ Main menu appears at startup with Start, Quit buttons
- ✅ Click Start → speed control screen appears
- ✅ Speed slider works (0.5 to 2.0)
- ✅ Speed value displayed and updated in real-time
- ✅ Click "Start Game" → gameplay begins, menus hidden
- ✅ Back button returns to main menu
- ✅ Destroying all bricks → Win screen appears
- ✅ Lives reach 0 → Loss screen appears
- ✅ Replay button resets game, returns to speed control
- ✅ Main Menu button returns to main menu
- ✅ Quit button closes game (or reloads page)
- ✅ All transitions smooth and instantaneous
- ✅ Console clean (no errors during transitions)

## Testing Notes

### Manual Menu Navigation Testing
1. Load game → Main menu visible
2. Click "Start" → Speed control appears
3. Adjust slider → Value updates
4. Click "Start Game" → Gameplay begins, menu hidden
5. Play until win → Win screen appears
6. Click "Replay" → Speed control appears again
7. Click "Back" → Main menu
8. Repeat for Loss condition

### UI State Verification
- Each menu properly styled and positioned
- Buttons clickable (hover, active states)
- Slider smooth and responsive
- No overlapping menus

## Dependencies

- Slice 1 : HTML/CSS base structure
- Slice 2 : GameEngine, physics (for status checking)
- DOM APIs (getElementById, addEventListener, classList)
- No external libraries

## Timeline Estimate

- **Effort** : 1.5–2 jours
- **Risk** : Bas (logique de transition simple)
- **Blocker** : Slice 1 et 2 doivent être complètes

## Notes

- Les transitions de status peuvent être instantanées (pas d'animations en V1)
- Stats affichées sur écrans de fin peuvent être basiques (vies, briques détruites)
- Persistence (localStorage) n'est pas en V1
- Animations ou effets peuvent être ajoutés en V2
