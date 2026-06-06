import { useState, useEffect, useCallback } from 'react'

/**
 * ViewportState represents the current viewport and responsive canvas dimensions
 */
export interface ViewportState {
  viewportWidth: number
  viewportHeight: number
  orientation: 'portrait' | 'landscape'
  scaleFactor: number
  canvasWidth: number
  canvasHeight: number
}

/**
 * Constants for canvas sizing
 */
const LOGICAL_WIDTH = 800
const LOGICAL_HEIGHT = 600
const ASPECT_RATIO = LOGICAL_WIDTH / LOGICAL_HEIGHT // 1.333...

/**
 * Custom hook to manage responsive viewport state and canvas sizing
 * 
 * Features:
 * - Detects viewport dimensions using window.innerWidth and window.innerHeight
 * - Detects device orientation (portrait vs landscape)
 * - Calculates responsive canvas size maintaining 4:3 aspect ratio
 * - Returns ViewportState with all necessary dimensions and scale factor
 * - Registers window resize and orientationchange listeners
 * - Cleans up listeners on unmount
 * 
 * @returns ViewportState object with viewport and canvas dimensions
 */
export function useResponsiveViewport(): ViewportState {
  const [viewportState, setViewportState] = useState<ViewportState>(() => {
    return calculateViewportState()
  })

  /**
   * Determines device orientation based on viewport dimensions
   */
  const getOrientation = useCallback((): 'portrait' | 'landscape' => {
    return window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape'
  }, [])

  /**
   * Calculates responsive canvas dimensions maintaining 4:3 aspect ratio
   * 
   * Strategy:
   * - In portrait mode: use full viewport width, calculate height from aspect ratio
   * - In landscape mode: use full viewport height, calculate width from aspect ratio
   * - Ensure canvas fits within viewport without scrolling
   */
  const calculateCanvasSize = useCallback(
    (): { canvasWidth: number; canvasHeight: number; scaleFactor: number } => {
      const orientation = getOrientation()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let canvasWidth: number
      let canvasHeight: number

      if (orientation === 'portrait') {
        // Portrait: use full width, calculate height from aspect ratio
        canvasWidth = Math.min(viewportWidth, LOGICAL_WIDTH)
        canvasHeight = Math.round(canvasWidth / ASPECT_RATIO)

        // If calculated height exceeds viewport height, constrain by height instead
        if (canvasHeight > viewportHeight) {
          canvasHeight = Math.min(viewportHeight, LOGICAL_HEIGHT)
          canvasWidth = Math.round(canvasHeight * ASPECT_RATIO)
        }
      } else {
        // Landscape: use full height, calculate width from aspect ratio
        canvasHeight = Math.min(viewportHeight, LOGICAL_HEIGHT)
        canvasWidth = Math.round(canvasHeight * ASPECT_RATIO)

        // If calculated width exceeds viewport width, constrain by width instead
        if (canvasWidth > viewportWidth) {
          canvasWidth = Math.min(viewportWidth, LOGICAL_WIDTH)
          canvasHeight = Math.round(canvasWidth / ASPECT_RATIO)
        }
      }

      // Calculate scale factor for coordinate transformation
      const scaleFactor = canvasWidth / LOGICAL_WIDTH

      return { canvasWidth, canvasHeight, scaleFactor }
    },
    [getOrientation]
  )

  /**
   * Main function to calculate complete viewport state
   */
  const calculateViewportState = useCallback((): ViewportState => {
    const orientation = getOrientation()
    const { canvasWidth, canvasHeight, scaleFactor } = calculateCanvasSize()

    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      orientation,
      scaleFactor,
      canvasWidth,
      canvasHeight,
    }
  }, [getOrientation, calculateCanvasSize])

  /**
   * Handle resize and orientation change events
   */
  const handleViewportChange = useCallback(() => {
    setViewportState(calculateViewportState())
  }, [calculateViewportState])

  /**
   * Register listeners on mount and cleanup on unmount
   */
  useEffect(() => {
    // Register resize listener
    window.addEventListener('resize', handleViewportChange)

    // Register orientation change listener for better mobile support
    window.addEventListener('orientationchange', handleViewportChange)

    // Return cleanup function
    return () => {
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('orientationchange', handleViewportChange)
    }
  }, [handleViewportChange])

  return viewportState
}
