class Projectile extends Entity {
	constructor(x, y, radius, color, velocity, speed) {
		super(x, y, radius, color, 1);
		this.velocity = velocity;
		this.speed = speed;
	}

	update(delta) {
		this.lastPos.x = this.x;
		this.lastPos.y = this.y;

		this.x += this.velocity.x * this.speed * delta;
		this.y += this.velocity.y * this.speed * delta;
	}
}
