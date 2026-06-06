/**
 * StateMachine — manages game state and transitions
 */

import type { GameState } from './types'

export class StateMachine {
  private currentState: GameState = 'Start'
  private previousState: GameState = 'Start'

  constructor(initialState: GameState = 'Start') {
    this.currentState = initialState
    this.previousState = initialState
  }

  /**
   * Get the current game state
   */
  getState(): GameState {
    return this.currentState
  }

  /**
   * Get the previous game state
   */
  getPreviousState(): GameState {
    return this.previousState
  }

  /**
   * Transition to a new state
   */
  transitionTo(newState: GameState): boolean {
    if (newState === this.currentState) {
      return false // No change
    }

    // Validate transition
    if (!this.isValidTransition(this.currentState, newState)) {
      console.warn(
        `Invalid state transition: ${this.currentState} → ${newState}`
      )
      return false
    }

    this.previousState = this.currentState
    this.currentState = newState

    console.log(`State transition: ${this.previousState} → ${this.currentState}`)

    return true
  }

  /**
   * Check if a transition is valid
   */
  private isValidTransition(from: GameState, to: GameState): boolean {
    // Allow any transition for maximum flexibility during development
    // In production, this might be more restrictive
    return true
  }

  /**
   * Handle state entry logic
   */
  handleStateEnter(): void {
    // Will be implemented in Game component to initialize state-specific entities
  }

  /**
   * Handle state exit logic
   */
  handleStateExit(): void {
    // Will be implemented in Game component to cleanup state-specific entities
  }

  /**
   * Reset state machine to start
   */
  reset(): void {
    this.previousState = this.currentState
    this.currentState = 'Start'
  }
}
