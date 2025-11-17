import { Vector2D } from '../../types/gameTypes';

export class Camera {
  private position: Vector2D;
  private worldWidth: number;
  private worldHeight: number;
  private viewportWidth: number;
  private viewportHeight: number;
  private smoothing: number = 0.1;

  constructor(
    worldWidth: number,
    worldHeight: number,
    viewportWidth: number,
    viewportHeight: number
  ) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.position = {
      x: worldWidth / 2,
      y: worldHeight / 2,
    };
  }

  public follow(target: Vector2D): void {
    this.position.x += (target.x - this.position.x) * this.smoothing;
    this.position.y += (target.y - this.position.y) * this.smoothing;
    this.clampToWorld();
  }

  public worldToScreen(worldPos: Vector2D): Vector2D {
    return {
      x: worldPos.x - this.position.x + this.viewportWidth / 2,
      y: worldPos.y - this.position.y + this.viewportHeight / 2,
    };
  }

  public screenToWorld(screenPos: Vector2D): Vector2D {
    return {
      x: screenPos.x + this.position.x - this.viewportWidth / 2,
      y: screenPos.y + this.position.y - this.viewportHeight / 2,
    };
  }

  private clampToWorld(): void {
    const halfViewWidth = this.viewportWidth / 2;
    const halfViewHeight = this.viewportHeight / 2;

    this.position.x = Math.max(halfViewWidth, Math.min(this.worldWidth - halfViewWidth, this.position.x));
    this.position.y = Math.max(halfViewHeight, Math.min(this.worldHeight - halfViewHeight, this.position.y));
  }

  public getPosition(): Vector2D {
    return { ...this.position };
  }

  public isVisible(worldPos: Vector2D, padding: number = 100): boolean {
    const screenPos = this.worldToScreen(worldPos);
    return (
      screenPos.x >= -padding &&
      screenPos.x <= this.viewportWidth + padding &&
      screenPos.y >= -padding &&
      screenPos.y <= this.viewportHeight + padding
    );
  }
}
