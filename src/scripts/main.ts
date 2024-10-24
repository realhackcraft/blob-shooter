import gsap from "gsap";

import { BackgroundParticle } from "./classes/BackgroundParticle";
import { Enemy } from "./classes/Enemy";
import { Particle } from "./classes/Particle";
import { Player } from "./classes/Player";
import { PowerUp } from "./classes/PowerUp";
import { PowerUpVariant, ScoreLabel } from "./types";
import { Entity } from "./classes/Entity";
import { Projectile } from "./classes/Projectile";
import { loadShader, render } from "./shader";
import {
  angleBetween,
  distance,
  initLocalStorageIfNull,
  isOffScreen,
  randomEnemyColor,
  randomNumber,
  setCtx,
} from "./helper";
import AudioManager from "./classes/Audio";

// NOTE: VARIABLE START

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const startGameBtn = document.getElementById("start") as HTMLButtonElement;
const menu = document.getElementById("menu") as HTMLElement;
const endScore = document.getElementById("bigScore") as HTMLElement;
const endHighScore = document.getElementById("highScore") as HTMLElement;
const fpsDisplay = document.getElementById("fpsDisplay") as HTMLElement;
const fpsContainer = document.getElementById("fpsContainer") as HTMLElement;
const resetHighScoreBtn = document.getElementById("reset") as HTMLAnchorElement;

setCtx(ctx);

// Performance variables
const enableShaders = true;
let showFPS = false;
const enableRetinaResolution = false;

const scale = enableRetinaResolution ? window.devicePixelRatio : 1;

const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;

canvas.width = canvasWidth * scale;
canvas.height = canvasHeight * scale;
canvas.style.width = canvasWidth + "px";
canvas.style.height = canvasHeight + "px";

ctx.scale(scale, scale);

// Define commonly used value
let canvasEdges = {
  left: 0,
  right: window.innerWidth,
  top: 0,
  bottom: window.innerHeight,
};

let canvasCenter = {
  x: canvasEdges.right / 2,
  y: canvasEdges.bottom / 2,
};

const cursorImage = new Image();
cursorImage.src = "./assets/img/cursor.png";

let stats = {
  killCount: initLocalStorageIfNull("killCount", 0),
  projectileShot: initLocalStorageIfNull("projectileShot", 0),
  damageDealt: initLocalStorageIfNull("damageDealt", 0),
};

// Define vars and constants
let score = 0;
let highScore = initLocalStorageIfNull("highScore", 0);
endHighScore.innerHTML = String(highScore);

let backgroundParticles: BackgroundParticle[] = [];
let enemies: Enemy[] = [];
let particles: Particle[] = [];
let powerUps: PowerUp[] = [];
let scoreLabels: ScoreLabel[] = [];
let start = false;

let mouse = {
  x: 0,
  y: 0,
  lastX: 0,
  lastY: 0,
  interpolatedX: 0,
  interpolatedY: 0,
};

let accurateMouse = {
  x: 0,
  y: 0,
};

let mouseDown: boolean;

let animationID: number;
let lastTimestamp = 0;
let lastFpsUpdate = 0;
let FPS = 60;
let delta = 0;
let lastFrameTimeMs = 0;
let framesThisSecond = 0;
let timestep = Math.floor(1000 / FPS);
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

// Timer interval ids
let enemyInterval: number;
let powerUpInterval: number;

// NOTE: VARIABLE END

loadShader(enableRetinaResolution);

// shoot
window.addEventListener("click", (event: MouseEvent) => {
  if (!start) return;
  if (player.powerUp !== PowerUpVariant.RapidFire) {
    if (player.shootingCooldown <= 0) {
      player.shoot(event.clientX, event.clientY);
      stats.projectileShot++;
      window.localStorage.setItem(
        "projectileShot",
        String(stats.projectileShot),
      );

      player.shootingCooldown = 6;
    }
  }
});

resetHighScoreBtn.addEventListener("click", (event: MouseEvent) => {
  if (player.powerUp !== PowerUpVariant.RapidFire) {
    if (player.shootingCooldown <= 0) {
      player.shoot(event.clientX, event.clientY);
      player.shootingCooldown = 6;
    }
  }
});

const startGameOnEnter = function(event: KeyboardEvent) {
  if (event.code === "Enter") {
    startGame();
    window.removeEventListener("keydown", startGameBind);
  }
};

const startGameBind = startGameOnEnter.bind(KeyboardEvent);

startGameBtn.addEventListener("click", startGame);
window.addEventListener("keydown", startGameBind);

window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (!start) return;
  switch (event.code) {
    case "KeyW":
    case "ArrowUp":
      player.direction.y = "up";
      break;
    case "KeyS":
    case "ArrowDown":
      player.direction.y = "down";
      break;
    case "KeyA":
    case "ArrowLeft":
      player.direction.x = "left";
      break;
    case "KeyD":
    case "ArrowRight":
      player.direction.x = "right";
      break;
    case "Space":
      player.sprint = true;
      break;
    case "KeyF":
      showFPS = !showFPS;
      break;
  }
});

window.addEventListener("keyup", (event: KeyboardEvent) => {
  switch (event.code) {
    case "KeyW":
    case "ArrowUp":
    case "KeyS":
    case "ArrowDown":
      player.direction.y = "none";
      break;
    case "KeyA":
    case "ArrowLeft":
    case "KeyD":
    case "ArrowRight":
      player.direction.x = "none";
      break;
    case "Space":
      player.sprint = false;
      break;
  }
});

window.addEventListener("mousedown", () => {
  mouseDown = true;
});

window.addEventListener("mouseup", () => {
  mouseDown = false;
});

window.addEventListener("mousemove", (event: MouseEvent) => {
  accurateMouse.x = event.clientX; // Gets Mouse X
  accurateMouse.y = event.clientY; // Gets Mouse Y
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvasCenter = {
    x: canvas.width / 2,
    y: canvas.height / 2,
  };
  backgroundParticles = [];
  spawnBackgroundParticles();
});

function startGame() {
  AudioManager.play("click");
  setTimeout(() => {
    score = 0;
    backgroundParticles = [];
    enemies = [];
    particles = [];
    powerUps = [];
    scoreLabels = [];
    player.projectiles = [];
    start = true;
    player.x = canvasCenter.x;
    player.velocity.x = 0;
    player.y = canvasCenter.y;
    player.velocity.y = 0;
    clearInterval(enemyInterval);
    clearInterval(powerUpInterval);
    spawnBackgroundParticles();
    AudioManager.play("background");
    // CanvasRenderingContext2D config
    ctx.font = "24pt IllusionBook";
    ctx.lineWidth = "0.5pt";
    ctx.imageSmoothingEnabled = false;

    animationID = requestAnimationFrame(function(timestamp) {
      lastFrameTimeMs = timestamp;
      lastFpsUpdate = timestamp;
      framesThisSecond = 0;
      animationID = requestAnimationFrame(animate);
    });

    spawnEnemies();
    spawnPowerUps();
    gsap.to("#menu", {
      opacity: 0,
      scale: 0.7,
      duration: 0.4,
      ease: "expo.in",
      onComplete: () => {
        menu.style.display = "none";
      },
    });
  }, 50);
}

function spawnEnemies() {
  enemyInterval = window.setInterval(
    () => {
      const radius =
        Math.random() * (maxEnemySize - minEnemySize) + minEnemySize;
      let pos = spawnOnEdge(radius, radius);
      const angle = angleBetween(player, pos);
      const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle),
      };
      enemies.push(
        new Enemy(
          pos.x,
          pos.y,
          radius,
          randomEnemyColor(),
          velocity,
          randomNumber(0.05, 0.1),
        ),
      );
    },
    randomNumber(2000 - (score / 4 <= 1000 ? score / 4 : 1000), 700),
  );
}

function spawnPowerUps() {
  powerUpInterval = window.setInterval(
    () => {
      const pos = spawnOnEdge(16, 16); // Width and height of image
      const angle = angleBetween(randomPos, pos);
      const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle),
      };
      powerUps.push(
        new PowerUp(
          pos.x,
          pos.y,
          velocity,
          randomNumber(0.05, 0.01),
          PowerUpVariant.Random,
        ),
      );
    },
    randomNumber(15000, 35000),
  );
}

function spawnParticles(
  x: number,
  y: number,
  color: string,
  radius: number,
  count: number,
  velocity = { max: 1, min: -1 },
) {
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
        randomNumber(0.03, 0.05),
      ),
    );
  }
}

function spawnBackgroundParticles() {
  for (let y = 0; y < canvasEdges.bottom + bpDensity; y += bpDensity) {
    for (let x = 0; x < canvasEdges.right + bpDensity; x += bpDensity) {
      backgroundParticles.push(
        new BackgroundParticle(x, y, 3, startingBackgroundColor),
      );
    }
  }
}

function spawnOnEdge(width: number, height: number) {
  let x, y;
  if (Math.random() < 0.5) {
    x = Math.random() < 0.5 ? 0 - width : canvasEdges.right + width;
    y = Math.random() * canvasEdges.bottom;
  } else {
    x = Math.random() * canvasEdges.right;
    y = Math.random() < 0.5 ? 0 - height : canvasEdges.bottom + height;
  }

  return { x: x, y: y };
}

async function resetHighScore() {
  let reset = false;
  const resetTitle = "Resetting highscore";
  const resetDescription = "This action cannot be reverted. Are you sure?";
  if (window.__TAURI__) {
    const confirm = window.__TAURI__.dialog.confirm;
    reset = await confirm(resetDescription, {
      title: resetTitle,
      kind: "warning",
    });
  } else {
    reset = confirm(resetDescription);
  }

  if (reset) {
    highScore = 0;
    endHighScore.innerHTML = String(highScore);
    window.localStorage.setItem("highScore", String(highScore));
  }
}

function drawScoreLabel() {
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = scoreLabelFillColor;

  const scoreText = `Score: ${score}`;
  ctx.fillText(scoreText, 80, 40);
}

function createCursorScoreLabel(score: number) {
  const x = mouse.x + randomNumber(-15, 15);
  const y = mouse.y - 60 - randomNumber(-15, 15);
  const scoreLabel = {
    x: x,
    y: y,
    lastY: y,
    score: score,
    life: 350, // Lifetime of score label in ms
  };

  scoreLabels.push(scoreLabel);
}

function updateScoreLabels(delta: number) {
  const toRemove: number[] = [];
  scoreLabels.forEach((score, i) => {
    // Remove label if the life is expired
    if (score.life < 0) {
      toRemove.push(i);
    }

    score.lastY = score.y;
    score.y -= 0.05 * delta; // Move label up
    score.life -= delta; // Reduce the lifespan of the label
    scoreLabels[i] = score;
  });

  // Remove expired score lables
  toRemove.forEach((_element, i) => {
    scoreLabels.splice(i, 1);
  });
}

function drawCursorScoreLabels(interp: number) {
  // Adjust font settings
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = scoreLabelFillColor;
  ctx.strokeStyle = scoreLabelStrokeColor;

  scoreLabels.forEach((scoreLabel) => {
    // Compute linearly interpolated positions
    const y = scoreLabel.lastY + (scoreLabel.y - scoreLabel.lastY) * interp;

    ctx.fillText(String(scoreLabel.score), scoreLabel.x, y);
    ctx.strokeText(String(scoreLabel.score), scoreLabel.x, y);
  });
}

function drawCursor() {
  const width = cursorImage.width;
  const height = cursorImage.height;

  // mouse.interpolatedX - width to center image on x, y instead of drawn on top
  // left. There is no / 2 because the actual image is scaled 2x
  ctx.drawImage(
    cursorImage,
    0,
    0,
    width,
    height,
    mouse.interpolatedX - width,
    mouse.interpolatedY - height,
    width * 2,
    height * 2,
  );
}

function reset() {
  cancelAnimationFrame(animationID);
  endScore.innerHTML = score.toString();
  endHighScore.innerHTML = String(highScore);
  menu.style.display = "flex";
  gsap.fromTo(
    "#menu",
    {
      opacity: 0,
      scale: 0.7,
    },
    {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: "expo",
    },
  );
  startGameBtn.innerHTML = "Restart";
  window.addEventListener("keydown", startGameBind);
}

function updateHighScore() {
  if (score > parseInt(window.localStorage.getItem("highScore") as string)) {
    window.localStorage.setItem("highScore", score.toString());
    highScore = score;
  }
}

function pickupPowerUp(powerUpIndex: number) {
  player.powerUp = powerUps[powerUpIndex].name;
  powerUps.splice(powerUpIndex, 1);
  setTimeout(() => {
    player.powerUp = PowerUpVariant.Blank;
    player.color = "white";
  }, 20000);
  AudioManager.play("powerup");
}

function panic() {
  delta = 0;
}

function animate(timestamp: number) {
  // Update delta time
  delta += timestamp - lastFrameTimeMs;
  lastFrameTimeMs = timestamp;

  // Increase FPS dynamically when CPU can handle faster rendering
  if (timestamp > lastFpsUpdate + 1000) {
    // Dynamically adjust FPS upwards
    FPS = 0.25 * framesThisSecond + 0.75 * FPS; // Smooth FPS update
    framesThisSecond = 0;

    timestep = Math.floor(1000 / FPS);
    lastFpsUpdate = timestamp;
  }
  framesThisSecond++;

  // Update mouse
  mouse.lastX = mouse.x;
  mouse.lastY = mouse.y;
  mouse.x = accurateMouse.x;
  mouse.y = accurateMouse.y;

  // Fixed timestep game logic
  let numUpdateSteps = 0;
  while (delta >= timestep) {
    update(timestep); // Game state updates
    delta -= timestep;
    if (++numUpdateSteps >= 240) {
      panic(); // Prevent too many updates in one frame
      break;
    }
  }

  const interp = delta / timestep;

  // Update mouse interp
  mouse.interpolatedX = mouse.lastX + (mouse.x - mouse.lastX) * interp;
  mouse.interpolatedY = mouse.lastY + (mouse.y - mouse.lastY) * interp;

  // Interpolate and draw the frame
  draw(interp);

  // Optional shaders
  if (enableShaders) {
    const time = performance.now() / 1000; // Time in seconds for shader effects
    render(time);
  }

  // Request the next frame
  animationID = requestAnimationFrame(animate);
}

function draw(interp: number) {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(
    canvasEdges.left,
    canvasEdges.top,
    canvasEdges.right,
    canvasEdges.bottom,
  );

  // Equivalent of ctx.save and ctx.restore,but only store the changed values
  const previousGlobalAlpha = ctx.globalAlpha;
  backgroundParticles.forEach((backgroundParticle) => {
    backgroundParticle.draw();
  });
  ctx.globalAlpha = previousGlobalAlpha;
  // The above saves the transparency and reloads it after all
  // backgroundParticles has been drawn, to save on reasignment calls

  player.draw();

  enemies.forEach((enemy) => {
    enemy.draw(interp);
  });

  particles.forEach((particle) => {
    particle.draw();
  });

  player.projectiles.forEach((projectile) => {
    projectile.draw(interp);
  });

  powerUps.forEach((powerUp) => {
    powerUp.draw(interp);
  });

  drawCursorScoreLabels(interp);

  drawCursor();

  drawScoreLabel();

  if (showFPS) {
    fpsDisplay.innerHTML = Math.round(FPS).toString();
    if (fpsContainer.hidden) {
      fpsContainer.hidden = false;
    }
  } else {
    if (!fpsContainer.hidden) {
      fpsContainer.hidden = true;
    }
  }
}

function update(delta: number) {
  if (!start) return;

  randomPos = {
    x: Math.random() * canvasCenter.x,
    y: Math.random() * canvasCenter.y,
  };

  player.update(delta, canvasEdges, friction, mouseDown, mouse);

  powerUps.forEach((powerUp, powerUpIndex) => {
    removeEntityIfOffscreen(powerUp, powerUpIndex, powerUps);

    powerUp.update(delta);

    const dist = distance(player, powerUp);

    // Gain powerUp
    if (dist < Math.max(powerUp.width, powerUp.height) / 2 + player.radius) {
      pickupPowerUp(powerUpIndex);
    }
  });

  player.projectiles.forEach((projectile, pIndex) => {
    // Remove off-screen projectiles
    if (
      isOffScreen(projectile, projectile.radius, projectile.radius, canvasEdges)
    ) {
      setTimeout(() => {
        player.projectiles.splice(pIndex, 1);
      }, 0);
    }

    projectile.update(delta);
  });

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update(delta, player);

    const dist = distance(player, enemy);

    // Dead, end the game
    if (dist - enemy.radius - player.radius < 1) {
      gameOver();
    }

    removeEntityIfOffscreen(enemy, enemyIndex, enemies);

    player.projectiles.forEach((projectile, projectileIndex) => {
      const dist = distance(projectile, enemy);
      // Enemy damaged

      if (dist - enemy.radius - projectile.radius < 1) {
        spawnParticles(
          enemy.x,
          enemy.y,
          enemy.color,
          randomNumber(2, 5),
          enemy.radius,
          {
            max: 7,
            min: -7,
          },
        );

        spawnParticles(
          projectile.x,
          projectile.y,
          projectile.color,
          randomNumber(2, 4),
          player.projectileSize * 2,
          {
            max: 3,
            min: -3,
          },
        );
        // add to score
        updateHighScore();

        if (enemy.radius - player.damage > player.damage) {
          damageEnemy(enemy, projectileIndex, player.damage);
        } else {
          killEnemy(
            enemyIndex,
            projectileIndex,
            enemy,
            projectile,
            player.damage + 20,
          );
        }
        stats.damageDealt = stats.damageDealt + player.damage;
        window.localStorage.setItem("damageDealt", String(stats.damageDealt));
      }
    });
  });

  backgroundParticles.forEach((backgroundParticle) => {
    const dist = distance(player, backgroundParticle);

    if (dist < 150) {
      if (dist > 120) {
        backgroundParticle.alpha = 0.5;
      } else {
        backgroundParticle.alpha = 0;
      }
    } else if (backgroundParticle.alpha < 0.1) {
      backgroundParticle.alpha += 0.01;
    } else if (backgroundParticle.alpha > 0.1) {
      backgroundParticle.alpha -= 0.01;
    }
  });

  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      setTimeout(() => {
        particles.splice(index, 1);
      }, 0);
    } else {
      particle.update(delta, friction);
    }
  });

  updateScoreLabels(delta);
}

function removeEntityIfOffscreen(
  entity: Entity,
  index: number,
  entityArray: any[],
) {
  if (
    entity.x + entity.radius < canvasEdges.left ||
    entity.x - entity.radius > canvasEdges.right ||
    entity.y + entity.radius < canvasEdges.top ||
    entity.y - entity.radius > canvasEdges.bottom
  ) {
    setTimeout(() => {
      entityArray.splice(index, 1);
    }, 0);
  }
}

function killEnemy(
  enemyIndex: number,
  projectileIndex: number,
  enemy: Enemy,
  projectile: Projectile,
  newScore: number,
) {
  createCursorScoreLabel(newScore);
  changeBPColor(enemy.color);
  enemies.splice(enemyIndex, 1);
  player.projectiles.splice(projectileIndex, 1);
  score += newScore;
  stats.killCount++;
  AudioManager.play("killEnemy");
}

function damageEnemy(enemy: Enemy, projectileIndex: number, newScore: number) {
  createCursorScoreLabel(newScore);
  gsap.to(enemy, { radius: enemy.radius - player.damage });
  player.projectiles.splice(projectileIndex, 1);
  score += newScore;
  AudioManager.play("damageEnemy");
}

function changeBPColor(color: string) {
  backgroundParticles.forEach((backgroundParticle) => {
    gsap.set(backgroundParticle, {
      color: "white",
      alpha: 0.9,
    });

    gsap.to(backgroundParticle, {
      color,
      alpha: 0.1,
    });
  });
}

function gameOver() {
  start = false;
  updateHighScore();
  AudioManager.stop("background");
  AudioManager.play("death");
  spawnParticles(
    player.x - player.velocity.x,
    player.y + player.velocity.y,
    player.color,
    randomNumber(player.radius / 3, player.radius / 2),
    randomNumber(player.radius * 2, player.radius * 2),
    {
      max: 4,
      min: -4,
    },
  );
  setTimeout(() => {
    reset();
  }, 1500);
}
