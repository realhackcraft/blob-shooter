class Player {
  constructor (x, y, speed, radius, colour) {
    this.x = x
    this.y = y
    this.speed = speed / FPS
    this.radius = radius
    this.colour = colour
    this.shootingCooldown = 10
    this.powerUp = ''
    this.damage = projectileSize * 2
    this.direction = {
      x: 'none',
      y: 'none'
    }
    this.velocity = {
      x: 0,
      y: 0,
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
    this.move()
    this.shootingCooldown--

    // x boundary
    if (
      this.x + this.radius + this.velocity.x <= canvas.width &&
      this.x - this.radius + this.velocity.x >= 0
    ) {
      this.x += this.velocity.x
    } else {
      this.velocity.x = 0
    }

    // y boundary
    if (
      this.y + this.radius + this.velocity.y <= canvas.height &&
      this.y - this.radius + this.velocity.y >= 0
    ) {
      this.y += this.velocity.y
    } else {
      this.velocity.y = 0
    }

    // friction
    const friction = 0.95

    this.velocity.x *= friction
    this.velocity.y *= friction
  }

  move() {
    switch (this.direction.y) {
      case 'up':
        this.velocity.y -= this.speed
        break
      case 'down':
        this.velocity.y += this.speed
        break
    }
    switch (this.direction.x) {
      case 'left':
        this.velocity.x -= this.speed
        break
      case 'right':
        this.velocity.x += this.speed
        break
    }
    console.log(this.direction)
  }
}