'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

interface Point {
  x: number
  y: number
  color: string
  glowColor: string
}

interface DotsConfig {
  // Distance between dots in pixels
  spacing?: number
  // Size of each dot in pixels
  dotSize?: number
  // Maximum distance in pixels at which dots will be affected by mouse movement
  maxForceDistance?: number
  // Strength of the force applied to dots when mouse moves (higher = stronger push)
  forceStrength?: number
  // Intensity of the glow effect around dots (higher = more intense glow)
  glowIntensity?: number
  // Opacity of the glow effect (0-1)
  glowOpacity?: number
  // Starting RGB color for dots in dark mode [R, G, B]
  darkModeStartColor?: [number, number, number]
  // Ending RGB color for dots in dark mode [R, G, B]
  darkModeEndColor?: [number, number, number]
  // Starting RGB color for dots in light mode [R, G, B]
  lightModeStartColor?: [number, number, number]
  // Ending RGB color for dots in light mode [R, G, B]
  lightModeEndColor?: [number, number, number]
}

const defaultConfig: DotsConfig = {
  spacing: 26,
  dotSize: 1.5,
  maxForceDistance: 120,
  forceStrength: 25,
  glowIntensity: 6,
  glowOpacity: 0.5,
  darkModeStartColor: [100, 100, 255],
  darkModeEndColor: [255, 100, 100],
  lightModeStartColor: [50, 50, 200],
  lightModeEndColor: [200, 50, 50],
}

export function InteractiveDots({ config = {} }: { config?: DotsConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const dotsRef = useRef<Point[]>([])
  const animationFrameRef = useRef<number>()
  const resizeObserverRef = useRef<ResizeObserver>()
  const { theme } = useTheme()

  // Merge default config with provided config
  const finalConfig = { ...defaultConfig, ...config }

  // Initialize dots and handle canvas sizing
  useEffect(() => {
    const initDots = () => {
      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set canvas size with device pixel ratio for sharp rendering
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

      const cols = Math.ceil(rect.width / finalConfig.spacing!)
      const rows = Math.ceil(rect.height / finalConfig.spacing!)
      const newDots: Point[] = []

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * finalConfig.spacing!
          const y = j * finalConfig.spacing!
          const xPercent = x / rect.width
          const yPercent = y / rect.height

          const startColor = theme === 'dark' ? finalConfig.darkModeStartColor! : finalConfig.lightModeStartColor!
          const endColor = theme === 'dark' ? finalConfig.darkModeEndColor! : finalConfig.lightModeEndColor!
          const r = Math.round(
            startColor[0] + (endColor[0] - startColor[0]) * ((xPercent + yPercent) / 2)
          )
          const g = Math.round(
            startColor[1] + (endColor[1] - startColor[1]) * ((xPercent + yPercent) / 2)
          )
          const b = Math.round(
            startColor[2] + (endColor[2] - startColor[2]) * ((xPercent + yPercent) / 2)
          )

          const color = `rgb(${r}, ${g}, ${b})`
          const glowColor = `rgba(${r}, ${g}, ${b}, ${finalConfig.glowOpacity})`

          newDots.push({
            x,
            y,
            color,
            glowColor,
          })
        }
      }
      dotsRef.current = newDots
    }

    // Use ResizeObserver for more accurate size updates
    resizeObserverRef.current = new ResizeObserver(() => {
      initDots()
    })

    if (canvasRef.current) {
      resizeObserverRef.current.observe(canvasRef.current)
    }

    initDots()
    return () => {
      resizeObserverRef.current?.disconnect()
    }
  }, [theme, finalConfig])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (!canvasRef.current) return
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)

      const { x: mouseX, y: mouseY } = mouseRef.current

      // Set global composite operation for glow effect
      ctx.globalCompositeOperation = 'source-over'

      dotsRef.current.forEach((dot) => {
        const dx = mouseX - dot.x
        const dy = mouseY - dot.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        let drawX = dot.x
        let drawY = dot.y

        if (distance < finalConfig.maxForceDistance! && distance > 0) {
          const force = (1 - distance / finalConfig.maxForceDistance!) * finalConfig.forceStrength!
          drawX -= (dx / distance) * force
          drawY -= (dy / distance) * force
        }

        // Draw glow
        ctx.shadowColor = dot.glowColor
        ctx.shadowBlur = finalConfig.glowIntensity!
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // Draw dot
        ctx.beginPath()
        ctx.fillStyle = dot.color
        ctx.arc(drawX, drawY, finalConfig.dotSize!, 0, Math.PI * 2)
        ctx.fill()

        // Reset shadow
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [finalConfig])

  // Mouse movement handler
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      mouseRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}
