class Player extends Entity {
  constructor (x, y, speed, radius, color) {
    super(x, y, radius, color, 1)
    this.speed = speed / FPS
    this.sprintingSpeed = this.speed * 1.5
    this.sprint = false
    this.shootingCooldown = 10
    this.powerUp = ''
    this.damage = projectileSize * 2
    this.direction = {
      x: 'none',
      y: 'none',
    }
    this.velocity = {
      x: 0,
      y: 0,
    }
  }

  update () {
    this.draw()
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

    this.velocity.x *= friction
    this.velocity.y *= friction

    this.move()
  }

  move () {
    switch (this.direction.y) {
      case 'up':
        this.velocity.y -= this.sprint ? this.sprintingSpeed : this.speed
        break
      case 'down':
        this.velocity.y += this.sprint ? this.sprintingSpeed : this.speed
        break
    }
    switch (this.direction.x) {
      case 'left':
        this.velocity.x -= this.sprint ? this.sprintingSpeed : this.speed
        break
      case 'right':
        this.velocity.x += this.sprint ? this.sprintingSpeed : this.speed
        break
    }
  }
}