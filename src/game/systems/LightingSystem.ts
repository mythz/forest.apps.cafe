import { Vector2D, GameState } from '../../types/gameTypes';
import { GAME_CONFIG } from '../../constants/gameConfig';
import { CollisionSystem } from '../core/Collision';

export interface LightSource {
  position: Vector2D;
  radius: number;
  intensity: number;
}

export class LightingSystem {
  private lightSources: LightSource[] = [];

  public update(gameState: GameState): void {
    this.lightSources = [];

    // Add campfire light
    if (gameState.world.campfirePosition) {
      this.lightSources.push({
        position: gameState.world.campfirePosition,
        radius: GAME_CONFIG.CAMPFIRE.LIGHT_RADIUS,
        intensity: 1,
      });
    }

    // Add flashlight light
    if (gameState.player.flashlightActive) {
      this.lightSources.push({
        position: gameState.player.position,
        radius: GAME_CONFIG.PLAYER.FLASHLIGHT_RADIUS,
        intensity: 0.8,
      });
    }
  }

  public isInLight(position: Vector2D): boolean {
    for (const light of this.lightSources) {
      if (CollisionSystem.pointInCircle(position, light.position, light.radius)) {
        return true;
      }
    }
    return false;
  }

  public getLightSources(): LightSource[] {
    return [...this.lightSources];
  }

  public getLightIntensity(position: Vector2D): number {
    let maxIntensity = 0;

    for (const light of this.lightSources) {
      const dx = position.x - light.position.x;
      const dy = position.y - light.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < light.radius) {
        const intensity = light.intensity * (1 - distance / light.radius);
        maxIntensity = Math.max(maxIntensity, intensity);
      }
    }

    return maxIntensity;
  }
}
