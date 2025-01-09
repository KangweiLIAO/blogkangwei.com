/**
 * Represents a point in 2D space with x and y coordinates
 */
export interface HandPoint {
  x: number
  y: number
}

/**
 * Props for the HandposeDetector component
 * @param onHandMove - Callback fired when hand position changes, receives array of hand points
 * @param isEnabled - Whether hand detection is currently enabled
 */
export interface HandposeDetectorProps {
  onHandMove: (handPoints: HandPoint[]) => void
  isEnabled: boolean
}

/**
 * Configuration options for video/camera constraints
 * Used when initializing the webcam feed
 */
export interface VideoConstraints {
  video: {
    width: { min?: number; ideal: number; max?: number }
    height: { min?: number; ideal: number; max?: number }
    facingMode: 'user'
    frameRate?: { ideal: number }
  }
}

/**
 * State interface for the hand detector
 * Tracks model loading, permissions and error states
 */
export interface DetectorState {
  isModelLoaded: boolean
  hasRequestedPermission: boolean
  error: string | null
}
