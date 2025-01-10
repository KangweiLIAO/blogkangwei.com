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
  handposeDarkStartColor?: [number, number, number]
  handposeDarkEndColor?: [number, number, number]
  handposeLightStartColor?: [number, number, number]
  handposeLightEndColor?: [number, number, number]
  darkModeBackground?: string
  lightModeBackground?: string
  gradientSize?: number
  transitionDuration?: number
}

export interface CanvasSize {
  width: number
  height: number
  dpr: number
}

export interface DotState extends Point {
  targetColor: string
  targetGlowColor: string
  transitionProgress: number
}
