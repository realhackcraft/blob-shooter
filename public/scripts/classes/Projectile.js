class Projectile {
  constructor (x, y, radius, colour, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.colour = colour
    this.velocity = velocity
  }

  draw () {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    ctx.fillStyle = this.colour
    ctx.fill()
  }

  update () {
    this.draw()
    this.x += this.velocity.x
    this.y += this.velocity.y
  }
}
