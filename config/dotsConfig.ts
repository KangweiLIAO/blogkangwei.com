import type { DotsConfig } from '@/types/dots'

export const defaultConfig: DotsConfig = {
  spacing: 26,
  dotSize: 2,
  maxForceDistance: 120,
  forceStrength: 25,
  glowIntensity: 6,
  glowOpacity: 0.8,
  darkModeStartColor: [100, 100, 255],
  darkModeEndColor: [255, 100, 100],
  lightModeStartColor: [50, 50, 200],
  lightModeEndColor: [200, 50, 50],
  darkModeBackground: 'rgb(0, 0, 0)',
  lightModeBackground: 'rgb(255, 255, 255)',
  gradientSize: 64,
} 