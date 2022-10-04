class Projectile extends Entity {
  constructor (x, y, radius, color, velocity) {
    super(x, y, radius, color, 1)
    this.velocity = velocity
  }

  update () {
    this.draw()
    this.x += this.velocity.x
    this.y += this.velocity.y
  }
}
