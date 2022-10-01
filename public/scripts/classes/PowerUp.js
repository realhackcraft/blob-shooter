class PowerUp {
  constructor (x, y, velocity) {
    this.x = x
    this.y = y
    this.velocity = velocity
    this.radians = 0

    this.alpha = 1
    gsap.to(this, {
      alpha: 0.1,
      duration: 0.6,
      repeat: -1,
    })

    this.image = new Image()
    this.image.src = '../../../res/img/powerUp.png'
  }

  update () {
    this.draw()
    this.radians += 0.01
    this.x += this.velocity.x
    this.y += this.velocity.y

    // Overflow protection
    if (this.radians >= 2 * Math.PI) {
      this.radians = this.radians %
        (2 * Math.PI)
    }
  }

  draw () {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.translate(this.x + this.image.width / 2, this.y + this.image.height / 2)
    ctx.rotate(this.radians)
    ctx.translate(-this.x - this.image.width / 2,
                  -this.y - this.image.height / 2)
    ctx.drawImage(this.image, this.x, this.y)
    ctx.restore()
  }
}