import type { VideoConstraints } from '@/types/handpose'

export const DETECTOR_CONFIG = {
  runtime: 'mediapipe' as const,
  modelType: 'full' as const,
  maxHands: 1,
  solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
} as const

export const FALLBACK_VIDEO_CONSTRAINTS: VideoConstraints = {
  video: {
    width: { min: 320, ideal: 640, max: 1280 },
    height: { min: 240, ideal: 480, max: 720 },
    facingMode: 'user',
  },
}
