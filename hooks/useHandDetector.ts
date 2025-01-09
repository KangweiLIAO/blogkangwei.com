import { useCallback, useRef } from 'react'
import { DETECTOR_CONFIG } from '@/constants/handpose'
import { debug } from '@/utils/handpose'
import * as tf from '@tensorflow/tfjs'
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'
import '@tensorflow/tfjs-backend-webgl'

/**
 * Custom hook for hand pose detection using TensorFlow.js and MediaPipe Hands model.
 * Provides functionality to initialize the detector, detect hands in video frames,
 * and reset the detector state.
 *
 * @returns {Object} Object containing detector control functions:
 *   - initializeDetector: Initializes the TensorFlow backend and hand detector
 *   - detectHands: Detects hands in a video frame
 *   - resetDetector: Resets the detector state
 */
export const useHandDetector = () => {
  const detectorRef = useRef<handPoseDetection.HandDetector | null>(null)

  const initializeDetector = useCallback(async () => {
    try {
      debug('Initializing TensorFlow.js backend')
      await tf.setBackend('webgl')
      await tf.ready()

      debug('Creating hand pose detector')
      const model = handPoseDetection.SupportedModels.MediaPipeHands
      detectorRef.current = await handPoseDetection.createDetector(model, DETECTOR_CONFIG)

      debug('Hand pose detector initialized successfully')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      debug('Initialization error:', err)
      throw new Error(`Failed to initialize hand pose detector: ${errorMessage}`)
    }
  }, [])

  /**
   * Detects hands in a video frame using the initialized detector
   * @param video - HTML video element containing the frame to analyze
   * @returns The first detected hand or null if no hands detected
   */
  const detectHands = useCallback(async (video: HTMLVideoElement) => {
    if (!detectorRef.current) {
      debug('Detector not initialized')
      return null
    }

    try {
      const hands = await detectorRef.current.estimateHands(video)
      debug('Hand estimation result', { handsDetected: hands.length, timestamp: Date.now() })
      return hands[0] || null
    } catch (err) {
      debug('Detection error:', err)
      throw err
    }
  }, [])

  /**
   * Resets the detector reference to null
   */
  const resetDetector = useCallback(() => {
    detectorRef.current = null
  }, [])

  return {
    initializeDetector,
    detectHands,
    resetDetector,
  }
}
