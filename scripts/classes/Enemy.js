class Enemy {
  constructor (x, y, radius, colour, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.radians = 0
    this.colour = colour
    this.velocity = velocity
    this.center = {
      x,
      y,
    }
    this.type = 'Normal'

    // Special enemies
    if (Math.random() < 0.5) {
      this.type = 'Homing'
      this.colour = this.colour.replace('50%', '75%')

      if (Math.random() < 0.5) {
        this.type = 'Hopping'
        this.colour = this.colour.replace('50%', '25%')
        if (Math.random() < 0.5) {
          this.type = 'Homing-Hopping'
          this.colour = this.colour.replace('25%', '50%')
        }
      }

      if (Math.random() < 0.25) {
        this.type = 'Drunk'
        this.colour = this.colour.replace('50%', '25%')
      }
      this.radius += 10
    }
  }

  draw () {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    ctx.fillStyle = this.colour

    ctx.fill()
  }

  update () {
    this.draw()

    if (this.type === 'Homing') {
      const angle = Math.atan2(player.y - this.y, player.x - this.x)
      this.velocity.x = Math.cos(angle)
      this.velocity.y = Math.sin(angle)

      this.x += this.velocity.x
      this.y += this.velocity.y

    } else if (this.type === 'Hopping' || this.type === 'Drunk') {
      this.radians += 0.1
      if (this.radians >= 2 * Math.PI) {
        this.radians = this.radians %
          (2 * Math.PI)
      }

      this.center.x += this.velocity.x
      this.center.y += this.velocity.y

      if (this.type === 'Drunk') {
        this.x = this.center.x + Math.cos(this.radians) * (15 + this.radius)
        this.y = this.center.y + Math.sin(this.radians) * (15 + this.radius)
      } else if (this.type === 'Hopping') {
        this.x = this.center.x + Math.cos(this.radians) * (5 + this.radius)
        this.y = this.center.y + Math.sin(this.radians) * (5 + this.radius)
      }
    } else if (this.type === 'Homing-Hopping') {
      this.radians += 0.1

      // Overflow protection
      if (this.radians >= 2 * Math.PI) {
        this.radians = this.radians %
          (2 * Math.PI)
      }

      const angle = Math.atan2(player.y - this.center.y,
                               player.x - this.center.x)
      this.velocity.x = Math.cos(angle)
      this.velocity.y = Math.sin(angle)

      this.center.x += this.velocity.x
      this.center.y += this.velocity.y

      this.x = this.center.x + Math.cos(this.radians) * 10
      this.y = this.center.y + Math.sin(this.radians) * 10
    } else {
      this.x += this.velocity.x
      this.y += this.velocity.y
    }
  }
}
