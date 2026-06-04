# Space Invaders — System Context (C4 Level 1)

The system context shows how Space Invaders fits into the world of its users and external systems.

## Diagram

```mermaid
C4Context
  title System Context - Space Invaders
  
  Person(player, "Player", "Human actor playing the game")
  System(spaceinvaders, "Space Invaders", "2D arcade game in web browser with keyboard and touch input")
  System_Ext(browser, "Web Browser", "Hosts and renders the Space Invaders application")
  
  Rel(player, spaceinvaders, "Sends input via keyboard/touch")
  Rel(spaceinvaders, browser, "Runs within")
  Rel(browser, player, "Displays visuals and receives input events")
```

## Context

- **Player**: Human user interacting with the game via keyboard (desktop) or touch (mobile)
- **Space Invaders System**: Core game application with UI, game loop, entity management, and collision detection
- **Web Browser**: Runtime environment that hosts the React application, Canvas rendering, and JavaScript execution

## Key Interactions

- Player sends keyboard events (arrow keys, spacebar) or touch events (swipe, tap) to the game
- Browser provides the DOM, Canvas API, and event system for the game to run
- Game renders output to Canvas and updates HUD via React
