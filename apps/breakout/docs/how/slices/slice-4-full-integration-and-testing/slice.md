# Slice 4 — Full Integration and Quality Assurance

## Goal

Intégrer tous les composants du jeu en un ensemble cohérent, effectuer des tests de gameplay complets et valider que le jeu MVP fonctionne sans bugs critiques.

Livrable testable : Un jeu Breakout complètement fonctionnel, jouable du début à la fin, sans erreurs critiques ou comportements inattendus.

## Related Epics

- [Epic 0 — MVP Breakout](../../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

- [US-001 — Game Setup](../../../what/epics/epic-0-mvp/user-stories/us-001-game-setup.md)
- [US-002 — Ball Physics and Playfield Elements](../../../what/epics/epic-0-mvp/user-stories/us-002-ball-paddle-bricks.md)
- [US-003 — Collision Detection and Ball Bouncing](../../../what/epics/epic-0-mvp/user-stories/us-003-collision-detection.md)
- [US-004 — Lives System and Game State Management](../../../what/epics/epic-0-mvp/user-stories/us-004-lives-and-game-state.md)
- [US-005 — Paddle Controls and Input Handling](../../../what/epics/epic-0-mvp/user-stories/us-005-paddle-controls.md)
- [US-006 — Menus and Game State Navigation](../../../what/epics/epic-0-mvp/user-stories/us-006-menus-and-state-navigation.md)

## Impacted Components

### All Components
- **GameEngine** : Orchestration complète
- **GameState** : État centralisé stable
- **Physics** : Simulation correcte
- **Collisions** : Détection fiable
- **Input** : Responsivité clavier/souris
- **UI** : Menus fonctionnels
- **Rendering** : Affichage sans saccade

## Interfaces

### Main Entry Point
```javascript
// main.js
const canvas = document.getElementById('game-canvas');
const gameState = new GameState();
const gameEngine = new GameEngine(canvas, gameState);
const uiManager = new UIManager(gameState);
const inputHandler = new InputHandler(gameState);

// Initialize UI
uiManager.render(gameState.status);

// Ready for user interaction
```

### Game Loop Interface (Stable)
```javascript
// GameEngine.js
class GameEngine {
  constructor(canvas, gameState) { ... }
  
  start() {
    // Launch requestAnimationFrame loop
  }
  
  // Per-frame callback
  gameLoop() {
    const deltaTime = this.calculateDeltaTime();
    
    if (gameState.status === 'playing') {
      this.update(deltaTime);
      this.detectCollisions();
      this.updateGameState();
    }
    
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }
}
```

## Data Changes

### Final GameState Schema
```javascript
const initialGameState = {
  // Ball physics
  ball: {
    x: 400,
    y: 300,
    radius: 5,
    velocityX: 200,
    velocityY: 200,
    speed: 1.0
  },
  
  // Paddle
  paddle: {
    x: 350,
    y: 550,
    width: 100,
    height: 20,
    speed: 300,
    direction: 0
  },
  
  // Bricks (5 rows × 10 columns = 50 bricks)
  bricks: Array(50).fill(null).map((_, i) => ({
    x: (i % 10) * 80,
    y: 50 + Math.floor(i / 10) * 20,
    width: 80,
    height: 20,
    destroyed: false,
    color: ['#FF0000', '#FFA500', '#FFFF00', '#00FF00', '#0000FF'][Math.floor(i / 10)]
  })),
  
  // Game control
  lives: 3,
  status: 'menu',
  ballSpeed: 1.0
};
```

## Sequence Flow

### Complete Game Session
```
Session Start
  │
  ├─ User opens index.html
  │  └─ GameEngine initializes, GameState created
  │  └─ UIManager displays main menu
  │
  ├─ User clicks "Start"
  │  └─ Status → 'speedControl'
  │  └─ Speed control screen displayed
  │
  ├─ User adjusts speed slider (e.g., 1.5)
  │  └─ gameState.ballSpeed = 1.5
  │
  ├─ User clicks "Start Game"
  │  └─ Status → 'playing'
  │  └─ GameEngine.start() launched
  │  └─ Game loop runs 60 FPS
  │
  ├─ Gameplay Loop (30 seconds to 5 minutes)
  │  ├─ Ball moves, rebounds
  │  ├─ Player controls paddle (keyboard)
  │  ├─ Bricks destroyed progressively
  │  ├─ Lives may be lost (ball out of bounds)
  │  │  ├─ If lives reach 0
  │  │  │  └─ Status → 'lost'
  │  │  │  └─ Loss screen displayed
  │  │  └─ Else: continue playing
  │  │
  │  └─ When all bricks destroyed
  │     └─ Status → 'won'
  │     └─ Win screen displayed
  │
  ├─ End Game Screen (Win or Loss)
  │  ├─ User clicks "Replay"
  │  │  └─ GameState.reset()
  │  │  └─ Status → 'speedControl'
  │  │  └─ Back to speed selection
  │  │
  │  ├─ User clicks "Main Menu"
  │  │  └─ GameState.reset()
  │  │  └─ Status → 'menu'
  │  │  └─ Back to main menu
  │  │
  │  └─ User clicks "Quit"
  │     └─ Game closes
  │
  └─ Session End
```

## Implementation Checklist

### Module Integration
- [ ] All JS files imported in correct order (no circular dependencies)
- [ ] GameEngine linked to GameState, Physics, Renderer, Input, UI
- [ ] Input events properly wired to GameState updates
- [ ] Physics updates correctly reflect in GameState
- [ ] Renderer reads from GameState and draws correctly
- [ ] Menu transitions trigger correct GameState status changes

### Game Loop Stability
- [ ] 60 FPS consistent across all modern browsers
- [ ] No memory leaks (event listeners cleaned up on pause)
- [ ] DeltaTime calculated correctly (no negative values)
- [ ] Frame drops handled gracefully (catchup logic)

### Gameplay Correctness
- [ ] Ball never passes through walls or paddle
- [ ] Ball rebounds at correct angles (especially paddle)
- [ ] Paddle stays in bounds (no going off-screen)
- [ ] Bricks destroyed on first contact
- [ ] No double-destruction (one brick per collision)
- [ ] Lives decrement correctly on ball loss
- [ ] Game ends correctly at 0 lives or all bricks destroyed

### Input Responsiveness
- [ ] Keyboard input (arrows) responsive (<50ms)
- [ ] Mouse clicks on buttons register immediately
- [ ] Slider drag updates speed in real-time
- [ ] No input lag or stuttering

### UI State Correctness
- [ ] Main menu displays at startup
- [ ] Speed control reachable from main menu and replay
- [ ] Gameplay hides all menus
- [ ] Win/Loss screens appear at correct times
- [ ] Lives counter displayed and updated
- [ ] Speed value displayed on speed control screen

### Visual Rendering
- [ ] Canvas background white (clear)
- [ ] Walls visible (dark color)
- [ ] Bricks rendered with colors (5 rows)
- [ ] Bricks disappear when destroyed
- [ ] Ball visible and moves smoothly
- [ ] Paddle visible and responds to input
- [ ] No visual glitches or tearing
- [ ] Text readable (menus, lives counter)

### Cross-Browser Compatibility
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Error Handling
- [ ] No console errors during normal gameplay
- [ ] No unhandled exceptions on menu transitions
- [ ] Graceful handling of rapid button clicks
- [ ] No crashes on extreme game states

### Code Quality
- [ ] All modules follow naming conventions (CamelCase, snake_case)
- [ ] Functions have clear purposes and single responsibility
- [ ] Comments explain non-obvious logic
- [ ] No dead code or unused imports
- [ ] Consistent indentation and formatting

## Test Plan

### Smoke Test (Manual, ~10 minutes)
```
1. Load game
   ✓ Menu visible
   ✓ Console clean

2. Click "Start Game"
   ✓ Speed control appears

3. Adjust slider, click "Start Game"
   ✓ Gameplay starts
   ✓ Canvas visible, menus hidden

4. Play for 30 seconds
   ✓ Ball moves smoothly
   ✓ Raquette responds to keyboard
   ✓ Bricks destroyed on contact

5. Allow ball to exit bottom
   ✓ Lives decrement
   ✓ Ball resets above paddle

6. Destroy all bricks
   ✓ Win screen appears
   ✓ "You Win!" message visible

7. Click "Replay"
   ✓ Speed control reappears

8. Play until loss (no lives)
   ✓ Loss screen appears
   ✓ "Game Over" message visible

9. Navigate menus
   ✓ All buttons work
   ✓ Back button returns to previous screen
   ✓ Quit button closes game
```

### Gameplay Test Scenarios

#### Scenario: Normal Game Session
- [ ] Start from menu
- [ ] Set speed to 1.0
- [ ] Play until win
- [ ] Verify all bricks destroyed
- [ ] Verify lives remaining displayed

#### Scenario: Life Loss
- [ ] Start game
- [ ] Allow ball to fall without blocking
- [ ] Verify lives count decreases
- [ ] Verify ball resets above paddle
- [ ] Verify pause before ball moves again

#### Scenario: Game Over (Loss)
- [ ] Start game
- [ ] Repeatedly allow ball to fall 3 times
- [ ] Verify lives reach 0
- [ ] Verify loss screen appears
- [ ] Verify game stops (no more gameplay)

#### Scenario: Speed Variations
- [ ] Test speed 0.5 (slow) → ball moves slower
- [ ] Test speed 1.0 (normal) → baseline speed
- [ ] Test speed 2.0 (fast) → ball moves faster
- [ ] Verify speed persists during game
- [ ] Verify speed resets on new game

#### Scenario: Menu Navigation
- [ ] Main Menu → Speed Control → Playing → Win
- [ ] Win Screen → Main Menu → Main Menu
- [ ] Main Menu → Speed Control → Playing → Loss
- [ ] Loss Screen → Replay → Speed Control
- [ ] Loss Screen → Main Menu → Main Menu

#### Scenario: Edge Cases
- [ ] Ball hitting corner of paddle (angle extreme)
- [ ] Ball hitting corner of brick
- [ ] Multiple collisions in one frame (fast ball)
- [ ] Rapid keyboard input (left-right-left)
- [ ] Rapid button clicks (multiple clicks)

### Performance Testing

#### Frame Rate
- [ ] Monitor FPS during gameplay
- [ ] Target: 60 FPS consistent
- [ ] Acceptable: ≥50 FPS

#### Memory Usage
- [ ] Monitor for memory leaks
- [ ] Memory should stabilize after initial load
- [ ] No significant increase during long play sessions

#### CPU Usage
- [ ] Game loop should not consume >20% single-core CPU
- [ ] Pause should drop CPU usage significantly

## Observability Impact

### Logging for Debugging
```javascript
// Game start
console.log('Game initialized', { width: 800, height: 600, ballSpeed: 1.0 });

// Per-collision
console.log('Collision detected', { type: 'brick', brickIndex: 5 });

// Status changes
console.log('Game status', { from: 'playing', to: 'won' });

// Lives
console.log('Life lost', { lives: 2, bricksDestroyed: 23 });

// Game end
console.log('Game ended', { status: 'won', livesRemaining: 2 });
```

### Browser DevTools Checks
- Frame rate (60 FPS target)
- Memory steady (no growth)
- CPU usage moderate (<20%)
- No console errors
- DOM structure minimal and stable

## Success Criteria (Definition of Done)

- ✅ Game fully playable from start to end
- ✅ All menus navigate correctly
- ✅ Gameplay mechanics work as specified
- ✅ Win/Loss conditions trigger correctly
- ✅ Input is responsive and accurate
- ✅ Rendering smooth (60 FPS)
- ✅ No critical bugs or crashes
- ✅ Console clean (no errors)
- ✅ Cross-browser compatible (Chrome, Firefox, Safari, Edge)
- ✅ Code clean and maintainable
- ✅ All user stories satisfied

## Testing Checklist

### Before Merge
- [ ] Manual smoke test passed
- [ ] All gameplay scenarios tested
- [ ] No console errors
- [ ] Performance acceptable (60 FPS)
- [ ] Code review passed
- [ ] No blocking issues

### Browser Testing Checklist
- [ ] Chrome (Windows)
- [ ] Firefox (Windows)
- [ ] Safari (macOS) [if available]
- [ ] Edge (Windows)
- [ ] Chrome (macOS) [if available]

## Dependencies

- Slices 1–3 : All foundations completed
- Canvas 2D API
- HTML5, CSS3
- ES6 JavaScript

## Timeline Estimate

- **Effort** : 1–2 jours
- **Risk** : Moyen (intégration et testing critiques)
- **Blocker** : Slices 1–3 doivent être 100% complètes

## Acceptance Validation

### Product Owner Sign-Off Required
- [ ] Gameplay feels right (ball speed, paddle control)
- [ ] Menus are clear and intuitive
- [ ] No frustrating bugs
- [ ] Ready for use/demo

### Success Definition
- Game is playable from main menu to win/loss screen
- All user stories marked as implemented
- MVP definition met: "Functional and playable Breakout game"
