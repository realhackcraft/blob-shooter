class Entity {

  constructor (x, y, radius, color, alpha) {
    this.x = x
    this.y = y
    this.lastPos = { x, y }
    this.radius = radius
    this.color = color
    this.alpha = alpha
  }

  draw (interp = 0) {

    ctx.beginPath()
    ctx.arc(this.lastPos.x + (this.x - this.lastPos.x) * interp,
            this.lastPos.y + (this.y - this.lastPos.y) * interp, this.radius,
            0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.closePath()
    ctx.fill()
  }
}