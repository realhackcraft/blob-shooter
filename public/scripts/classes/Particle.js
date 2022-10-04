class Particle extends Entity {
  constructor (x, y, radius, color, velocity) {
    super(x, y, radius, color, 1)
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }

  draw () {
    ctx.save()
    ctx.globalAlpha = this.alpha
    super.draw()
    ctx.restore()
  }

  update () {
    this.draw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x += this.velocity.x
    this.y += this.velocity.y
    this.alpha -= 0.01
  }
}