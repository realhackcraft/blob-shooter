class Player extends Entity {
  constructor (x, y, speed, radius, color) {
    super(x, y, radius, color, 1)
    this.speed = speed / FPS
    this.sprintingSpeed = this.speed * 1.5
    this.sprint = false
    this.shootingCooldown = 10
    this.powerUp = ''
    this.damage = this.projectileSize * 2
    this.direction = {
      x: 'none',
      y: 'none',
    }
    this.velocity = {
      x: 0,
      y: 0,
    }
    this.projectiles = []
    this.projectileColor = 'white'
    this.projectileSize = 5
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
    this.changeColor()
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

  changeColor () {
    this.color = 'white'
    this.projectileColor = 'white'
    if (this.powerUp === 'machine gun') {
      this.color = 'gold'
      this.projectileColor = 'yellow'
    }
  }

  shoot (x, y) {
    if (!start) return
    if (player.projectiles.length >= 700) return
    const angle = angleBetween({ x, y }, this)
    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5,
    }

    player.projectiles.push(
      new Projectile(this.x, this.y, this.projectileSize, this.projectileColor,
                     velocity))
    sfx.shoot.play()
  }
}