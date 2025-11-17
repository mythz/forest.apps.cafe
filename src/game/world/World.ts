import { Vector2D, WorldState } from '../../types/gameTypes';
import { SeededRandom } from '../../utils/random';
import { GAME_CONFIG } from '../../constants/gameConfig';

export class World {
  private state: WorldState;
  private random: SeededRandom;

  constructor(seed: number) {
    this.random = new SeededRandom(seed);

    this.state = {
      seed,
      width: GAME_CONFIG.WORLD.WIDTH,
      height: GAME_CONFIG.WORLD.HEIGHT,
      campfirePosition: null,
      childrenPositions: this.generateChildrenPositions(),
      childrenRescued: [false, false, false, false],
    };
  }

  private generateChildrenPositions(): Vector2D[] {
    const positions: Vector2D[] = [];
    const centerX = this.state.width / 2;
    const centerY = this.state.height / 2;
    const minDistance = 500; // Minimum distance from center and from each other

    for (let i = 0; i < 4; i++) {
      let attempts = 0;
      let position: Vector2D;

      do {
        position = {
          x: this.random.range(200, this.state.width - 200),
          y: this.random.range(200, this.state.height - 200),
        };

        attempts++;
        if (attempts > 100) break; // Prevent infinite loop
      } while (
        !this.isValidChildPosition(position, centerX, centerY, positions, minDistance)
      );

      positions.push(position);
    }

    return positions;
  }

  private isValidChildPosition(
    pos: Vector2D,
    centerX: number,
    centerY: number,
    existingPositions: Vector2D[],
    minDistance: number
  ): boolean {
    // Check distance from center
    const distFromCenter = Math.sqrt(
      (pos.x - centerX) ** 2 + (pos.y - centerY) ** 2
    );
    if (distFromCenter < minDistance) return false;

    // Check distance from other children
    for (const existing of existingPositions) {
      const dist = Math.sqrt(
        (pos.x - existing.x) ** 2 + (pos.y - existing.y) ** 2
      );
      if (dist < minDistance) return false;
    }

    return true;
  }

  public placeCampfire(position: Vector2D): void {
    this.state.campfirePosition = { ...position };
  }

  public rescueChild(index: number): void {
    if (index >= 0 && index < 4) {
      this.state.childrenRescued[index] = true;
    }
  }

  public areAllChildrenRescued(): boolean {
    return this.state.childrenRescued.every((rescued) => rescued);
  }

  public getState(): WorldState {
    return {
      ...this.state,
      campfirePosition: this.state.campfirePosition
        ? { ...this.state.campfirePosition }
        : null,
      childrenPositions: [...this.state.childrenPositions],
      childrenRescued: [...this.state.childrenRescued],
    };
  }

  public getStartPosition(): Vector2D {
    return {
      x: this.state.width / 2,
      y: this.state.height / 2,
    };
  }
}
