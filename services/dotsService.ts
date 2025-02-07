import type { Point, DotsConfig, HandPoint, CanvasSize, DotState } from '@/types/dots'

export class DotsService {
  private dots: DotState[] = []
  private config: DotsConfig
  private theme: string
  private isHandposeMode: boolean = false
  private lastFrameTime: number = 0

  constructor(config: DotsConfig, theme: string) {
    this.config = {
      ...config,
      handposeDarkStartColor: config.handposeDarkStartColor || [255, 100, 50],
      handposeDarkEndColor: config.handposeDarkEndColor || [50, 200, 255],
      handposeLightStartColor: config.handposeLightStartColor || [255, 150, 50],
      handposeLightEndColor: config.handposeLightEndColor || [50, 150, 255],
      transitionDuration: config.transitionDuration || 500,
    }
    this.theme = theme
  }

  setHandposeMode(enabled: boolean): void {
    this.isHandposeMode = enabled
    this.updateTargetColors()
  }

  private updateTargetColors(): void {
    const startColor = this.getCurrentStartColor()
    const endColor = this.getCurrentEndColor()

    this.dots.forEach((dot, index) => {
      const { x, y } = dot
      const width = this.canvasSize?.width || 1
      const height = this.canvasSize?.height || 1
      const xPercent = x / width
      const yPercent = y / height

      const r = Math.round(
        startColor[0] + (endColor[0] - startColor[0]) * ((xPercent + yPercent) / 2)
      )
      const g = Math.round(
        startColor[1] + (endColor[1] - startColor[1]) * ((xPercent + yPercent) / 2)
      )
      const b = Math.round(
        startColor[2] + (endColor[2] - startColor[2]) * ((xPercent + yPercent) / 2)
      )

      dot.targetColor = `rgb(${r}, ${g}, ${b})`
      dot.targetGlowColor = `rgba(${r}, ${g}, ${b}, ${this.config.glowOpacity})`
      dot.transitionProgress = 0
    })
  }

  private getCurrentStartColor(): [number, number, number] {
    if (this.isHandposeMode) {
      return this.theme === 'dark'
        ? this.config.handposeDarkStartColor!
        : this.config.handposeLightStartColor!
    }
    return this.theme === 'dark'
      ? this.config.darkModeStartColor!
      : this.config.lightModeStartColor!
  }

  private getCurrentEndColor(): [number, number, number] {
    if (this.isHandposeMode) {
      return this.theme === 'dark'
        ? this.config.handposeDarkEndColor!
        : this.config.handposeLightEndColor!
    }
    return this.theme === 'dark' ? this.config.darkModeEndColor! : this.config.lightModeEndColor!
  }

  private interpolateColor(dot: DotState, deltaTime: number): void {
    const progress = Math.min(
      1,
      dot.transitionProgress + deltaTime / this.config.transitionDuration!
    )

    if (progress < 1) {
      const currentColor = this.parseColor(dot.color)
      const targetColor = this.parseColor(dot.targetColor)
      const currentGlow = this.parseColor(dot.glowColor)
      const targetGlow = this.parseColor(dot.targetGlowColor)

      const r = Math.round(currentColor[0] + (targetColor[0] - currentColor[0]) * progress)
      const g = Math.round(currentColor[1] + (targetColor[1] - currentColor[1]) * progress)
      const b = Math.round(currentColor[2] + (targetColor[2] - currentColor[2]) * progress)

      const glowR = Math.round(currentGlow[0] + (targetGlow[0] - currentGlow[0]) * progress)
      const glowG = Math.round(currentGlow[1] + (targetGlow[1] - currentGlow[1]) * progress)
      const glowB = Math.round(currentGlow[2] + (targetGlow[2] - currentGlow[2]) * progress)
      const glowA = currentGlow[3] + (targetGlow[3] - currentGlow[3]) * progress

      dot.color = `rgb(${r}, ${g}, ${b})`
      dot.glowColor = `rgba(${glowR}, ${glowG}, ${glowB}, ${glowA})`
      dot.transitionProgress = progress
    }
  }

  private parseColor(color: string): number[] {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([.\d]+))?\)/)
    if (!match) return [0, 0, 0, 1]
    return [
      parseInt(match[1]),
      parseInt(match[2]),
      parseInt(match[3]),
      match[4] ? parseFloat(match[4]) : 1,
    ]
  }

  private canvasSize: CanvasSize | null = null

  initializeDots(canvasSize: CanvasSize): void {
    this.canvasSize = canvasSize
    const { width, height } = canvasSize
    const spacing = this.config.spacing! * 0.9
    const cols = Math.ceil(width / spacing)
    const rows = Math.ceil(height / spacing)
    this.dots = []

    const startColor = this.getCurrentStartColor()
    const endColor = this.getCurrentEndColor()

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * spacing
        const y = j * spacing
        const xPercent = x / width
        const yPercent = y / height

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
        const glowColor = `rgba(${r}, ${g}, ${b}, ${this.config.glowOpacity})`

        this.dots.push({
          x,
          y,
          color,
          glowColor,
          targetColor: color,
          targetGlowColor: glowColor,
          transitionProgress: 1,
        })
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, canvasSize: CanvasSize, pointers: HandPoint[]): void {
    const { width, height, dpr } = canvasSize
    const currentTime = performance.now()
    const deltaTime = this.lastFrameTime ? currentTime - this.lastFrameTime : 0
    this.lastFrameTime = currentTime

    ctx.clearRect(0, 0, width, height)

    // Update color transitions
    this.dots.forEach((dot) => this.interpolateColor(dot, deltaTime))

    // Draw dots with force effects
    ctx.globalCompositeOperation = 'source-over'
    this.renderDots(ctx, pointers)

    // Apply gradient masks
    this.applyGradientMasks(ctx, width, height, dpr)
  }

  private renderDots(ctx: CanvasRenderingContext2D, pointers: HandPoint[]): void {
    this.dots.forEach((dot) => {
      let maxForce = 0
      let forceDx = 0
      let forceDy = 0

      // Calculate combined force from all pointers
      pointers.forEach((pointer) => {
        const dx = pointer.x - dot.x
        const dy = pointer.y - dot.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < this.config.maxForceDistance! && distance > 0) {
          const force = (1 - distance / this.config.maxForceDistance!) * this.config.forceStrength!
          if (force > maxForce) {
            maxForce = force
            forceDx = dx
            forceDy = dy
          }
        }
      })

      let drawX = dot.x
      let drawY = dot.y

      if (maxForce > 0) {
        const distance = Math.sqrt(forceDx * forceDx + forceDy * forceDy)
        drawX -= (forceDx / distance) * maxForce
        drawY -= (forceDy / distance) * maxForce
      }

      // Draw glow
      ctx.shadowColor = dot.glowColor
      ctx.shadowBlur = this.config.glowIntensity!
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Draw dot
      ctx.beginPath()
      ctx.fillStyle = dot.color
      ctx.arc(drawX, drawY, this.config.dotSize!, 0, Math.PI * 2)
      ctx.fill()

      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
    })
  }

  private applyGradientMasks(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dpr: number
  ): void {
    const gradientSize = this.config.gradientSize!
    const backgroundColor =
      this.theme === 'dark' ? this.config.darkModeBackground! : this.config.lightModeBackground!

    ctx.globalCompositeOperation = 'destination-out'

    // Top gradient
    const topGradient = ctx.createLinearGradient(0, 0, 0, gradientSize)
    topGradient.addColorStop(0, backgroundColor)
    topGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = topGradient
    ctx.fillRect(0, 0, width, gradientSize)

    // Bottom gradient
    const bottomGradient = ctx.createLinearGradient(0, height - gradientSize, 0, height)
    bottomGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    bottomGradient.addColorStop(1, backgroundColor)
    ctx.fillStyle = bottomGradient
    ctx.fillRect(0, height - gradientSize, width, gradientSize)

    // Left gradient
    const leftGradient = ctx.createLinearGradient(0, 0, gradientSize, 0)
    leftGradient.addColorStop(0, backgroundColor)
    leftGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = leftGradient
    ctx.fillRect(0, 0, gradientSize, height)

    // Right gradient
    const rightGradient = ctx.createLinearGradient(width - gradientSize, 0, width, 0)
    rightGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    rightGradient.addColorStop(1, backgroundColor)
    ctx.fillStyle = rightGradient
    ctx.fillRect(width - gradientSize, 0, gradientSize, height)
  }
}
