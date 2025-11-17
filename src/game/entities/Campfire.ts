import { Entity } from './Entity';
import { GameState } from '../../types/gameTypes';
import { EntityType, EntityState } from '../../types/entityTypes';
import { Camera } from '../core/Camera';
import { GAME_CONFIG } from '../../constants/gameConfig';

export class Campfire extends Entity {
  constructor(id: string, x: number, y: number) {
    const state: EntityState = {
      id,
      type: EntityType.CAMPFIRE,
      position: { x, y },
      velocity: { x: 0, y: 0 },
      health: 1,
      maxHealth: 1,
      radius: GAME_CONFIG.CAMPFIRE.RADIUS,
      isActive: true,
      direction: 0,
    };

    super(state);
  }

  update(_deltaTime: number, _gameState: GameState): void {
    // Campfire is static, no update needed
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screenPos = camera.worldToScreen(this.position);

    // Draw safe zone (semi-transparent circle)
    ctx.fillStyle = 'rgba(255, 200, 100, 0.1)';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, GAME_CONFIG.CAMPFIRE.SAFE_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Draw light glow
    const gradient = ctx.createRadialGradient(
      screenPos.x,
      screenPos.y,
      0,
      screenPos.x,
      screenPos.y,
      GAME_CONFIG.CAMPFIRE.LIGHT_RADIUS
    );
    gradient.addColorStop(0, 'rgba(255, 150, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 150, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, GAME_CONFIG.CAMPFIRE.LIGHT_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Draw campfire
    ctx.fillStyle = '#FF6600';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw inner fire
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}
