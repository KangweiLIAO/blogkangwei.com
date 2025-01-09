export interface Point {
  x: number
  y: number
  color: string
  glowColor: string
}

export interface HandPoint {
  x: number
  y: number
}

export interface DotsConfig {
  spacing?: number
  dotSize?: number
  maxForceDistance?: number
  forceStrength?: number
  glowIntensity?: number
  glowOpacity?: number
  darkModeStartColor?: [number, number, number]
  darkModeEndColor?: [number, number, number]
  lightModeStartColor?: [number, number, number]
  lightModeEndColor?: [number, number, number]
  darkModeBackground?: string
  lightModeBackground?: string
  gradientSize?: number
}

export interface CanvasSize {
  width: number
  height: number
  dpr: number
} 