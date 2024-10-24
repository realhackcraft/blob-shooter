import { globalCtx } from "../helper";
import { Entity } from "./Entity";

export class Particle extends Entity {
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
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.speed = speed;
    this.alpha = 1;
  }

  draw() {
    const ctx = globalCtx;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    super.draw();
    ctx.restore();
  }

  update(delta: number, friction: number) {
    this.lastPos.x = this.x;
    this.lastPos.y = this.y;

    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x * this.speed * delta;
    this.y += this.velocity.y * this.speed * delta;
    this.alpha -= 0.01;
  }
}
