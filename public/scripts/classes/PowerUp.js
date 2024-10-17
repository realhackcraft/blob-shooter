class PowerUp {
	constructor(x, y, velocity, speed, name) {
		this.x = x;
		this.y = y;
		this.lastPos = { x, y };
		this.velocity = velocity;
		this.speed = speed;
		this.radians = 0;
		this.name = name;

		this.alpha = 1;
		gsap.to(this, {
			alpha: 0.1,
			duration: 0.6,
			repeat: -1,
		});

		this.image = new Image();
		this.image.src = `./assets/img/powerups/${this.name}.svg`;
		this.width = this.image.width / 10;
		this.height = this.image.height / 10;
	}

	update(delta) {
		this.lastPos.x = this.x;
		this.lastPos.y = this.y;

		this.radians += 0.001 * delta;
		this.x += this.velocity.x * this.speed * delta;
		this.y += this.velocity.y * this.speed * delta;

		// Overflow protection
		if (this.radians >= 2 * Math.PI) {
			this.radians = this.radians % (2 * Math.PI);
		}
	}

	draw(interp) {
		ctx.save();
		ctx.globalAlpha = this.alpha;
		ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
		ctx.rotate(this.radians);
		ctx.translate(-this.x - this.width / 2, -this.y - this.height / 2);
		ctx.drawImage(
			this.image,
			0,
			0,
			this.image.width,
			this.image.height,
			this.lastPos.x + (this.x - this.lastPos.x) * interp,
			this.lastPos.y + (this.y - this.lastPos.y),
			this.width,
			this.height,
		);
		ctx.restore();
	}
}
