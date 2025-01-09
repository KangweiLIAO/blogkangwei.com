'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { useCamera } from '@/hooks/useCamera'
import { useHandDetector } from '@/hooks/useHandDetector'
import type { DetectorState, HandposeDetectorProps } from '@/types/handpose'
import { debug, isVideoReady, validateHandData, calculateWindowCoordinates } from '@/utils/handpose'

/**
 * HandposeDetector component handles real-time hand pose detection using a webcam feed.
 * It manages camera access, model initialization, and continuous hand detection.
 *
 * @param {HandposeDetectorProps} props
 * @param {(points: {x: number, y: number}[]) => void} props.onHandMove - Callback fired when hand position changes
 * @param {boolean} props.isEnabled - Whether hand detection is currently enabled
 *
 * The component:
 * 1. Sets up camera access and initializes TensorFlow hand detection model
 * 2. Runs continuous detection loop when enabled
 * 3. Processes detected hand data into window coordinates
 * 4. Cleans up resources when disabled
 *
 * State management:
 * - isModelLoaded: Whether TensorFlow model is initialized
 * - hasRequestedPermission: Whether camera permissions were requested
 * - error: Any error state during setup/detection
 */
export function HandposeDetector({ onHandMove, isEnabled }: HandposeDetectorProps) {
  const { videoRef, setupCamera, releaseCamera } = useCamera()
  const { initializeDetector, detectHands, resetDetector } = useHandDetector()
  const animationFrameRef = useRef<number>()

  const [state, setState] = useState<DetectorState>({
    isModelLoaded: false,
    hasRequestedPermission: false,
    error: null,
  })

  const processHandData = useCallback(
    async (video: HTMLVideoElement) => {
      try {
        const hand = await detectHands(video)
        if (!hand || !validateHandData(hand)) return

        debug('Hand data', {
          handedness: hand.handedness,
          score: hand.score,
          keypoints: hand.keypoints?.map((kp) => ({
            name: kp.name,
            x: Math.round(kp.x),
            y: Math.round(kp.y),
            z: Math.round(kp.z || 0),
          })),
        })

        const handPoints = hand.keypoints.map((keypoint) => {
          const { windowX, windowY } = calculateWindowCoordinates(keypoint, video)
          return { x: windowX, y: windowY }
        })

        onHandMove(handPoints)
      } catch (err) {
        debug('Hand processing error:', err)
        if (err instanceof Error) {
          setState((prev) => ({ ...prev, error: `Hand detection error: ${err.message}` }))
        }
      }
    },
    [detectHands, onHandMove]
  )

  const runDetectionLoop = useCallback(async () => {
    if (!videoRef.current || !isVideoReady(videoRef.current)) return

    await processHandData(videoRef.current)
    if (isEnabled) {
      animationFrameRef.current = requestAnimationFrame(runDetectionLoop)
    }
  }, [isEnabled, processHandData])

  useEffect(() => {
    if (!isEnabled || state.hasRequestedPermission) return

    const initialize = async () => {
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        setState((prev) => ({
          ...prev,
          error: 'Hand pose detection requires a secure context (HTTPS or localhost)',
        }))
        return
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setState((prev) => ({ ...prev, error: 'Your browser does not support camera access' }))
        return
      }

      try {
        await setupCamera()
        await initializeDetector()
        setState((prev) => ({ ...prev, isModelLoaded: true, hasRequestedPermission: true }))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setState((prev) => ({ ...prev, error: errorMessage }))
      }
    }

    initialize()
  }, [isEnabled, state.hasRequestedPermission, setupCamera, initializeDetector])

  useEffect(() => {
    if (!isEnabled || !state.isModelLoaded || !state.hasRequestedPermission) return

    runDetectionLoop()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isEnabled, state.isModelLoaded, state.hasRequestedPermission, runDetectionLoop])

  useEffect(() => {
    if (!isEnabled) {
      setState({
        isModelLoaded: false,
        hasRequestedPermission: false,
        error: null,
      })
      resetDetector()
      releaseCamera()
    }
  }, [isEnabled, resetDetector, releaseCamera])

  if (!isEnabled) return null

  return (
    <video
      ref={videoRef}
      className="pointer-events-none fixed -z-10 h-0 w-0 select-none"
      playsInline
      style={{ opacity: 0 }}
    >
      <track kind="captions" src="" label="English" default />
    </video>
  )
}
