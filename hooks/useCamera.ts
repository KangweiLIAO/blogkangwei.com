import { useCallback, useRef } from 'react'
import { FALLBACK_VIDEO_CONSTRAINTS } from '@/constants/handpose'
import { debug, handleCameraError } from '@/utils/handpose'
import type { VideoConstraints } from '@/types/handpose'

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null)

  const setupCamera = useCallback(async () => {
    if (!videoRef.current) return false

    const setupVideoStream = async (constraints: VideoConstraints) => {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
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
      await new Promise((resolve) => setTimeout(resolve, 1000))
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
