export type ScoreLabel = {
  x: number;
  y: number;
  lastY: number;
  score: number;
  life: number;
};

export enum PowerUpVariant {
  Blank,
  Random,
  RapidFire = "rapid_fire",
  BulletSize = "bullet_size",
  ShootBackwards = "shoot_backwards",
}
