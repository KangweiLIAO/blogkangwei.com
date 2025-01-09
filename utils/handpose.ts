/**
 * Utility functions for hand pose detection and camera handling.
 * Provides functionality for:
 * - Debug logging with duplicate prevention
 * - Video readiness checking
 * - Window coordinate calculation from video coordinates
 * - Hand data validation
 * - Camera error handling and user-friendly messages
 */

import type { Hand } from '@tensorflow-models/hand-pose-detection'

// Keep track of logged messages to prevent duplicates in strict mode
const loggedMessages = new Set<string>()

/**
 * Debug logging function that prevents duplicate messages in development
 * @param message - Debug message to log
 * @param data - Optional data to log with the message
 */
export const debug = (message: string, data?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    const logKey = `${message}-${JSON.stringify(data)}`
    if (!loggedMessages.has(logKey)) {
      console.log(`[HandposeDetector] ${message}`, data || '')
      loggedMessages.add(logKey)
      // Clear the set after a short delay to allow for future logs of the same message
      setTimeout(() => loggedMessages.delete(logKey), 100)
    }
  }
}

/**
 * Checks if a video element is ready for processing
 * @param video - Video element to check
 * @returns boolean indicating if video is ready (has dimensions and fully loaded)
 */
export const isVideoReady = (video: HTMLVideoElement): boolean => {
  return !!(video.videoWidth && video.videoHeight && video.readyState === 4)
}

/**
 * Converts video coordinates to window coordinates
 * @param indexTip - Point coordinates in video space
 * @param video - Video element for reference dimensions
 * @returns Coordinates mapped to window space
 */
export const calculateWindowCoordinates = (
  indexTip: { x: number; y: number },
  video: HTMLVideoElement
) => {
  const { videoWidth, videoHeight } = video
  const windowX = ((videoWidth - indexTip.x) / videoWidth) * window.innerWidth
  const windowY = (indexTip.y / videoHeight) * window.innerHeight

  return { windowX, windowY }
}

/**
 * Validates hand detection data for completeness and coordinate validity
 * @param hand - Hand detection data to validate
 * @returns boolean indicating if hand data is valid
 */
export const validateHandData = (hand: Hand) => {
  if (!hand.keypoints || hand.keypoints.length < 21) {
    debug('Invalid hand keypoints', { keypoints: hand.keypoints })
    return false
  }

  // Validate all keypoints have valid coordinates
  const hasInvalidKeypoint = hand.keypoints.some(
    (keypoint) => !keypoint || !Number.isFinite(keypoint.x) || !Number.isFinite(keypoint.y)
  )

  if (hasInvalidKeypoint) {
    debug('Invalid keypoint coordinates found', hand.keypoints)
    return false
  }

  return true
}

/**
 * Converts camera errors into user-friendly messages
 * @param err - Error from camera setup/access
 * @returns User-friendly error message
 */
export const handleCameraError = (err: unknown) => {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error'
  debug('Camera setup error:', err)

  if (err instanceof Error) {
    switch (err.name) {
      case 'NotAllowedError':
        return 'Camera access denied. Please enable camera access in your browser settings.'
      case 'NotFoundError':
        return 'No camera found on your device'
      case 'NotReadableError':
        return 'Camera is in use or not available. Please close other applications using the camera and refresh the page.'
      default:
        return `Error accessing camera: ${errorMessage}`
    }
  }
  return 'Unknown camera error occurred'
}
