# User Story US-003: Ball Physics

## Summary
Enable realistic ball physics with collision detection and rebounding to ensure predictable game progression.

## Use Case

- **As a** player
- **I want** the ball to bounce realistically on walls, ceiling, paddle, and bricks
- **so that** I can progress in the game in a predictable manner

## Acceptance Criteria

### Scenario 1: Ball rebounds off bricks
- **Given** the ball is in motion
- **When** it hits a brick
- **Then** the brick is destroyed and the ball rebounds

### Scenario 2: Ball rebounds off walls and ceiling
- **Given** the ball is in motion
- **When** it hits a wall or ceiling
- **Then** the ball rebounds

### Scenario 3: Ball rebounds off paddle
- **Given** the ball is in motion
- **When** it hits the paddle
- **Then** the ball rebounds upward
