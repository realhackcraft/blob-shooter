import { Particle } from "./Particle";

export class BackgroundParticle extends Particle {
  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    alpha = 0.1,
  ) {
    super(x, y, radius, color, { x: 0, y: 0 }, 0);
    this.alpha = alpha;
  }
}
