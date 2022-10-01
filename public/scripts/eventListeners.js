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
      player.velocity.y -= player.speed
      break
    case 'a':
    case 'ArrowLeft':
      player.velocity.x -= player.speed
      break
    case 's':
    case 'ArrowDown':
      player.velocity.y += player.speed
      break
    case 'd':
    case 'ArrowRight':
      player.velocity.x += player.speed
      break
  }
})

addEventListener('mousemove', (event) => {
  mouseX = event.clientX // Gets Mouse X
  mouseY = event.clientY // Gets Mouse Y
})

addEventListener('resize', () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
})