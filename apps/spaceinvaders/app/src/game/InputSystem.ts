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

/**
 * Touch zone configuration
 * - Movement zone: bottom portion of screen (near player)
 * - Fire zone: upper portion of screen (for tap and fire)
 */
interface TouchZoneConfig {
  // Y threshold: touches below this Y are in movement zone
  // Touches above this Y are in fire zone
  movementZoneYThreshold: number
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
  private canvasHeight: number
  private zoneConfig: TouchZoneConfig

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

  constructor(
    window: Window,
    canvasWidth: number = 800,
    canvasHeight: number = 600,
    zoneConfig?: Partial<TouchZoneConfig>
  ) {
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    // Default: movement zone is bottom 30% of screen (near player)
    // Fire zone is top 70% (for tap and fire)
    this.zoneConfig = {
      movementZoneYThreshold: canvasHeight * 0.7, // 70% from top
      ...zoneConfig
    }
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
   * Get touch zones based on Y position (vertical split)
   * - Movement zone: bottom portion of screen (near player at y = canvasHeight - 50)
   * - Fire zone: upper portion of screen (for tap and fire)
   */
  getTouchZones(): TouchZone[] {
    const movementZoneYStart = this.zoneConfig.movementZoneYThreshold

    return [
      {
        x: 0,
        y: movementZoneYStart,
        width: this.canvasWidth,
        height: this.canvasHeight - movementZoneYStart,
        type: 'movement'
      },
      {
        x: 0,
        y: 0,
        width: this.canvasWidth,
        height: movementZoneYStart,
        type: 'fire'
      }
    ]
  }

  /**
   * Check if touch coordinates are in movement zone (bottom portion, near player)
   * Uses Y position to determine zone - touches near the player (bottom of screen)
   * are for swipe movement
   */
  isTouchInMovementZone(x: number, y: number): boolean {
    // Movement zone is below the Y threshold (bottom of screen, near player)
    return y >= this.zoneConfig.movementZoneYThreshold && y <= this.canvasHeight
  }

  /**
   * Check if touch coordinates are in fire zone (upper portion)
   * Uses Y position to determine zone - touches above the player
   * are for tap and fire only (no movement)
   */
  isTouchInFireZone(x: number, y: number): boolean {
    // Fire zone is above the Y threshold (top portion of screen)
    return y >= 0 && y < this.zoneConfig.movementZoneYThreshold
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
