/**
 * InputSystem — handles keyboard input only.
 * Touch input is managed directly in Game.tsx via canvas listeners (Breakout pattern).
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

  private keyDownHandler: (event: KeyboardEvent) => void
  private keyUpHandler: (event: KeyboardEvent) => void

  constructor(window: Window) {
    this.keyDownHandler = this.onKeyDown.bind(this)
    this.keyUpHandler = this.onKeyUp.bind(this)
    window.addEventListener('keydown', this.keyDownHandler)
    window.addEventListener('keyup', this.keyUpHandler)
  }

  onKeyDown(event: KeyboardEvent): void {
    const action = this.keyMap[event.key]
    if (action) {
      this.inputState[action] = true
      if (event.key === ' ') event.preventDefault()
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    const action = this.keyMap[event.key]
    if (action) this.inputState[action] = false
  }

  /** Called from Game.tsx game loop each frame with touch-derived state */
  setLeft(v: boolean): void { this.inputState.left = v }
  setRight(v: boolean): void { this.inputState.right = v }
  setFire(v: boolean): void { this.inputState.fire = v }

  getInputState(): PlayerInputState {
    return { ...this.inputState }
  }

  resetInput(): void {
    this.inputState = { left: false, right: false, fire: false }
  }

  destroy(): void {
    const win = globalThis as unknown as Window
    win.removeEventListener('keydown', this.keyDownHandler)
    win.removeEventListener('keyup', this.keyUpHandler)
  }
}
