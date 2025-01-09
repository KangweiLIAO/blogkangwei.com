import { useCallback, useRef } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import { DETECTOR_CONFIG } from '@/constants/handpose'
import { debug } from '@/utils/handpose'

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

  const resetDetector = useCallback(() => {
    detectorRef.current = null
  }, [])

  return {
    initializeDetector,
    detectHands,
    resetDetector,
  }
}
