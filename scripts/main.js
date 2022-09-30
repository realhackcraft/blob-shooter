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

const canvasCenter = {
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
let mouseDown
let powerUps = []
const maxEnemySize = 30
const minEnemySize = 5
const randomPos = {
  x: Math.random() * canvasCenter.x,
  y: Math.random() * canvasCenter.y,
}

const player = new Player(canvasCenter.x, canvasCenter.y, 10, 'white')

projectiles = []
particles = []
enemies = []
let enemyInterval, powerUpInterval

function init () {
  score = 0
  scoreEl.innerHTML = score
  projectiles = []
  particles = []
  enemies = []
  powerUps = []
  start = true
  player.x = canvasCenter.x
  player.velocity.x = 0
  player.y = canvasCenter.y
  player.velocity.y = 0
  clearInterval(enemyInterval)
  clearInterval(powerUpInterval)
}

function spawnEnemies () {
  enemyInterval = setInterval(() => {
    const radius = Math.random() * (maxEnemySize - minEnemySize) + minEnemySize
    let pos = spawnOnEdge(radius, radius)
    const angle = Math.atan2(canvasCenter.y - pos.y, canvasCenter.x - pos.x)
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    }
    const colour = `hsl(${Math.random() * 360}, 50%, 50%)`
    enemies.push(new Enemy(pos.x, pos.y, radius, colour, velocity))
  }, Math.random() * (3000 - 800) + 800)
}

function spawnPowerUps () {
  powerUpInterval = setInterval(() => {
    let pos = spawnOnEdge(16, 16)// Width and height of image
    const angle = Math.atan2(randomPos.y - pos.y, randomPos.x - pos.x)
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    }
    powerUps.push(new PowerUp(pos.x, pos.y, velocity))
  }, Math.random() * (60000 - 40000) + 40000)
}

function spawnOnEdge (width, height) {
  let x, y
  if (Math.random() < 0.5) {
    x = Math.random() < 0.5 ? 0 - width : canvas.width + width
    y = Math.random() * canvas.height
  } else {
    x = Math.random() * canvas.width
    y = Math.random() < 0.5 ? 0 - height : canvas.height + height
  }

  return { x: x, y: y }
}

let animationID

function animate () {
  animationID = requestAnimationFrame(animate)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  player.update()

  powerUps.forEach((powerUp, pIndex) => {
    powerUp.update()

    const dist = Math.hypot(
      player.x - powerUp.x,
      player.y - powerUp.y,
    )

    // Gain powerUp
    if (dist < powerUp.image.height / 2 + player.radius) {
      powerUps.splice(pIndex, 1)
      player.powerUp = 'machine gun'
      setTimeout(() => {
        player.powerUp = ''
      }, 20000)
    }
  })

  // Machine gun implementation
  if (player.powerUp === 'machine gun') {
    if (player.shootingCooldown <= 0) {
      if (mouseDown) {
        shootMachineGun()
        player.shootingCooldown = 4
      }
    }
  }

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

    // Dead, end the game
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
      addEventListener('keydown', startGameBind)
    }

    projectiles.forEach((projectile, playerIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
      // Enemy damaged

      if (dist - enemy.radius - projectile.radius < 1) {
        // Spawn particles

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
        scoreEl.innerHTML = score

        if (enemy.radius - 10 > 10) {
          gsap.to(enemy, { radius: enemy.radius - 10 })
          projectiles.splice(playerIndex, 1)
        } else {
          // Enemy dead

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

function shootMachineGun () {
  if (start) {
    if (projectiles.length <= 700) {
      const angle = Math.atan2(
        mouseY - player.y,
        mouseX - player.x,
      )
      const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
      }

      projectiles.push(
        new Projectile(player.x, player.y, 5, 'yellow', velocity))
    }
  }
}

// shoot
addEventListener('click', (event) => {
  if (player.powerUp !== 'machine gun') {
    if (player.shootingCooldown <= 0) {
      shoot(event.clientX, event.clientY)
      player.shootingCooldown = 6
    }
  }
})

addEventListener('mousedown', () => {
  mouseDown = true
})

addEventListener('mouseup', () => {
  mouseDown = false
})

// start game button actions and animations

function startGame () {
  setTimeout(() => {
    init()
    animate()

    spawnEnemies()
    spawnPowerUps()
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
}

const startGameOnEnter = function (event) {
  if (event.key === 'Enter') {
    startGame()
    removeEventListener('keydown', startGameBind)
  }
}

const startGameBind = startGameOnEnter.bind(KeyboardEvent)

startGameBtn.addEventListener('click', startGame)
addEventListener('keydown', startGameBind)

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
})

addEventListener('mousemove', (event) => {
  mouseX = event.clientX // Gets Mouse X
  mouseY = event.clientY // Gets Mouse Y
})
