// init DOM elements

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const startGameBtn = document.getElementById('start')
const menu = document.getElementById('menu')
const scoreEl = document.getElementById('score')
const endScore = document.getElementById('bigScore')
const endHighScore = document.getElementById('highScore')
// tweaking canvas

canvas.width = innerWidth
canvas.height = innerHeight
// define commonly used value

let canvasCenter = {
  x: canvas.width / 2,
  y: canvas.height / 2,
}
// define vars and constants

let score = 0
let highScore = localStorage.getItem('highScore') === null
  ? localStorage.setItem('highScore', score.toString())
  : localStorage.getItem('highScore')
endHighScore.innerHTML = highScore
let animationID
let projectiles
let particles
let enemies
let start = false
let mouseX
let mouseY
let mouseDown
let projectileSize = 5
let powerUps = []
const FPS = 60
const friction = 0.95
const maxEnemySize = 30
const minEnemySize = 5
const randomPos = {
  x: Math.random() * canvasCenter.x,
  y: Math.random() * canvasCenter.y,
}

const player = new Player(canvasCenter.x, canvasCenter.y, 10, 10, 'white')

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
    const angle = Math.atan2(player.y - pos.y, player.x - pos.x)
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    }
    const colour = `hsl(${Math.random() * 360}, 50%, 50%)`
    enemies.push(new Enemy(pos.x, pos.y, radius, colour, velocity))
  }, Math.random() * (1500 - 700) + 700)
}

function spawnPowerUps () {
  powerUpInterval = setInterval(() => {
    let pos = spawnOnEdge(16, 16) // Width and height of image
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

function resetHighScore () {
  if (confirm('Reset HighScore to 0?\nThis action CANNOT be undone.')) {
    highScore = 0
    endHighScore.innerHTML = highScore
    localStorage.setItem('highScore', highScore)
  }
}


function animate () {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  player.update()

  powerUps.forEach((powerUp, pIndex) => {
    powerUp.update()

    // Remove off-screen powerUps
    if (
      powerUp.x + powerUp.radius < 0 ||
      powerUp.x - powerUp.radius > canvas.width ||
      powerUp.y + powerUp.radius < 0 ||
      powerUp.y - powerUp.radius > canvas.height
    ) {
      setTimeout(() => {
        powerUps.splice(pIndex, 1)
      }, 0)
    }

    const dist = Math.hypot(
      player.x - powerUp.x,
      player.y - powerUp.y,
    )

    // Gain powerUp
    if (dist < powerUp.image.height / 2 + player.radius) {
      powerUps.splice(pIndex, 1)
      player.powerUp = 'machine gun'
      player.colour = 'gold'
      setTimeout(() => {
        player.powerUp = ''
        player.colour = 'white'
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

    // Remove off-screen projectiles
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
      clearInterval(animationID)
      endScore.innerHTML = score
      endHighScore.innerHTML = highScore
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

    // Remove off-screen enemies
    if (
      enemy.x + enemy.radius < 0 ||
      enemy.x - enemy.radius > canvas.width ||
      enemy.y + enemy.radius < 0 ||
      enemy.y - enemy.radius > canvas.height
    ) {
      setTimeout(() => {
        enemies.splice(eIndex, 1)
      }, 0)
    }

    projectiles.forEach((projectile, playerIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
      // Enemy damaged

      if (dist - enemy.radius - projectile.radius < 1) {
        // Spawn particles for enemy

        for (let i = 0; i < enemy.radius * 3; i++) {
          particles.push(
            new Particle(
              enemy.x,
                enemy.y,
              Math.random() * 3,
              enemy.colour,
              {
                x: (Math.random() - 0.5) * (Math.random() * 5),
                y: (Math.random() - 0.5) * (Math.random() * 5),
              },
            ),
          )
        }

        // Spawn particles for projectile

        for (let i = 0; i < projectileSize * 2; i++) {
          particles.push(
              new Particle(
                  projectile.x,
                  projectile.y,
                  Math.random() * 3,
                  projectile.colour,
                  {
                    x: (Math.random() - 0.5) * (Math.random() * 5),
                    y: (Math.random() - 0.5) * (Math.random() * 5),
                  },
              ),
          )
        }
        // add to score

        score += Math.ceil(enemy.radius / 5)
        if (score > localStorage.getItem('highScore')) {
          localStorage.setItem('highScore', score)
          highScore = score
        }
        scoreEl.innerHTML = score

        if (enemy.radius - player.damage > player.damage) {
          gsap.to(enemy, { radius: enemy.radius - player.damage })
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
        new Projectile(player.x, player.y, projectileSize, 'white', velocity))
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
        new Projectile(player.x, player.y, projectileSize, 'yellow', velocity))
    }
  }
}
