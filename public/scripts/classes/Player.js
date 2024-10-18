class Player extends Entity {
	constructor(x, y, speed, radius, color) {
		super(x, y, radius, color, 1);
		this.speed = speed;
		this.sprintingSpeed = this.speed * 1.5;
		this.sprint = false;
		this.shootingCooldown = 10;
		this.powerUp = "";
		this.direction = {
			x: "none",
			y: "none",
		};
		this.velocity = {
			x: 0,
			y: 0,
		};
		this.projectiles = [];
		this.projectileColor = "white";
		this.projectileSize = 5;
		this.damage = randomInt(
			this.projectileSize,
			Math.pow(this.projectileSize, 1.2),
		);
	}

	update(delta) {
		this.lastPos.x = this.x;
		this.lastPos.y = this.y;

		this.shootingCooldown--;

		// x boundary
		if (
			this.x + this.radius + this.velocity.x * delta <= canvasEdges.right &&
			this.x - this.radius + this.velocity.x * delta >= canvasEdges.left
		) {
			this.x += this.velocity.x * delta;
		} else {
			this.velocity.x = 0;
		}

		// y boundary
		if (
			this.y + this.radius + this.velocity.y * delta <= canvasEdges.bottom &&
			this.y - this.radius + this.velocity.y * delta >= canvasEdges.top
		) {
			this.y += this.velocity.y * delta;
		} else {
			this.velocity.y = 0;
		}

		this.velocity.x *= friction;
		this.velocity.y *= friction;

		this.move();
		this.changeColor();
		this.damage = randomInt(this.projectileSize, this.projectileSize * 1.5);
	}

	move() {
		switch (this.direction.y) {
			case "up":
				this.velocity.y -= this.sprint ? this.sprintingSpeed : this.speed;
				break;
			case "down":
				this.velocity.y += this.sprint ? this.sprintingSpeed : this.speed;
				break;
		}
		switch (this.direction.x) {
			case "left":
				this.velocity.x -= this.sprint ? this.sprintingSpeed : this.speed;
				break;
			case "right":
				this.velocity.x += this.sprint ? this.sprintingSpeed : this.speed;
				break;
		}
	}

	changeColor() {
		this.color = "white";
		this.projectileColor = "white";
		if (this.powerUp === "rapid_fire") {
			this.color = "#FFD43B";
			this.projectileColor = "#FFD43B";
		} else if (this.powerUp === "bullet_size") {
			this.color = "#ff3b45";
			this.projectileColor = "#ff3b45";
		} else if (this.powerUp === "shoot_backwards") {
			this.color = "#3b86ff";
			this.projectileColor = "#3b86ff";
		}
	}

	shoot(x, y) {
		if (!start) return;
		if (this.projectiles.length >= 700) return;

		const angle = angleBetween({ x, y }, this);
		const velocity = {
			x: Math.cos(angle) * 5,
			y: Math.sin(angle) * 5,
		};

		this.projectiles.push(
			new Projectile(
				this.x,
				this.y,
				this.powerUp === "bullet_size"
					? this.projectileSize * 1.5
					: this.projectileSize,
				this.projectileColor,
				velocity,
				randomNumber(0.03, 0.05),
			),
		);

		if (this.powerUp === "shoot_backwards") {
			const backVelocity = {
				x: -Math.cos(angle) * 5,
				y: -Math.sin(angle) * 5,
			};
			this.projectiles.push(
				new Projectile(
					this.x,
					this.y,
					this.powerUp === "bullet_size"
						? this.projectileSize * 1.5
						: this.projectileSize,
					this.projectileColor,
					backVelocity,
					randomNumber(0.03, 0.05),
				),
			);
		}

		sfx.shoot.play();
		stats.projectileShot++;
		localStorage.setItem("projectileShot", stats.projectileShot);
	}

	shootMachineGun() {
		if (this.powerUp !== "rapid_fire") return;
		if (this.shootingCooldown >= 0) return;
		if (!mouseDown) return;

		this.shoot(mouse.x, mouse.y);

		this.shootingCooldown = 4;
	}

	draw() {
		super.draw();
	}
}
