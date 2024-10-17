class Enemy extends Entity {
  constructor(x, y, radius, color, velocity, speed) {
    super(x, y, radius, color, 1);
    this.radians = 0;
    this.speed = speed;
    this.velocity = velocity;
    this.center = {
      x,
      y,
    };
    this.type = "Normal";

    // Special enemies
    if (Math.random() < 0.5) {
      this.type = "Homing";
      this.color = this.color.replace("50%", "75%");

      if (Math.random() < 0.5) {
        this.type = "Hopping";
        this.color = this.color.replace("50%", "25%");
        if (Math.random() < 0.5) {
          this.type = "Homing-Hopping";
          this.color = this.color.replace("25%", "50%");
        }
      }

      if (Math.random() < 0.25) {
        this.type = "Drunk";
        this.color = this.color.replace("50%", "25%");
      }
      this.radius += 10;
    }
  }

  update(delta) {
    this.lastPos.x = this.x;
    this.lastPos.y = this.y;

    if (this.type === "Homing") {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.velocity.x = Math.cos(angle);
      this.velocity.y = Math.sin(angle);

      this.x += this.velocity.x * this.speed * delta;
      this.y += this.velocity.y * this.speed * delta;

      this.center.x = this.x;
      this.center.y = this.y;
    } else if (this.type === "Hopping" || this.type === "Drunk") {
      this.radians += randomNumber(0.005, 0.01) * delta;
      if (this.radians >= 2 * Math.PI) {
        this.radians = this.radians % (2 * Math.PI);
      }

      this.center.x += this.velocity.x * this.speed * delta;
      this.center.y += this.velocity.y * this.speed * delta;

      if (this.type === "Drunk") {
        this.x = this.center.x + Math.cos(this.radians) * (15 + this.radius);
        this.y = this.center.y + Math.sin(this.radians) * (15 + this.radius);
      } else if (this.type === "Hopping") {
        this.x = this.center.x + Math.cos(this.radians) * (5 + this.radius);
        this.y = this.center.y + Math.sin(this.radians) * (5 + this.radius);
      }
    } else if (this.type === "Homing-Hopping") {
      this.radians += randomNumber(0.005, 0.01) * delta;

      // Overflow protection
      if (this.radians >= 2 * Math.PI) {
        this.radians = this.radians % (2 * Math.PI);
      }

      const angle = Math.atan2(
        player.y - this.center.y,
        player.x - this.center.x,
      );
      this.velocity.x = Math.cos(angle);
      this.velocity.y = Math.sin(angle);

      this.center.x += this.velocity.x * this.speed * delta;
      this.center.y += this.velocity.y * this.speed * delta;

      this.x = this.center.x + Math.cos(this.radians) * 10;
      this.y = this.center.y + Math.sin(this.radians) * 10;
    } else {
      this.x += this.velocity.x * this.speed * delta;
      this.y += this.velocity.y * this.speed * delta;

      this.center.x = this.x;
      this.center.y = this.y;
    }
  }
}
