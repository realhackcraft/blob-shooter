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

// Define vars and constants
let score = 0
let highScore = localStorage.getItem('highScore') === null
  ? localStorage.setItem('highScore', score.toString())
  : localStorage.getItem('highScore')
endHighScore.innerHTML = highScore
let animationID
let enemies = []
let particles = []
let projectiles = []
let powerUps = []
let start = false
let mouse = { x: 0, y: 0 }
let mouseDown
let projectileSize = 5
const FPS = 60
const friction = 0.95
const maxEnemySize = 30
const minEnemySize = 5
const randomPos = {
  x: Math.random() * canvasCenter.x,
  y: Math.random() * canvasCenter.y,
}
const player = new Player(canvasCenter.x, canvasCenter.y, 10, 10, 'white')

let enemyInterval, powerUpInterval

// Stats
let killCount