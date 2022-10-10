class Particle extends Entity {
  constructor (x, y, radius, color, velocity, speed) {
    super(x, y, radius, color, 1)
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.speed = speed
    this.alpha = 1
  }

  draw () {
    ctx.save()
    ctx.globalAlpha = this.alpha
    super.draw()
    ctx.restore()
  }

  update (delta) {
    this.lastPos.x = this.x
    this.lastPos.y = this.y

    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x += this.velocity.x * this.speed * delta
    this.y += this.velocity.y * this.speed * delta
    this.alpha -= 0.01
  }
}