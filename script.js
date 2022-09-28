// init DOM elements

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const startGameBtn = document.getElementById('start')
const menu = document.getElementById('menu')
const scoreEl = document.getElementById('score')
const endScore = document.getElementById('bigScore')
// tweaking canvas

canvas.width = innerWidth
canvas.height = innerHeight
// define commonly used value

const canvasCentre = {
  x: canvas.width / 2,
  y: canvas.height / 2,
}
// define vars and constants

const friction = 0.99
let score = 0
let projectiles
let particles
let enemies
let start = false
let mouseX
let mouseY
const maxEnemySize = 30
const minEnemySize = 5
const gameMode = 'normal'

class Player {
  constructor (x, y, radius, colour) {
    this.x = x
    this.y = y
    this.radius = radius
    this.colour = colour
    this.shootingCooldown = 10
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

    if (gameMode === 'machine gun') {
      if (this.shootingCooldown <= 0) {
        shoot(mouseX, mouseY)
        this.shootingCooldown = 5
      }
    }
  }
}

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
    console.log(enemies.length)
  }
}

class Particle {
  constructor (x, y, radius, colour, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.colour = colour
    this.velocity = velocity
    this.alpha = 1
  }

  draw () {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    ctx.fillStyle = this.colour
    ctx.fill()
    ctx.restore()
  }

  update () {
    this.draw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x += this.velocity.x
    this.y += this.velocity.y
    this.alpha -= 0.01
  }
}

const player = new Player(canvasCentre.x, canvasCentre.y, 10, 'white')

projectiles = []
particles = []
enemies = []
let interval

function init () {
  score = 0
  scoreEl.innerHTML = score
  projectiles = []
  particles = []
  enemies = []
  start = true
  player.x = canvasCentre.x
  player.velocity.x = 0
  player.y = canvasCentre.y
  player.velocity.y = 0
  clearInterval(interval)
}

let x, y

function spawnEnemies () {
  interval = setInterval(() => {
    //standard random formula with max and min restrictions
    const radius = Math.random() * (maxEnemySize - minEnemySize) + minEnemySize
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }
    const colour = `hsl(${Math.random() * 360}, 50%, 50%)`
    const angle = Math.atan2(canvasCentre.y - y, canvasCentre.x - x)
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    }
    enemies.push(new Enemy(x, y, radius, colour, velocity))
  }, 1000)
}

let animationID

function animate () {
  animationID = requestAnimationFrame(animate)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  player.update()

  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      setTimeout(() => {
        particles.splice(index, 1)
      }, 0)
    } else {
      particle.update()
    }
  })

  projectiles.forEach((projectile, pIndex) => {
    projectile.update()

    // remove off-screen projectiles
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(pIndex, 1)
      }, 0)
    }
  })

  enemies.forEach((enemy, eIndex) => {
    enemy.update()

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    // end game
    if (dist - enemy.radius - player.radius < 1) {
      start = false
      cancelAnimationFrame(animationID)
      endScore.innerHTML = score
      menu.style.display = 'flex'
      gsap.fromTo(
        '#menu',
        {
          opacity: 0,
          scale: 0.7,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'expo',
        },
      )
      startGameBtn.innerHTML = 'Restart'
    }

    projectiles.forEach((projectile, playerIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
      // enemy damaged

      if (dist - enemy.radius - projectile.radius < 1) {
        // spawn particles

        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 3,
              enemy.colour,
              {
                x: (Math.random() - 0.5) * (Math.random() * 5),
                y: (Math.random() - 0.5) * (Math.random() * 5),
              },
            ),
          )
        }
        // add to score

        score += Math.ceil(enemy.radius / 5)
        console.log(Math.ceil(enemy.radius / 5))
        scoreEl.innerHTML = score

        if (enemy.radius - 10 > 10) {
          gsap.to(enemy, { radius: enemy.radius - 10 })
          projectiles.splice(playerIndex, 1)
        } else {
          // dead

          setTimeout(() => {
            enemies.splice(eIndex, 1)
            projectiles.splice(playerIndex, 1)
          }, 0)

          scoreEl.innerHTML = score
        }
      }
    })
  })
}

function shoot (x, y) {
  if (start) {
    if (projectiles.length <= 700) {
      const angle = Math.atan2(
        y - player.y,
        x - player.x,
      )
      const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
      }

      projectiles.push(
        new Projectile(player.x, player.y, 5, 'white', velocity))
    }
  }
}

// shoot
if (gameMode !== 'machine gun') {
  addEventListener('click', (event) => {
    if (player.shootingCooldown <= 0) {
      shoot(event.clientX, event.clientY)
      player.shootingCooldown = 2
    }
  })
}
// start game button actions and animations

startGameBtn.addEventListener('click', () => {
  setTimeout(() => {
    init()
    animate()
    spawnEnemies()
    gsap.to('#menu', {
      opacity: 0,
      scale: 0.7,
      duration: 0.4,
      ease: 'expo.in',
      onComplete: () => {
        menu.style.display = 'none'
      },
    })
  }, 50)
})
// movement

addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'w':
    case 'ArrowUp':
      player.velocity.y -= 1
      break
    case 'a':
    case 'ArrowLeft':
      player.velocity.x -= 1
      break
    case 's':
    case 'ArrowDown':
      player.velocity.y += 1
      break
    case 'd':
    case 'ArrowRight':
      player.velocity.x += 1
      break
  }
  console.log(e.key)
})

addEventListener('mousemove', (event) => {
  mouseX = event.clientX // Gets Mouse X
  mouseY = event.clientY // Gets Mouse Y
})
