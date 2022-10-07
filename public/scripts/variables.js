// init DOM elements

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const startGameBtn = document.getElementById('start')
const menu = document.getElementById('menu')
const scoreEl = document.getElementById('score')
const endScore = document.getElementById('bigScore')
const endHighScore = document.getElementById('highScore')

canvas.width = innerWidth
canvas.height = innerHeight

// Define commonly used value
let canvasCenter = {
  x: canvas.width / 2,
  y: canvas.height / 2,
}
let sfx = {
  shoot: new Howl({
                    src: './res/aud/laserShoot.wav',
                    volume: 0.1,
                  }),
  damageEnemy: new Howl({
                          src: './res/aud/hitHurt.wav',
                          volume: 0.1,
                        }),
  killEnemy: new Howl({
                        src: './res/aud/explosion.wav',
                        volume: 0.1,
                      }),
  powerUp: new Howl({
                      src: './res/aud/powerUp.wav',
                      volume: 0.1,
                    }),
  death: new Howl({
                    src: './res/aud/death.wav',
                    volume: 0.1,
                  }),
  click: new Howl({
                    src: './res/aud/click.wav',
                    volume: 0.1,
                  }),
}

// Define vars and constants
let score = 0
let highScore = localStorage.getItem('highScore') === null
  ? localStorage.setItem('highScore', score.toString())
  : localStorage.getItem('highScore')
endHighScore.innerHTML = highScore
let animationID
let backgroundParticles = []
let enemies = []
let particles = []
let powerUps = []
let start = false
let mouse = { x: 0, y: 0 }
let mouseDown

const startingBackgroundColor = randomEnemyColor()
const bpDensity = 30
const backgroundColor = 'rgba(0, 0, 0, 0.1)'
const FPS = 60
const friction = 0.95
const maxEnemySize = 30
const minEnemySize = 5
const randomPos = {
  x: Math.random() * canvasCenter.x,
  y: Math.random() * canvasCenter.y,
}
const player = new Player(canvasCenter.x, canvasCenter.y, 10, 10, 'white')
const fancyCursor = false

const scoreLabelColor = 'white'

let enemyInterval, powerUpInterval

// Stats
let killCount