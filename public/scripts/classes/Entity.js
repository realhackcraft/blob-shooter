class Entity {
  constructor (x, y, radius, color, alpha) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.alpha = alpha
  }

  draw () {

    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
  }
}