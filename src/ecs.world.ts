export class World {
  public width: number;
  public height: number;
  public gravity: number;
  public friction: number;
  public skyColor: number;

  constructor({ width, height, gravity, friction, skyColor }) {
    this.width = width;
    this.height = height;
    this.gravity = gravity;
    this.friction = friction;
    this.skyColor = skyColor;
  }
}
