export class World {
  readonly width: number;
  readonly height: number;
  public gravity: number;
  public friction: number;
  public skyColor: number;
  public time: number;

  constructor({ width, height, gravity, friction, skyColor }) {
    this.width = width;
    this.height = height;
    this.gravity = gravity;
    this.friction = friction;
    this.skyColor = skyColor;
    this.time = 0;
  }
}
