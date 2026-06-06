/**
 * InputSystem — handles keyboard and touch input
 */

import type { PlayerInputState } from './types'

interface TouchState {
  startX: number
  lastX: number
  startY: number
  swipeThreshold: number
  currentZone: 'movement' | 'fire' | null
}

export interface TouchZone {
  x: number
  y: number
  width: number
  height: number
  type: 'movement' | 'fire'
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
    startY: 0,
    swipeThreshold: 30, // minimum distance to register as swipe
    currentZone: null
  }

  private canvasWidth: number

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

  constructor(window: Window, canvasWidth: number = 800) {
    this.canvasWidth = canvasWidth
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
   * Handle touch start event - detect which zone touch originated in
   */
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 0) return

    const touch = event.touches[0]
    this.touchState.startX = touch.clientX
    this.touchState.startY = touch.clientY
    this.touchState.lastX = touch.clientX

    // Determine which zone the touch started in
    if (this.isTouchInMovementZone(touch.clientX, touch.clientY)) {
      this.touchState.currentZone = 'movement'
    } else if (this.isTouchInFireZone(touch.clientX, touch.clientY)) {
      this.touchState.currentZone = 'fire'
    } else {
      this.touchState.currentZone = null
    }
  }

  /**
   * Handle touch move event - detect continuous movement in left zone
   */
  onTouchMove(event: TouchEvent): void {
    if (event.touches.length === 0) return

    const touch = event.touches[0]
    const currentX = touch.clientX
    const deltaX = currentX - this.touchState.lastX

    // Only handle movement if touch started in movement zone
    if (this.touchState.currentZone === 'movement') {
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
    }

    this.touchState.lastX = currentX
  }

  /**
   * Handle touch end event - only trigger fire if touch ended in right zone
   */
  onTouchEnd(event: TouchEvent): void {
    // Only trigger fire if touch started in fire zone
    if (this.touchState.currentZone === 'fire') {
      this.inputState.fire = true
    } else {
      this.inputState.fire = false
    }

    // Reset movement-based input
    this.inputState.left = false
    this.inputState.right = false

    // Clear current zone tracking
    this.touchState.currentZone = null
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
   * Get touch zones based on canvas width
   * Left zone (40%) for movement, right zone (60%) for fire
   */
  getTouchZones(): TouchZone[] {
    const movementZoneWidth = this.canvasWidth * 0.4
    const fireZoneWidth = this.canvasWidth * 0.6

    return [
      {
        x: 0,
        y: 0,
        width: movementZoneWidth,
        height: window.innerHeight,
        type: 'movement'
      },
      {
        x: movementZoneWidth,
        y: 0,
        width: fireZoneWidth,
        height: window.innerHeight,
        type: 'fire'
      }
    ]
  }

  /**
   * Check if touch coordinates are in movement zone (left 40%)
   */
  isTouchInMovementZone(x: number, y: number): boolean {
    const movementZoneWidth = this.canvasWidth * 0.4
    return x >= 0 && x < movementZoneWidth && y >= 0 && y < window.innerHeight
  }

  /**
   * Check if touch coordinates are in fire zone (right 60%)
   */
  isTouchInFireZone(x: number, y: number): boolean {
    const movementZoneWidth = this.canvasWidth * 0.4
    return x >= movementZoneWidth && x < window.innerWidth && y >= 0 && y < window.innerHeight
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
