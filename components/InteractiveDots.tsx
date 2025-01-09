'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useTheme } from 'next-themes'
import { useCanvas } from '@/hooks/useCanvas'
import { defaultConfig } from '@/config/dotsConfig'
import type { DotsConfig, HandPoint } from '@/types/dots'
import { DotsService } from '@/services/dotsService'
import { HandposeToggle } from './HandposeToggle'
import { HandposeDetector } from './HandposeDetector'

const FPS = 90
const FRAME_INTERVAL = 1000 / FPS

export function InteractiveDots({ config = {} }: { config?: DotsConfig }) {
  const { canvasRef, initCanvas } = useCanvas()
  const pointerRef = useRef<HandPoint[]>([])
  const dotsServiceRef = useRef<DotsService>()
  const animationFrameRef = useRef<number>()
  const lastFrameTimeRef = useRef<number>(0)
  const { theme = 'light' } = useTheme()
  const [isHandposeEnabled, setIsHandposeEnabled] = useState(false)

  const finalConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config])

  // Initialize dots service and handle canvas sizing
  useEffect(() => {
    dotsServiceRef.current = new DotsService(finalConfig, theme)
    const canvasSize = initCanvas()
    if (canvasSize) {
      dotsServiceRef.current.initializeDots(canvasSize)
    }
  }, [theme, finalConfig, initCanvas])

  // Animation loop with FPS throttling
  useEffect(() => {
    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastFrameTimeRef.current

      if (elapsed > FRAME_INTERVAL) {
        lastFrameTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL)

        if (!canvasRef.current || !dotsServiceRef.current) return
        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return

        const canvasSize = initCanvas()
        if (!canvasSize) return

        dotsServiceRef.current.render(ctx, canvasSize, pointerRef.current)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    lastFrameTimeRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [initCanvas])

  // Mouse movement handler
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!canvasRef.current || isHandposeEnabled) return
      const rect = canvasRef.current.getBoundingClientRect()
      pointerRef.current = [
        {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
      ]
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isHandposeEnabled])

  const handleHandMove = (handPoints: HandPoint[]) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    pointerRef.current = handPoints.map((point) => ({
      x: point.x - rect.left,
      y: point.y - rect.top,
    }))
  }

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <HandposeDetector isEnabled={isHandposeEnabled} onHandMove={handleHandMove} />
      <HandposeToggle isEnabled={isHandposeEnabled} onToggle={setIsHandposeEnabled} />
    </div>
  )
}
