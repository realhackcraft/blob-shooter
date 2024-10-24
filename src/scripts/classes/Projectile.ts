import { Entity } from "./Entity";

export class Projectile extends Entity {
  velocity: { x: number; y: number };
  speed: number;
  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    velocity: { x: number; y: number },
    speed: number,
  ) {
    super(x, y, radius, color, 1);
    this.velocity = velocity;
    this.speed = speed;
  }

  update(delta: number) {
    this.lastPos.x = this.x;
    this.lastPos.y = this.y;

    this.x += this.velocity.x * this.speed * delta;
    this.y += this.velocity.y * this.speed * delta;
  }
}
