import { Vector2D } from '../../types/gameTypes';

export class CollisionSystem {
  static checkCircleCollision(
    pos1: Vector2D,
    radius1: number,
    pos2: Vector2D,
    radius2: number
  ): boolean {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius1 + radius2;
  }

  static resolveCollision(
    pos1: Vector2D,
    radius1: number,
    pos2: Vector2D,
    radius2: number
  ): { pos1: Vector2D; pos2: Vector2D } {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const overlap = radius1 + radius2 - distance;

    if (overlap > 0 && distance > 0) {
      const nx = dx / distance;
      const ny = dy / distance;

      return {
        pos1: {
          x: pos1.x - nx * overlap * 0.5,
          y: pos1.y - ny * overlap * 0.5,
        },
        pos2: {
          x: pos2.x + nx * overlap * 0.5,
          y: pos2.y + ny * overlap * 0.5,
        },
      };
    }

    return { pos1, pos2 };
  }

  static clampToWorld(
    position: Vector2D,
    radius: number,
    worldWidth: number,
    worldHeight: number
  ): Vector2D {
    return {
      x: Math.max(radius, Math.min(worldWidth - radius, position.x)),
      y: Math.max(radius, Math.min(worldHeight - radius, position.y)),
    };
  }

  static pointInCircle(point: Vector2D, center: Vector2D, radius: number): boolean {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return dx * dx + dy * dy <= radius * radius;
  }
}
