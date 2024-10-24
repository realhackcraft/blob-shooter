import { globalCtx } from "../helper";

export class Entity {
  x: number;
  y: number;
  lastPos: { x: number; y: number };
  radius: number;
  color: string;
  alpha: number;

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    alpha: number,
  ) {
    this.x = x;
    this.y = y;
    this.lastPos = { x, y };
    this.radius = radius;
    this.color = color;
    this.alpha = alpha;
  }

  draw(interp = 0) {
    globalCtx.beginPath();
    globalCtx.arc(
      this.lastPos.x + (this.x - this.lastPos.x) * interp,
      this.lastPos.y + (this.y - this.lastPos.y) * interp,
      this.radius,
      0,
      Math.PI * 2,
    );
    globalCtx.fillStyle = this.color;
    globalCtx.closePath();
    globalCtx.fill();
  }
}
