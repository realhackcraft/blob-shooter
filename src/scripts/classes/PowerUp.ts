import { gsap } from "gsap";
import { Entity } from "./Entity";
import { PowerUpVariant } from "../types";
import { globalCtx, randomEnum } from "../helper";

export class PowerUp extends Entity {
  x: number;
  lastPos: { x: number; y: number };
  velocity: { x: number; y: number };
  speed: number;
  radians: number;
  y: number;
  name: PowerUpVariant;
  image: HTMLImageElement;
  width: number;
  height: number;

  constructor(
    x: number,
    y: number,
    velocity: { x: number; y: number },
    speed: number,
    variant = PowerUpVariant.Random,
  ) {
    let name;
    if (variant === PowerUpVariant.Random) {
      name = randomEnum(PowerUpVariant, 2); // Ignore the first two, they are
      // placeholder values
    } else {
      name = variant;
    }

    const image = new Image();
    image.src = `./assets/img/powerups/${name}.svg`;
    const width = image.width / 10;
    const height = image.height / 10;

    super(x, y, Math.max(width, height), "", 1);
    this.x = x;
    this.y = y;
    this.lastPos = { x, y };
    this.velocity = velocity;
    this.speed = speed;
    this.radians = 0;
    this.image = image;
    this.height = height;
    this.width = width;
    this.name = name;

    gsap.to(this, {
      alpha: 0.1,
      duration: 0.6,
      repeat: -1,
    });
  }

  update(delta: number) {
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

  draw(interp: number) {
    const ctx = globalCtx;
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
