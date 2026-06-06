# Slice 9 — Mobile Responsiveness & Screen Containment

## Goal

Make the Space Invaders game playable on mobile devices by implementing responsive canvas sizing that fits within the viewport without scrolling, and by clearly separating movement controls (left side of screen) from fire controls (right side of screen) so that users can intuitively interact with the game on small screens.

## Related Epics

[Epic 0 — MVP Space Invaders](../../what/epics/epic-0-mvp/epic.md)

## Related User Stories

[US-008 — Mobile Responsiveness & Screen Containment](../../what/epics/epic-0-mvp/user-stories/us-008-mobile-responsiveness.md)

## Related Slices

- [Slice 1 — Foundation: Game Loop, Canvas Setup, UI Framework](../slice-1-foundation/slice.md)
- [Slice 3 — Player Control & Firing](../slice-3-player/slice.md)

## Impacted Components

### Core Components
- **Game Component (React)**: Canvas sizing logic, viewport listener, orientation change handler
- **InputSystem**: Zone-based input detection (left zone = movement, right zone = fire)
- **RenderingSystem**: Canvas scaling and coordinate transformation
- **Responsive CSS**: Viewport meta tag, mobile-friendly styling

### Data Structures
- **ViewportState** (useRef): Track device viewport dimensions, orientation, scale factor
- **ControlZones**: Define left (40%) and right (60%) control zones based on canvas width
- **TouchZoneContext**: Map touch coordinates to control zones

## Interfaces

### ViewportManager
```typescript
interface ViewportState {
  viewportWidth: number
  viewportHeight: number
  orientation: 'portrait' | 'landscape'
  scaleFactor: number
  canvasWidth: number
  canvasHeight: number
}

class ViewportManager {
  getViewportDimensions(): { width: number; height: number }
  calculateCanvasSize(desiredWidth: number, desiredHeight: number): { width: number; height: number }
  getScaleFactor(): number
  isPortrait(): boolean
}
```

### InputSystem (Enhanced)
```typescript
interface TouchZone {
  x: number
  y: number
  width: number
  height: number
  type: 'movement' | 'fire'
}

class InputSystem {
  // Existing methods
  onKeyDown(event: KeyboardEvent): void
  onKeyUp(event: KeyboardEvent): void
  getInputState(): PlayerInputState

  // New methods
  getTouchZones(): TouchZone[]
  isTouchInMovementZone(x: number, y: number): boolean
  isTouchInFireZone(x: number, y: number): boolean
  onTouchStart(event: TouchEvent): void  // Enhanced
  onTouchEnd(event: TouchEvent): void    // Enhanced
  onTouchMove(event: TouchEvent): void   // New
}
```

### RenderingSystem (Enhanced)
```typescript
class RenderingSystem {
  // Existing methods
  clear(): void
  drawFormation(formation: Formation): void
  drawPlayer(player: Player): void

  // New methods
  setCanvasSize(width: number, height: number): void
  getCanvasWidth(): number
  getCanvasHeight(): number
  scaleCoordinates(x: number, y: number): { x: number; y: number }
}
```

## Data Changes

### React State (UI)
```typescript
interface ResponsiveGameState {
  // Existing state
  gameState: GameState
  score: number
  lives: number
  waveNumber: number

  // New state
  isMobileView: boolean
  deviceOrientation: 'portrait' | 'landscape'
  canvasScale: number
}
```

### Canvas Sizing Logic
```typescript
const LOGICAL_WIDTH = 800
const LOGICAL_HEIGHT = 600
const ASPECT_RATIO = LOGICAL_WIDTH / LOGICAL_HEIGHT // 1.333...

function calculateResponsiveCanvasSize(
  viewportWidth: number,
  viewportHeight: number
): { width: number; height: number } {
  // In portrait: use full width, reduce height
  // In landscape: use full height, reduce width
  // Always maintain 4:3 aspect ratio
}
```

## Sequence Flow

### Initialization (on component mount)
1. Detect viewport dimensions using `window.innerWidth` and `window.innerHeight`
2. Detect device orientation (portrait vs landscape)
3. Calculate responsive canvas size maintaining 4:3 aspect ratio
4. Set canvas CSS `max-width: 100%`, `max-height: 100%`
5. Create ViewportManager instance to handle sizing
6. Register resize listener on `window`
7. Register orientation change listener on `window`
8. Initialize InputSystem with mobile detection flags

### Responsive Sizing (on viewport change)
1. Listener fires when viewport dimensions change
2. Recalculate canvas size based on new viewport
3. Update canvas element size (not logical size)
4. Recalculate touch control zones (left 40%, right 60%)
5. Update scale factor for coordinate transformation
6. Trigger canvas redraw (next animation frame)

### Touch Input Detection (enhanced)
1. On `touchstart`: Identify which zone(s) touch originated in
2. If in left zone → prepare for movement input
3. If in right zone → prepare for fire input
4. On `touchmove` in left zone → update movement direction
5. On `touchend` in left zone → clear movement flags
6. On `touchend` in right zone → trigger fire event
7. If touch crosses zone boundary → disambiguate based on majority of drag distance

### Orientation Change Handling
1. Window fires `orientationchange` or `resize` event
2. Detect change from portrait → landscape or vice versa
3. Pause game briefly (optional, < 200ms)
4. Recalculate canvas size
5. Preserve game state (formation position, player lives, score)
6. Resume game at same state

## Deliverables

### Code Files
1. **src/hooks/useResponsiveViewport.ts** (NEW)
   - Custom hook to manage viewport state
   - Returns ViewportState and resize handler
   - Handles portrait/landscape detection
   - Calculates responsive canvas dimensions

2. **src/game/ViewportManager.ts** (NEW)
   - Calculates canvas size based on viewport
   - Maintains 4:3 aspect ratio
   - Provides scale factor for coordinate mapping
   - Handles orientation changes

3. **src/components/Game.tsx** (MODIFIED)
   - Remove hardcoded `CANVAS_WIDTH = 800` and `CANVAS_HEIGHT = 600`
   - Use `useResponsiveViewport()` hook
   - Pass responsive dimensions to canvas setup
   - Register resize/orientation listeners
   - Apply responsive CSS to canvas container

4. **src/game/InputSystem.ts** (MODIFIED)
   - Add `getTouchZones()` method
   - Implement `isTouchInMovementZone()` and `isTouchInFireZone()`
   - Enhance `onTouchStart()` to detect zone
   - Enhance `onTouchEnd()` to trigger correct event based on zone
   - Add `onTouchMove()` for continuous movement tracking

5. **src/game/RenderingSystem.ts** (MODIFIED)
   - Store `canvasWidth` and `canvasHeight` as dynamic properties
   - Add `setCanvasSize(width, height)` method
   - Update all drawing operations to use dynamic dimensions
   - Ensure text positioning (HUD) scales correctly

6. **src/styles/responsive.css** (NEW)
   - Set `body { overflow: hidden; margin: 0; padding: 0; }`
   - Set `canvas { display: block; max-width: 100vw; max-height: 100vh; margin: auto; }`
   - Ensure canvas container fills viewport
   - Remove any scrollbars

7. **src/components/MobileControls.tsx** (OPTIONAL)
   - Visual overlay showing control zones (left/right split)
   - Appears in development mode or on first load
   - Helps users understand where to swipe/tap
   - Can be dismissed

### HTML Meta Tags (index.html)
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

## Success Criteria

✅ **Canvas scales to viewport** — Canvas fills 100% of viewport on mobile without scrolling  
✅ **Maintains 4:3 aspect ratio** — Canvas proportions remain consistent across all screen sizes  
✅ **Portrait mode works** — Game playable in portrait orientation (e.g., iPhone held vertically)  
✅ **Landscape mode works** — Game playable in landscape orientation (e.g., iPhone held horizontally)  
✅ **Orientation change handled** — Switching between portrait/landscape doesn't crash or reset game  
✅ **Touch zones separated** — Left 40% of screen triggers movement, right 60% triggers fire  
✅ **No accidental fires** — Swiping left/right doesn't fire bullets  
✅ **Fire is responsive** — Tapping right zone fires immediately without lag  
✅ **Movement is smooth** — Continuous swipe/drag in left zone results in smooth movement  
✅ **No scrollbars** — Game is contained within viewport, no horizontal/vertical overflow  
✅ **Touch feedback** — Visual or haptic feedback on touch (if supported by device)  
✅ **Desktop unaffected** — Desktop keyboard controls still work as before  

## Observability Impact

### Console Logging (Development)
- Viewport changes: `console.log('Viewport: ${width}x${height}, orientation: ${orientation}')`
- Touch zone detection: `console.log('Touch in ${zone} zone at (${x}, ${y})')`
- Canvas resize: `console.log('Canvas resized to ${canvasWidth}x${canvasHeight}')`

### React DevTools
- Track `isMobileView`, `deviceOrientation`, `canvasScale` in React tree
- Verify state updates on orientation change

### Touch Debugging
- Draw touch zone boundaries in debug overlay (development mode)
- Log all touch events with coordinates

## Testing Strategy

### Unit Tests
- ViewportManager calculates correct dimensions for various viewport sizes
- InputSystem correctly identifies touch zone (left vs right)
- Touch zone boundaries are correct (40%/60% split)

### Integration Tests
- Load game on mobile device in portrait mode → canvas fits without scrolling
- Rotate device to landscape → canvas resizes without losing game state
- Swipe left zone → cannon moves left
- Tap right zone → bullet fires
- Tap left zone → no bullet fires
- Viewport resize (e.g., browser dev tools) → canvas resizes responsively

### Manual Testing
- Test on iPhone (Safari)
- Test on Android (Chrome)
- Test on iPad (landscape and portrait)
- Test orientation changes mid-game
- Test with different viewport sizes (desktop emulation in dev tools)
- Verify no scrollbars appear
- Verify FPS remains stable (60 FPS) after responsiveness changes
- Test touch responsiveness (< 50ms latency)
