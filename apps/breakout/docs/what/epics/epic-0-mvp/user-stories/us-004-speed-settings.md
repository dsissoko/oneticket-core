# US-004 — Ball Speed Settings

## Story

**As a** player  
**I want to** adjust the ball speed before the game starts via a slider (from very slow to very fast)  
**So that** I can control the game difficulty

## Expected Behavior

- Speed slider is visible in the main menu before game start
- Slider ranges from **Very Slow** to **Very Fast** with visual labels
- Player can drag the slider to select any speed value between minimum and maximum
- Selected speed value is displayed next to the slider
- Speed adjustment takes effect when the next game starts (not retroactively during gameplay)
- Default speed is set to medium on menu load

## Acceptance Criteria

### Given the main menu is open
**When** I see the speed slider  
**Then** it ranges from 'Very Slow' to 'Very Fast'

### Given I adjust the slider
**When** I change the value  
**Then** the ball speed updates accordingly in the visual feedback (e.g., selected label/value updates)

### Given the game is running
**When** I started with a speed setting  
**Then** the ball maintains that speed throughout the entire game

### Given the slider is at its minimum
**When** the game plays  
**Then** the ball moves slowly

### Given the slider is at its maximum
**When** the game plays  
**Then** the ball moves very fast

## Technical Considerations

### UI Component
- **Slider Component**: HTML5 `<input type="range">` or custom styled slider
- **Range**: 0–100 (normalized) or direct multiplier (0.5–2.0× base velocity)
- **Labels**: 'Very Slow', 'Slow', 'Medium', 'Fast', 'Very Fast' (5-point scale)
- **Position**: Main menu, centered below Start button
- **Mouse Interaction**: Drag to adjust, click-to-position

### Speed Parameter Binding
- **State**: Store selected speed as a number in game context (e.g., `speedMultiplier: 1.0`)
- **Default**: 1.0 (medium speed)
- **Application**: Ball velocity magnitude = `baseVelocity × speedMultiplier`
- **Timing**: Speed is read at game start and frozen until next game restart
- **No Mid-Game Changes**: Speed slider is hidden or disabled during gameplay

### Implementation Notes
- Speed slider should not affect game physics during active gameplay
- Ball velocity magnitude remains constant during a game session (only direction changes on collisions)
- Speed multiplier should scale both X and Y velocity components equally to preserve reflection angles

## Story Points

**5 points**

Rationale: Medium complexity — requires slider UI component, state management for speed value, and binding to ball velocity calculation. No complex physics or collision logic; straightforward integration into existing game setup flow.

## Related Epic

[Epic 0 — MVP Breakout](epic.md)

## Related Slices

<!-- @architect fills this section after producing slices — write filename only, no relative path, no ../
     The build script resolves the correct path automatically.
     Example: [Slice 1 — Skeleton Foundation](slice-1-skeleton-foundation/slice.md) -->
