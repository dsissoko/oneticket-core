/**
 * Input Handling Module
 *
 * Pure functions for processing user input (mouse and slider controls).
 * These utilities map raw input values to game logic parameters.
 */

/**
 * Maps mouse X position to paddle X position.
 *
 * Converts screen coordinates to game world coordinates, ensuring the paddle
 * stays within canvas bounds. The paddle is centered on the mouse.
 *
 * @param mouseX - Mouse X position in pixels (0 = left edge of canvas)
 * @param canvasWidth - Canvas width in pixels
 * @param paddleWidth - Paddle width in pixels
 * @returns Paddle X position (clamped to valid bounds)
 *
 * @example
 * // Mouse at 400px, canvas 800px wide, paddle 80px wide
 * mapMouseTopaddle(400, 800, 80) // ≈ 360 (centered on mouse, within bounds)
 *
 * // Mouse at right edge
 * mapMouseTopaddle(750, 800, 80) // = 720 (max allowed)
 *
 * // Mouse at left edge
 * mapMouseTopaddle(10, 800, 80) // = 0 (min allowed)
 */
export function mapMouseTopaddle(
  mouseX: number,
  canvasWidth: number,
  paddleWidth: number
): number {
  // Center paddle on mouse position
  const centeredX = mouseX - paddleWidth / 2;

  // Clamp to valid bounds [0, canvasWidth - paddleWidth]
  return Math.max(0, Math.min(centeredX, canvasWidth - paddleWidth));
}

/**
 * Converts slider input value to speed multiplier.
 *
 * Maps a slider value (typically 0-100 or 0-1) to a speed multiplier
 * for game physics. Uses linear interpolation between min and max bounds.
 *
 * @param sliderValue - Normalized slider value (typically 0-100 or 0-1)
 * @param minMultiplier - Minimum speed multiplier (default: 0.5)
 * @param maxMultiplier - Maximum speed multiplier (default: 2.0)
 * @returns Speed multiplier as a positive number
 *
 * @example
 * // Slider at 50 (midpoint) with default bounds
 * updateSpeedMultiplier(50) // ≈ 1.25 (midpoint between 0.5 and 2.0)
 *
 * // Slider at minimum
 * updateSpeedMultiplier(0) // = 0.5
 *
 * // Slider at maximum
 * updateSpeedMultiplier(100) // = 2.0
 *
 * // Custom multiplier bounds
 * updateSpeedMultiplier(50, 0.8, 3.0) // ≈ 1.9
 */
export function updateSpeedMultiplier(
  sliderValue: number,
  minMultiplier: number = 0.5,
  maxMultiplier: number = 2.0
): number {
  // Clamp slider value to valid range (assume 0-100 normalized)
  const normalized = Math.max(0, Math.min(sliderValue, 100)) / 100;

  // Linear interpolation between min and max multiplier
  return minMultiplier + normalized * (maxMultiplier - minMultiplier);
}
