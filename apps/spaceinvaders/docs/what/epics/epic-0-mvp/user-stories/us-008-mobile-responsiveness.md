# US-008 — Mobile Responsiveness & Screen Containment

## Story

As a mobile player, I want the game to fit within my device's screen without requiring scrolling, and I want movement and fire controls to be clearly separate and easy to distinguish, so that I can play comfortably on any mobile device.

## Expected Behavior

### Screen Sizing
- Game canvas scales to fit within the device viewport (max 100% width and height)
- Canvas maintains 4:3 aspect ratio (800:600 equivalent)
- No horizontal or vertical scrolling required
- Padding/margins adapt to device orientation (portrait or landscape)
- Game remains centered on screen

### Mobile Control Differentiation
- **Left Side of Screen (40% width)**: Left/Right movement zone — swipes and taps are interpreted as directional movement
- **Right Side of Screen (60% width)**: Fire zone — taps are interpreted as fire commands only
- Visual UI indicators show control zones clearly (optional in MVP but recommended)
- Movement controls respond to horizontal swipes across the left zone
- Fire controls respond to taps/touches on the right zone
- Swipes that start on left and end on right (or vice versa) are disambiguated

### Touch Feedback
- Touch events have minimal latency (< 50ms response time)
- Visual feedback on touch (e.g., button press effect) for clarity
- No accidental double-fires from single tap events

### Orientation Support
- Portrait mode: game canvas takes full width with padding top/bottom
- Landscape mode: game canvas takes full height with padding left/right
- Orientation changes are handled smoothly without losing game state
- Game pauses briefly if orientation change is detected (or auto-resumes)

## Acceptance Criteria

```gherkin
Feature: Mobile Responsiveness and Screen Containment

Scenario: Game fits within mobile viewport in portrait mode
  Given I am using a mobile device in portrait orientation
  When the game loads
  Then the game canvas is visible without scrolling
  And the canvas width is 100% of viewport width
  And the canvas height is adjusted to maintain 4:3 aspect ratio
  And no horizontal or vertical scroll bar is visible

Scenario: Game fits within mobile viewport in landscape mode
  Given I am using a mobile device in landscape orientation
  When the game loads or orientation changes
  Then the game canvas is visible without scrolling
  And the canvas height is 100% of viewport height
  And the canvas width is adjusted to maintain 4:3 aspect ratio
  And no horizontal or vertical scroll bar is visible

Scenario: User swipes left in the left control zone
  Given the game is playing on a mobile device
  When I swipe left on the left 40% of the screen
  Then the cannon moves left
  And no fire event is triggered

Scenario: User swipes right in the left control zone
  Given the game is playing on a mobile device
  When I swipe right on the left 40% of the screen
  Then the cannon moves right
  And no fire event is triggered

Scenario: User taps in the right control zone
  Given the game is playing on a mobile device
  When I tap anywhere on the right 60% of the screen
  Then a bullet is fired
  And the cannon does not move

Scenario: User taps in the left control zone
  Given the game is playing on a mobile device
  When I tap the left 40% of the screen
  Then no fire event is triggered
  And movement may occur if configured as tap-to-toggle

Scenario: Orientation change is handled gracefully
  Given the game is playing on a mobile device
  When the device orientation changes
  Then the canvas is resized to fit the new viewport
  And the game state is preserved (not reset)
  And gameplay resumes without major disruption

Scenario: Touch response is fast
  Given the game is playing on a mobile device
  When I touch the screen
  Then the response is visible within 50ms
  And no input lag is perceptible
```

## Related Epic

[Epic 0 — MVP Space Invaders](epic.md)

## Related Slices

- [Slice 9 — Mobile Responsiveness](slice-9-mobile/slice.md)
