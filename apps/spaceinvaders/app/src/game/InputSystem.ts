/**
 * InputSystem — handles keyboard and touch input
 */

import type { PlayerInputState } from './types'

interface TouchState {
  startX: number
  lastX: number
  swipeThreshold: number
}

export class InputSystem {
  private inputState: PlayerInputState = {
    left: false,
    right: false,
    fire: false
  }

  private touchState: TouchState = {
    startX: 0,
    lastX: 0,
    swipeThreshold: 30 // minimum distance to register as swipe
  }

  private keyMap: Record<string, keyof PlayerInputState> = {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    ' ': 'fire',
    'Control': 'fire'
  }

  private keyDownHandler: (event: KeyboardEvent) => void
  private keyUpHandler: (event: KeyboardEvent) => void
  private touchStartHandler: (event: TouchEvent) => void
  private touchMoveHandler: (event: TouchEvent) => void
  private touchEndHandler: (event: TouchEvent) => void

  constructor(window: Window) {
    // Bind handlers to preserve 'this' context
    this.keyDownHandler = this.onKeyDown.bind(this)
    this.keyUpHandler = this.onKeyUp.bind(this)
    this.touchStartHandler = this.onTouchStart.bind(this)
    this.touchMoveHandler = this.onTouchMove.bind(this)
    this.touchEndHandler = this.onTouchEnd.bind(this)

    // Add event listeners
    window.addEventListener('keydown', this.keyDownHandler)
    window.addEventListener('keyup', this.keyUpHandler)
    window.addEventListener('touchstart', this.touchStartHandler, false)
    window.addEventListener('touchmove', this.touchMoveHandler, false)
    window.addEventListener('touchend', this.touchEndHandler, false)
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
   * Handle touch start event
   */
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 0) return

    const touch = event.touches[0]
    this.touchState.startX = touch.clientX
    this.touchState.lastX = touch.clientX

    // Fire on touch start
    this.inputState.fire = true
  }

  /**
   * Handle touch move event - detect swipe left/right
   */
  onTouchMove(event: TouchEvent): void {
    if (event.touches.length === 0) return

    const touch = event.touches[0]
    const currentX = touch.clientX
    const deltaX = currentX - this.touchState.lastX

    // Detect left swipe
    if (deltaX < -this.touchState.swipeThreshold) {
      this.inputState.left = true
      this.inputState.right = false
    }
    // Detect right swipe
    else if (deltaX > this.touchState.swipeThreshold) {
      this.inputState.right = true
      this.inputState.left = false
    }

    this.touchState.lastX = currentX
  }

  /**
   * Handle touch end event
   */
  onTouchEnd(event: TouchEvent): void {
    // Reset touch-based input
    this.inputState.left = false
    this.inputState.right = false
    this.inputState.fire = false
  }

  /**
   * Detect swipe direction based on start and end positions
   */
  detectSwipe(startX: number, endX: number): -1 | 0 | 1 {
    const deltaX = endX - startX

    if (Math.abs(deltaX) < this.touchState.swipeThreshold) {
      return 0 // No significant swipe
    }

    return deltaX < 0 ? -1 : 1 // -1 for left, 1 for right
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
    const window = globalThis as unknown as Window
    window.removeEventListener('keydown', this.keyDownHandler)
    window.removeEventListener('keyup', this.keyUpHandler)
    window.removeEventListener('touchstart', this.touchStartHandler)
    window.removeEventListener('touchmove', this.touchMoveHandler)
    window.removeEventListener('touchend', this.touchEndHandler)
  }
}
