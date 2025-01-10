import { useCallback, useRef, useEffect } from 'react'
import { FALLBACK_VIDEO_CONSTRAINTS } from '@/constants/handpose'
import { debug, handleCameraError } from '@/utils/handpose'
import type { VideoConstraints } from '@/types/handpose'

/**
 * Custom hook for managing camera access and video stream setup.
 * Provides functionality to initialize camera stream, attach it to a video element,
 * and properly release camera resources when done.
 *
 * @returns {Object} Object containing:
 *   - videoRef: React ref for the video element
 *   - setupCamera: Function to initialize camera stream
 *   - releaseCamera: Function to stop camera stream and release resources
 */
export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const releaseCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
        streamRef.current?.removeTrack(track)
      })
      streamRef.current = null
    }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject = null
    }
  }, [])

  const setupCamera = useCallback(async () => {
    if (!videoRef.current) return false

    // Clean up any existing stream before setting up a new one
    releaseCamera()

    const setupVideoStream = async (constraints: VideoConstraints) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = stream
        videoRef.current!.srcObject = stream

        await new Promise<void>((resolve) => {
          if (!videoRef.current) return
          videoRef.current.onloadeddata = () => {
            debug('Video loaded', {
              width: videoRef.current?.videoWidth,
              height: videoRef.current?.videoHeight,
            })
            resolve()
          }
        })

        await videoRef.current!.play()
        await new Promise((resolve) => setTimeout(resolve, 500))
        return true
      } catch (err) {
        releaseCamera()
        throw err
      }
    }

    try {
      await setupVideoStream(FALLBACK_VIDEO_CONSTRAINTS)
      debug('Camera setup completed with fallback settings')
      return true
    } catch (err) {
      const errorMessage = handleCameraError(err)
      throw new Error(errorMessage)
    }
  }, [releaseCamera])

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      releaseCamera()
    }
  }, [releaseCamera])

  return {
    videoRef,
    setupCamera,
    releaseCamera,
  }
}
