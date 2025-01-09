import type { Point, DotsConfig, HandPoint, CanvasSize } from '@/types/dots'

export class DotsService {
  private dots: Point[] = []
  private config: DotsConfig
  private theme: string

  constructor(config: DotsConfig, theme: string) {
    this.config = config
    this.theme = theme
  }

  initializeDots(canvasSize: CanvasSize): void {
    const { width, height } = canvasSize
    const cols = Math.ceil(width / this.config.spacing!)
    const rows = Math.ceil(height / this.config.spacing!)
    this.dots = []

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * this.config.spacing!
        const y = j * this.config.spacing!
        const xPercent = x / width
        const yPercent = y / height

        const startColor =
          this.theme === 'dark' ? this.config.darkModeStartColor! : this.config.lightModeStartColor!
        const endColor =
          this.theme === 'dark' ? this.config.darkModeEndColor! : this.config.lightModeEndColor!

        const r = Math.round(
          startColor[0] + (endColor[0] - startColor[0]) * ((xPercent + yPercent) / 2)
        )
        const g = Math.round(
          startColor[1] + (endColor[1] - startColor[1]) * ((xPercent + yPercent) / 2)
        )
        const b = Math.round(
          startColor[2] + (endColor[2] - startColor[2]) * ((xPercent + yPercent) / 2)
        )

        this.dots.push({
          x,
          y,
          color: `rgb(${r}, ${g}, ${b})`,
          glowColor: `rgba(${r}, ${g}, ${b}, ${this.config.glowOpacity})`,
        })
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, canvasSize: CanvasSize, pointers: HandPoint[]): void {
    const { width, height, dpr } = canvasSize
    ctx.clearRect(0, 0, width, height)

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
          const force =
            (1 - distance / this.config.maxForceDistance!) * this.config.forceStrength!
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