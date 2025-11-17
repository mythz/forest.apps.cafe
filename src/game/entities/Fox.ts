import { Creature } from './Creature';
import { EntityType, EntityState } from '../../types/entityTypes';
import { Camera } from '../core/Camera';
import { GAME_CONFIG } from '../../constants/gameConfig';

export class Fox extends Creature {
  constructor(id: string, x: number, y: number) {
    const state: EntityState = {
      id,
      type: EntityType.FOX,
      position: { x, y },
      velocity: { x: 0, y: 0 },
      health: GAME_CONFIG.CREATURES.FOX.HEALTH,
      maxHealth: GAME_CONFIG.CREATURES.FOX.HEALTH,
      radius: GAME_CONFIG.CREATURES.FOX.RADIUS,
      isActive: true,
      direction: 0,
    };

    super(state, {
      detectionRadius: GAME_CONFIG.CREATURES.FOX.DETECTION_RADIUS,
      attackRadius: GAME_CONFIG.CREATURES.FOX.ATTACK_RADIUS,
      attackCooldown: GAME_CONFIG.CREATURES.FOX.ATTACK_COOLDOWN,
      attackDamage: GAME_CONFIG.CREATURES.FOX.DAMAGE,
      speed: GAME_CONFIG.CREATURES.FOX.SPEED,
    });
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screenPos = camera.worldToScreen(this.position);

    // Draw fox body
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw tail
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.arc(screenPos.x - this.radius * 1.2, screenPos.y, this.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Draw eyes
    ctx.fillStyle = '#FFFF00';
    const eyeOffset = this.radius * 0.4;
    ctx.beginPath();
    ctx.arc(screenPos.x - eyeOffset / 2, screenPos.y - eyeOffset / 2, 2, 0, Math.PI * 2);
    ctx.arc(screenPos.x + eyeOffset / 2, screenPos.y - eyeOffset / 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
