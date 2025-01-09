import type { VideoConstraints } from '@/types/handpose'

/**
 * Configuration for the MediaPipe Hands detector.
 * - runtime: Uses MediaPipe runtime for hand detection
 * - modelType: Uses full model for better accuracy (vs 'lite')
 * - maxHands: Only detect one hand at a time
 * - solutionPath: CDN path to load MediaPipe Hands model
 * - minDetectionConfidence: Minimum confidence value (0-1) for hand detection
 * - minTrackingConfidence: Minimum confidence value (0-1) for hand tracking
 */
export const DETECTOR_CONFIG = {
  runtime: 'mediapipe' as const,
  modelType: 'full' as const,
  maxHands: 1,
  solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
} as const

/**
 * Fallback video constraints for camera initialization.
 * - width: Minimum 320px, ideal 640px, maximum 1280px
 * - height: Minimum 240px, ideal 480px, maximum 720px
 * - facingMode: 'user' for front-facing camera
 */
export const FALLBACK_VIDEO_CONSTRAINTS: VideoConstraints = {
  video: {
    width: { min: 320, ideal: 640, max: 1280 },
    height: { min: 240, ideal: 480, max: 720 },
    facingMode: 'user',
  },
}
