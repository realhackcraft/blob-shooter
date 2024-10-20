// init DOM elements

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startGameBtn = document.getElementById("start");
const menu = document.getElementById("menu");
const scoreEl = document.getElementById("score");
const endScore = document.getElementById("bigScore");
const endHighScore = document.getElementById("highScore");
const fpsDisplay = document.getElementById("fpsDisplay");

if (window.devicePixelRatio > 1) {
  var canvasWidth = innerWidth;
  var canvasHeight = innerHeight;

  canvas.width = canvasWidth * window.devicePixelRatio;
  canvas.height = canvasHeight * window.devicePixelRatio;
  canvas.style.width = canvasWidth + "px";
  canvas.style.height = canvasHeight + "px";

  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

// Define commonly used value
let canvasEdges = {
  left: 0,
  right: innerWidth,
  top: 0,
  bottom: innerHeight,
};

let canvasCenter = {
  x: canvasEdges.right / 2,
  y: canvasEdges.bottom / 2,
};

let sfx = {
  background: new Howl({
    src: "./assets/aud/MarchOfTheBlob.wav",
    volume: 0.4,
    preload: true,
    loop: true,
  }),
  shoot: new Howl({
    src: "./assets/aud/laserShoot.wav",
    volume: 0.1,
  }),
  damageEnemy: new Howl({
    src: "./assets/aud/hitHurt.wav",
    volume: 0.1,
  }),
  killEnemy: new Howl({
    src: "./assets/aud/explosion.wav",
    volume: 0.1,
  }),
  powerUp: new Howl({
    src: "./assets/aud/powerUp.wav",
    volume: 0.1,
  }),
  death: new Howl({
    src: "./assets/aud/death.wav",
    volume: 0.1,
  }),
  click: new Howl({
    src: "./assets/aud/click.wav",
    volume: 0.1,
  }),
};

let stats = {
  killCount: initLocalStorageIfNull("killCount", 0),
  projectileShot: initLocalStorageIfNull("projectileShot", 0),
  damageDealt: initLocalStorageIfNull("damageDealt", 0),
};

// Define vars and constants
let score = 0;
let highScore = initLocalStorageIfNull("highScore", 0);
endHighScore.innerHTML = highScore;

let backgroundParticles = [];
let enemies = [];
let particles = [];
let powerUps = [];
let scoreLabels = [];
let start = false;
let mouse = { x: 0, y: 0 };
let mouseDown;

let animationID;
let lastTimestamp = 0;
let lastFpsUpdate = 0;
let FPS = 60;
let delta = 0;
let lastFrameTimeMs = 0;
let framesThisSecond = 0;
let timestep = Math.floor(1000 / FPS);

const enableShaders = true;
const startingBackgroundColor = randomEnemyColor();
const bpDensity = 40;
const backgroundColor = "rgba(0, 0, 0, 0.1)";
const friction = 0.95;
const maxEnemySize = 30;
const minEnemySize = 5;
let randomPos = {
  x: Math.random() * canvasCenter.x,
  y: Math.random() * canvasCenter.y,
};
const player = new Player(canvasCenter.x, canvasCenter.y, 0.01, 10, "white");

const scoreLabelFillColor = "white";
const scoreLabelStrokeColor = "black";

let enemyInterval, powerUpInterval;
