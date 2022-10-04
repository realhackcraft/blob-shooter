// shoot
addEventListener('click', (event) => {
  if (player.powerUp !== 'machine gun') {
    if (player.shootingCooldown <= 0) {
      shoot(event.clientX, event.clientY)
      player.shootingCooldown = 6
    }
  }
})

// start game button actions and animations

function startGame () {
  setTimeout(() => {
    init()
    animationID = setInterval(animate, 1000 / FPS)

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
  if (event.code === 'Enter') {
    startGame()
    removeEventListener('keydown', startGameBind)
  }
}

const startGameBind = startGameOnEnter.bind(KeyboardEvent)

startGameBtn.addEventListener('click', startGame)
addEventListener('keydown', startGameBind)

addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
      player.direction.y = 'up'
      break
    case 'KeyS':
    case 'ArrowDown':
      player.direction.y = 'down'
      break
    case 'KeyA':
    case 'ArrowLeft':
      player.direction.x = 'left'
      break
    case 'KeyD':
    case 'ArrowRight':
      player.direction.x = 'right'
      break
  }
})

addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'Space':
      player.sprint = true
      break
  }
  console.log(e)
})

addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'Space':
      player.sprint = false
      break
  }
})

addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
    case 'KeyS':
    case 'ArrowDown':
      player.direction.y = 'none'
      break
    case 'KeyA':
    case 'ArrowLeft':
    case 'KeyD':
    case 'ArrowRight':
      player.direction.x = 'none'
      break
  }
})

addEventListener('mousedown', () => {
  mouseDown = true
})

addEventListener('mouseup', () => {
  mouseDown = false
})

addEventListener('mousemove', (event) => {
  mouse.x = event.clientX // Gets Mouse X
  mouse.y = event.clientY // Gets Mouse Y
})

addEventListener('resize', () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvasCenter = {
    x: canvas.width / 2,
    y: canvas.height / 2,
  }
})