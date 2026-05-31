# US-002 — Implement Collision Detection and Brick Destruction

## Goal

Detect collisions between the ball and game entities (paddle, bricks, walls) and implement brick destruction mechanics.

## Acceptance Criteria

- Ball bounces off top and side walls with accurate velocity reversal
- Ball bounces off paddle with correct angle and velocity direction
- Ball collides with bricks and destroys them on contact
- Each brick is destroyed exactly once per game
- Ball velocity reverses correctly on all collision types (Y-velocity for horizontal surfaces, X-velocity for vertical surfaces)
- Destroyed bricks are removed from rendering and collision checks
- Collision detection is mutually exclusive per frame (no double-collisions)

## Business Value

Collision detection is the core mechanic of Breakout. Accurate physics and brick destruction create the engaging gameplay loop that defines the player experience.
