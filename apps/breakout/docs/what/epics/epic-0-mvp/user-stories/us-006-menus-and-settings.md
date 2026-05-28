---
title: US-006 — Menus and Settings
status: pending
priority: high
epic: epic-0-mvp
---

# US-006 — Menus and Settings

## Summary

As a player, I want to access main menu buttons and configure ball speed via a slider, so that I can start games, adjust difficulty, and return to the menu at any time.

---

## Use Case

- **As a** player launching the game or finishing a game
- **I want to** see a main menu with Start, Settings, and Quit buttons, and access a settings menu where I can adjust the ball speed slider
- **so that** I can control the game pace according to my skill level and easily navigate between game states

---

## Acceptance Criteria

### Scenario 1: Main Menu Display and Navigation

- **Given:** the game has just started
- **and Given:** the player has not yet started playing
- **When:** the game loads
- **Then:** the main menu is displayed with three visible buttons: "Start", "Settings", and "Quit"

### Scenario 2: Settings Menu Access

- **Given:** the main menu is displayed
- **When:** the player clicks the "Settings" button
- **Then:** the settings menu opens showing a ball speed slider control

### Scenario 3: Ball Speed Slider Configuration

- **Given:** the settings menu is open and displaying the ball speed slider
- **and Given:** the slider has a visual range from "Very Slow" to "Very Fast"
- **When:** the player moves the slider to a new position
- **Then:** the selected speed value is visually reflected on the slider (e.g., position, label, or numeric indicator)

### Scenario 4: Start Game from Main Menu

- **Given:** the main menu is displayed
- **When:** the player clicks the "Start" button
- **Then:** the gameplay begins with the paddle, ball, and brick wall rendered and visible

### Scenario 5: Quit Game

- **Given:** the main menu is displayed
- **When:** the player clicks the "Quit" button
- **Then:** the game window closes or the game halts gracefully (browser-compatible exit)

### Scenario 6: Return to Main Menu After Game

- **Given:** a game is in progress
- **and Given:** the game ends (either victory or defeat state is reached)
- **When:** the end-game screen displays with replay/quit options
- **Then:** clicking "Quit" returns the player to the main menu

### Scenario 7: Replay Game with New Speed Settings

- **Given:** the game has ended (victory or defeat)
- **and Given:** the player previously configured a ball speed setting
- **When:** the player clicks "Replay" or "Start" again
- **Then:** the game starts with the previously configured ball speed value applied

---

## Acceptance Notes

- **Menu buttons:** Must be clickable via mouse input
- **Slider:** Must be a continuous control allowing smooth selection across the speed range
- **Visual feedback:** Slider position and/or label must clearly indicate the current selected speed
- **State persistence (in-session):** Ball speed setting must persist across game replays during the same session
- **Keyboard alternative (optional V1):** No keyboard navigation required for menus in V1; mouse-only is acceptable

---

## Related Components

- Main menu UI rendering
- Settings menu UI rendering
- Ball speed slider input handler
- Game state transition logic (menu ↔ gameplay ↔ end-game)
- Button click event handlers

---

## Definition of Done

- [x] All acceptance criteria pass functional testing
- [x] Settings menu and main menu are visually distinct
- [x] Slider updates are immediately visible
- [x] No JavaScript errors in browser console
- [x] Transitions between menu states are smooth
- [x] Speed setting is applied correctly on game start
