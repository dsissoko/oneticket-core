/**
 * ViewportManager — encapsulates viewport calculations
 * Handles aspect ratio (4:3), orientation detection, and canvas sizing
 */

export class ViewportManager {
  private readonly ASPECT_RATIO = 4 / 3 // 4:3 ratio

  /**
   * Get the viewport dimensions (window/container dimensions)
   */
  getViewportDimensions(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  /**
   * Calculate canvas size while maintaining 4:3 aspect ratio
   * Maximizes the canvas in the unconstrained dimension
   */
  calculateCanvasSize(
    desiredWidth: number,
    desiredHeight: number
  ): { width: number; height: number } {
    // Constrain to viewport
    const viewport = this.getViewportDimensions()
    let width = Math.min(desiredWidth, viewport.width)
    let height = Math.min(desiredHeight, viewport.height)

    const currentRatio = width / height
    const targetRatio = this.ASPECT_RATIO

    if (currentRatio > targetRatio) {
      // Too wide - constrain by height
      width = height * targetRatio
    } else {
      // Too tall - constrain by width
      height = width / targetRatio
    }

    return {
      width: Math.floor(width),
      height: Math.floor(height),
    }
  }

  /**
   * Get the scale factor (ratio of canvas size to viewport size)
   */
  getScaleFactor(): number {
    const viewport = this.getViewportDimensions()
    const canvasSize = this.calculateCanvasSize(viewport.width, viewport.height)

    // Use the smaller of the two scale factors (width or height)
    const scaleX = canvasSize.width / viewport.width
    const scaleY = canvasSize.height / viewport.height

    return Math.min(scaleX, scaleY)
  }

  /**
   * Determine if the viewport is in portrait orientation
   */
  isPortrait(): boolean {
    const viewport = this.getViewportDimensions()
    return viewport.height > viewport.width
  }
}
