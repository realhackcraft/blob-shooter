loadCursor();

function init() {
  score = 0;
  scoreEl.innerHTML = score;
  backgroundParticles = [];
  enemies = [];
  particles = [];
  powerUps = [];
  player.projectiles = [];
  start = true;
  player.x = canvasCenter.x;
  player.velocity.x = 0;
  player.y = canvasCenter.y;
  player.velocity.y = 0;
  clearInterval(enemyInterval);
  clearInterval(powerUpInterval);
  spawnBackgroundParticles();
  sfx.background.play();
}

function spawnEnemies() {
  enemyInterval = setInterval(
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
  powerUpInterval = setInterval(
    () => {
      const pos = spawnOnEdge(16, 16); // Width and height of image
      const angle = angleBetween(randomPos, pos);
      const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle),
      };
      powerUps.push(
        new PowerUp(pos.x, pos.y, velocity, randomNumber(0.05, 0.01), "random"),
      );
    },
    randomNumber(15000, 35000),
  );
}

function spawnParticles(
  x,
  y,
  color,
  radius,
  count,
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

function spawnOnEdge(width, height) {
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
    endHighScore.innerHTML = highScore;
    localStorage.setItem("highScore", highScore);
  }
}

function createScoreLabel(score) {
  const scoreLabel = document.createElement("label");
  scoreLabel.innerHTML = score;
  scoreLabel.style.color = scoreLabelColor;
  scoreLabel.style.position = "absolute";
  scoreLabel.style.userSelect = "none";
  document.body.appendChild(scoreLabel);
  scoreLabel.style.left =
    mouse.x - scoreLabel.offsetWidth / 2 + randomNumber(-5, 5) + "px";
  scoreLabel.style.top =
    mouse.y -
    scoreLabel.offsetHeight / 2 -
    player.radius -
    10 +
    randomNumber(-5, 5) +
    "px";

  gsap.to(scoreLabel, {
    opacity: 0,
    y: -30,
    duration: 0.75,
    onComplete: () => scoreLabel.parentNode.removeChild(scoreLabel),
  });
}

function reset() {
  cancelAnimationFrame(animationID);
  endScore.innerHTML = score.toString();
  endHighScore.innerHTML = highScore;
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
  addEventListener("keydown", startGameBind);
}

function updateHighScore() {
  if (score > localStorage.getItem("highScore")) {
    localStorage.setItem("highScore", score.toString());
    highScore = score;
  }
}

function pickupPowerUp(powerUpIndex) {
  player.powerUp = powerUps[powerUpIndex].name;
  powerUps.splice(powerUpIndex, 1);
  setTimeout(() => {
    player.powerUp = "";
    player.color = "white";
  }, 20000);
  sfx.powerUp.play();
}

function panic() {
  delta = 0;
}

function animate(timestamp) {
  if (timestamp - lastFrameTimeMs < timestep) {
    animationID = requestAnimationFrame(animate);
    return;
  }
  delta += timestamp - lastFrameTimeMs;
  lastFrameTimeMs = timestamp;

  if (timestamp > lastFpsUpdate + 1000) {
    FPS = 0.25 * framesThisSecond + 0.75 * FPS;

    lastFpsUpdate = timestamp;
    framesThisSecond = 0;
  }
  framesThisSecond++;

  let numUpdateSteps = 0;
  while (delta >= timestep) {
    update(timestep);
    delta -= timestep;
    if (++numUpdateSteps >= 240) {
      panic();
      break;
    }
  }

  draw(delta / timestep);

  if (enableShaders) {
    updateTexture();
    const time = performance.now() / 1000; // time in seconds
    render(time);
  }

  animationID = requestAnimationFrame(animate);
}

function draw(interp) {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(
    canvasEdges.left,
    canvasEdges.top,
    canvasEdges.right,
    canvasEdges.bottom,
  );

  player.draw(interp);

  enemies.forEach((enemy) => {
    enemy.draw(interp);
  });

  particles.forEach((particle) => {
    particle.draw(interp);
  });
  player.projectiles.forEach((projectile) => {
    projectile.draw(interp);
  });
  backgroundParticles.forEach((backgroundParticle) => {
    backgroundParticle.draw(interp);
  });
  powerUps.forEach((powerUp) => {
    powerUp.draw(interp);
  });
  fpsDisplay.innerHTML = Math.round(FPS).toString();
}

function update(delta) {
  if (start) {
    randomPos = {
      x: Math.random() * canvasCenter.x,
      y: Math.random() * canvasCenter.y,
    };

    player.update(delta);

    player.shootMachineGun();

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
      if (isOffScreen(projectile, projectile.radius, projectile.radius)) {
        setTimeout(() => {
          player.projectiles.splice(pIndex, 1);
        }, 0);
      }

      projectile.update(delta);
    });

    enemies.forEach((enemy, enemyIndex) => {
      enemy.update(delta);

      if (start) {
        const dist = distance(player, enemy);

        // Dead, end the game
        if (dist - enemy.radius - player.radius < 1) {
          gameOver();
        }
      }

      removeEntityIfOffscreen(enemy.center, enemyIndex, enemies);

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
            damageEnemy(enemy, projectile, projectileIndex, player.damage);
          } else {
            killEnemy(
              enemyIndex,
              projectileIndex,
              enemy,
              projectile,
              player.damage + 20,
            );
          }
          scoreEl.innerHTML = score.toString();
          stats.damageDealt = parseInt(stats.damageDealt) + player.damage;
          localStorage.setItem("damageDealt", stats.damageDealt);
        }
      });
    });
  }

  backgroundParticles.forEach((backgroundParticle) => {
    const dist = distance(player, backgroundParticle);

    if (dist < 150) {
      backgroundParticle.alpha = 0;
      if (dist > 120) {
        // gsap.fromTo()
        backgroundParticle.alpha = 0.5;
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
      particle.update(delta);
    }
  });
}

function removeEntityIfOffscreen(entity, index, entityArray) {
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

function killEnemy(enemyIndex, projectileIndex, enemy, projectile, newScore) {
  createScoreLabel(newScore);
  changeBPColor(enemy.color);
  enemies.splice(enemyIndex, 1);
  player.projectiles.splice(projectileIndex, 1);
  score += newScore;
  stats.killCount++;
  sfx.killEnemy.play();
}

function damageEnemy(enemy, projectile, projectileIndex, newScore) {
  createScoreLabel(newScore);
  gsap.to(enemy, { radius: enemy.radius - player.damage });
  player.projectiles.splice(projectileIndex, 1);
  score += newScore;
  sfx.damageEnemy.play();
}

function changeBPColor(color) {
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
  sfx.background.stop();
  sfx.death.play();
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
