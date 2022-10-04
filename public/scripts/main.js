function init () {
  score = 0
  scoreEl.innerHTML = score
  backgroundParticles = []
  enemies = []
  particles = []
  powerUps = []
  projectiles = []
  start = true
  player.x = canvasCenter.x
  player.velocity.x = 0
  player.y = canvasCenter.y
  player.velocity.y = 0
  clearInterval(enemyInterval)
  clearInterval(powerUpInterval)
  spawnBackgroundParticles()
}

function spawnEnemies () {
  enemyInterval = setInterval(() => {
                                const radius = Math.random() * (maxEnemySize - minEnemySize) + minEnemySize
                                let pos = spawnOnEdge(radius, radius)
                                const angle = angleBetween(player, pos)
                                const velocity = {
                                  x: Math.cos(angle),
                                  y: Math.sin(angle),
                                }
                                enemies.push(new Enemy(pos.x, pos.y, radius, randomEnemyColor(), velocity))
                              }, randomNumber(2000 - (score / 4 <= 1000 ? score / 4 : 1000), 700),
  )
}

function spawnPowerUps () {
  powerUpInterval = setInterval(() => {
    let pos = spawnOnEdge(16, 16) // Width and height of image
    const angle = angleBetween(randomPos, pos)
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    }
    powerUps.push(new PowerUp(pos.x, pos.y, velocity))
  }, randomNumber(40000, 60000))
}

function SpawnParticles (x, y, color, radius, count, velocity = { max, min }) {
  for (let i = 0; i < count; i++) {
    particles.push(
      new Particle(
        x,
        y,
        radius,
        color,
        {
          x: randomNumber(velocity.min, velocity.max),
          y: randomNumber(velocity.min, velocity.max),
        },
      ),
    )
  }
}

function spawnBackgroundParticles () {
  for (let y = 0; y < canvas.height + bpDensity;
    y += bpDensity) {
    for (let x = 0; x < canvas.width + bpDensity;
      x += bpDensity) {
      backgroundParticles.push(new BackgroundParticle(x, y, 3, 'blue'))
    }
  }
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

function createScoreLabel (score) {
  const scoreLabel = document.createElement('label')
  scoreLabel.innerHTML = score
  scoreLabel.style.color = scoreLabelColor
  scoreLabel.style.position = 'absolute'
  scoreLabel.style.userSelect = 'none'
  document.body.appendChild(scoreLabel)
  scoreLabel.style.left = player.x - scoreLabel.offsetWidth / 2 +
    randomNumber(-5, 5) + 'px'
  scoreLabel.style.top = player.y - scoreLabel.offsetHeight / 2 -
    player.radius - 10 + randomNumber(-5, 5) + 'px'

  gsap.to(scoreLabel, {
    opacity: 0,
    y: -30,
    duration: 0.75,
    onComplete: () => scoreLabel.parentNode.removeChild(scoreLabel),
  })
}

function reset () {
  start = false
  clearInterval(animationID)
  endScore.innerHTML = score.toString()
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

function animate () {
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  backgroundParticles.forEach(backgroundParticle => {
    const dist = distance(player, backgroundParticle)

    if (dist < 150) {
      backgroundParticle.alpha = 0
      if (dist > 120) {
        // gsap.fromTo()
        backgroundParticle.alpha = 0.5
      }
    } else if (backgroundParticle.alpha < 0.1) {
      backgroundParticle.alpha += 0.01
    } else if (backgroundParticle.alpha > 0.1) {
      backgroundParticle.alpha -= 0.01
    }

    backgroundParticle.draw()
  })
  player.update()

  powerUps.forEach((powerUp, powerUpIndex) => {
    powerUp.update()

    removeEntityIfOffscreen(powerUp, powerUpIndex, powerUps)

    const dist = distance(player, powerUp)

    // Gain powerUp
    if (dist < powerUp.image.height / 2 + player.radius) {
      powerUps.splice(powerUpIndex, 1)
      player.powerUp = 'machine gun'
      player.colour = 'gold'
      setTimeout(() => {
        player.powerUp = ''
        player.colour = 'white'
      }, 20000)
    }
  })
  shootMachineGun()

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
      isOffscreen(projectile, projectile.radius,
                  projectile.radius)
    ) {
      setTimeout(() => {
        projectiles.splice(pIndex, 1)
      }, 0)
    }
  })

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update()

    const dist = distance(player, enemy)

    // Dead, end the game
    if (dist - enemy.radius - player.radius < 1) {
      reset()
    }

    removeEntityIfOffscreen(enemy, enemyIndex, enemies)

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
      // Enemy damaged

      if (dist - enemy.radius - projectile.radius < 1) {

        SpawnParticles(enemy.x, enemy.y, enemy.colour,
                       randomNumber(1, 3), enemy.radius, {
                         max: 4,
                         min: -4,
                       })

        SpawnParticles(projectile.x, projectile.y, projectile.colour,
                       randomNumber(1, 4), projectileSize * 2, {
                         max: 3,
                         min: -3,
                       })
        // add to score
        const newScore = Math.ceil(enemy.radius / 5)
        if (score > localStorage.getItem('highScore')) {
          localStorage.setItem('highScore', score.toString())
          highScore = score
        }

        if (enemy.radius - player.damage > player.damage) {
          damageEnemy(enemy, projectile, projectileIndex, newScore)
        } else {
          killEnemy(enemyIndex, projectileIndex, enemy, projectile,
                    newScore + 20)
        }
        scoreEl.innerHTML = score.toString()
      }
    })
  })
}

function removeEntityIfOffscreen (entity, index, entityArray) {
  if (
    entity.x + entity.radius < 0 ||
    entity.x - entity.radius > canvas.width ||
    entity.y + entity.radius < 0 ||
    entity.y - entity.radius > canvas.height
  ) {
    setTimeout(() => {
      entityArray.splice(index, 1)
    }, 0)
  }
}

function killEnemy (enemyIndex, projectileIndex, enemy, projectile, newScore) {
  createScoreLabel(newScore)
  changeBPColor(enemy.color)
  enemies.splice(enemyIndex, 1)
  projectiles.splice(projectileIndex, 1)
  score += newScore
  killCount++
}

function damageEnemy (enemy, projectile, projectileIndex, newScore) {
  createScoreLabel(newScore)
  gsap.to(enemy, { radius: enemy.radius - player.damage })
  projectiles.splice(projectileIndex, 1)
  score += newScore
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
  if (!start) return
  if (player.powerUp !== 'machine gun') return
  if (!projectiles.length <= 700) return
  if (!player.shootingCooldown <= 0) return
  if (!mouseDown) return

  const angle = angleBetween({ x: mouse.x, y: mouse.y }, player)
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  }

  projectiles.push(
    new Projectile(player.x, player.y, projectileSize, 'yellow', velocity))

  player.shootingCooldown = 4

}

function changeBPColor (color) {
  backgroundParticles.forEach(backgroundParticle => {
    gsap.set(backgroundParticle, {
      color: 'white',
      alpha: 0.9,
    })
    gsap.to(backgroundParticle, {
      color,
      alpha: 0.1,
    })
  })
}
