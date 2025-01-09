import { useEffect, useRef } from 'react'
import type { CanvasSize } from '@/types/dots'

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const resizeObserverRef = useRef<ResizeObserver>()

  const initCanvas = (): CanvasSize | null => {
    if (!canvasRef.current) return null

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    // Set display size (css pixels)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)

    // Normalize coordinate system to use css pixels
    ctx.scale(dpr, dpr)

    return {
      width: rect.width,
      height: rect.height,
      dpr,
    }
  }

  useEffect(() => {
    resizeObserverRef.current = new ResizeObserver(() => {
      initCanvas()
    })

    if (canvasRef.current) {
      resizeObserverRef.current.observe(canvasRef.current)
    }

    return () => {
      resizeObserverRef.current?.disconnect()
    }
  }, [])

  return {
    canvasRef,
    initCanvas,
  }
}
