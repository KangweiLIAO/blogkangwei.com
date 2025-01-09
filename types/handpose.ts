export interface HandPoint {
  x: number
  y: number
}

export interface HandposeDetectorProps {
  onHandMove: (handPoints: HandPoint[]) => void
  isEnabled: boolean
}

export interface VideoConstraints {
  video: {
    width: { min?: number; ideal: number; max?: number }
    height: { min?: number; ideal: number; max?: number }
    facingMode: 'user'
    frameRate?: { ideal: number }
  }
}

export interface DetectorState {
  isModelLoaded: boolean
  hasRequestedPermission: boolean
  error: string | null
}
