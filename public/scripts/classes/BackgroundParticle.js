class BackgroundParticle extends Particle {
  constructor (x, y, radius, color, alpha = 0.1) {
    super(x, y, radius, color, { x: 0, y: 0 })
    this.alpha = alpha
    console.log(this.x)
  }
}