/**
 * InputSystem — handles keyboard and touch input
 */

import type { PlayerInputState } from './types'

export class InputSystem {
  private inputState: PlayerInputState = {
    left: false,
    right: false,
    fire: false
  }

  private keyMap: Record<string, keyof PlayerInputState> = {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    ' ': 'fire',
    'Control': 'fire'
  }

  constructor(window: Window) {
    window.addEventListener('keydown', this.onKeyDown.bind(this))
    window.addEventListener('keyup', this.onKeyUp.bind(this))
    window.addEventListener('touchstart', this.onTouchStart.bind(this), false)
    window.addEventListener('touchend', this.onTouchEnd.bind(this), false)
  }

  /**
   * Handle key down event
   */
  onKeyDown(event: KeyboardEvent): void {
    const action = this.keyMap[event.key]
    if (action) {
      this.inputState[action] = true
      // Prevent default behavior for spacebar
      if (event.key === ' ') {
        event.preventDefault()
      }
    }
  }

  /**
   * Handle key up event
   */
  onKeyUp(event: KeyboardEvent): void {
    const action = this.keyMap[event.key]
    if (action) {
      this.inputState[action] = false
    }
  }

  /**
   * Handle touch start event (scaffolding for mobile)
   */
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 0) return

    const touch = event.touches[0]
    const clientX = touch.clientX

    // Detect which side of screen for left/right movement
    // Left third = move left, right third = move right
    // (implementation will be refined in later slices)
  }

  /**
   * Handle touch end event
   */
  onTouchEnd(event: TouchEvent): void {
    // Reset touch-based input
    // (implementation will be refined in later slices)
  }

  /**
   * Get current input state
   */
  getInputState(): PlayerInputState {
    return { ...this.inputState }
  }

  /**
   * Reset input state to all false
   */
  resetInput(): void {
    this.inputState = {
      left: false,
      right: false,
      fire: false
    }
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown.bind(this))
    window.removeEventListener('keyup', this.onKeyUp.bind(this))
    window.removeEventListener('touchstart', this.onTouchStart.bind(this))
    window.removeEventListener('touchend', this.onTouchEnd.bind(this))
  }
}
