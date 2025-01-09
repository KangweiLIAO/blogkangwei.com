import { useCallback, useRef } from 'react'
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

  const setupCamera = useCallback(async () => {
    if (!videoRef.current) return false

    const setupVideoStream = async (constraints: VideoConstraints) => {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      // set the video stream as the source object for the video element
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

      // play the video and wait for .5 second to ensure proper initialization
      await videoRef.current!.play()
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    try {
      await setupVideoStream(FALLBACK_VIDEO_CONSTRAINTS)
      debug('Camera setup completed with fallback settings')
      return true
    } catch (err) {
      const errorMessage = handleCameraError(err)
      throw new Error(errorMessage)
    }
  }, [])

  /**
   * Stops all tracks in the video stream and releases camera resources
   */
  const releaseCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return {
    videoRef,
    setupCamera,
    releaseCamera,
  }
}
