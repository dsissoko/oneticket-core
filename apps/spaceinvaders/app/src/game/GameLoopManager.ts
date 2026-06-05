/**
 * GameLoopManager — orchestrates the game loop using requestAnimationFrame
 * with delta-time calculations
 */

export class GameLoopManager {
  private animationFrameId: number | null = null
  private lastFrameTime: number = 0
  private isRunning: boolean = false

  constructor(
    private canvas: HTMLCanvasElement,
    private onUpdate: (deltaTime: number) => void,
    private onRender: () => void
  ) {}

  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.lastFrameTime = performance.now()
    this.scheduleFrame()
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.isRunning = false
  }

  /**
   * Check if loop is currently running
   */
  isActive(): boolean {
    return this.isRunning
  }

  /**
   * Schedule the next frame
   */
  private scheduleFrame(): void {
    this.animationFrameId = requestAnimationFrame((currentTime: number) => {
      const deltaTime = currentTime - this.lastFrameTime
      this.lastFrameTime = currentTime

      // Update game state
      this.onUpdate(deltaTime)

      // Render to canvas
      this.onRender()

      // Schedule next frame if still running
      if (this.isRunning) {
        this.scheduleFrame()
      }
    })
  }

  /**
   * Get the last frame delta time (in milliseconds)
   */
  getLastDeltaTime(): number {
    return this.lastFrameTime
  }
}
