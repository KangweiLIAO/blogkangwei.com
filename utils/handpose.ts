import type { Hand } from '@tensorflow-models/hand-pose-detection'

// Keep track of logged messages to prevent duplicates in strict mode
const loggedMessages = new Set<string>()

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

export const isVideoReady = (video: HTMLVideoElement): boolean => {
  return !!(video.videoWidth && video.videoHeight && video.readyState === 4)
}

export const calculateWindowCoordinates = (
  indexTip: { x: number; y: number },
  video: HTMLVideoElement
) => {
  const { videoWidth, videoHeight } = video
  const windowX = ((videoWidth - indexTip.x) / videoWidth) * window.innerWidth
  const windowY = (indexTip.y / videoHeight) * window.innerHeight

  return { windowX, windowY }
}

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
