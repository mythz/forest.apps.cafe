import { Creature } from './Creature';
import { EntityType, EntityState } from '../../types/entityTypes';
import { Camera } from '../core/Camera';
import { GAME_CONFIG } from '../../constants/gameConfig';

export class Wolf extends Creature {
  constructor(id: string, x: number, y: number) {
    const state: EntityState = {
      id,
      type: EntityType.WOLF,
      position: { x, y },
      velocity: { x: 0, y: 0 },
      health: GAME_CONFIG.CREATURES.WOLF.HEALTH,
      maxHealth: GAME_CONFIG.CREATURES.WOLF.HEALTH,
      radius: GAME_CONFIG.CREATURES.WOLF.RADIUS,
      isActive: true,
      direction: 0,
    };

    super(state, {
      detectionRadius: GAME_CONFIG.CREATURES.WOLF.DETECTION_RADIUS,
      attackRadius: GAME_CONFIG.CREATURES.WOLF.ATTACK_RADIUS,
      attackCooldown: GAME_CONFIG.CREATURES.WOLF.ATTACK_COOLDOWN,
      attackDamage: GAME_CONFIG.CREATURES.WOLF.DAMAGE,
      speed: GAME_CONFIG.CREATURES.WOLF.SPEED,
    });
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screenPos = camera.worldToScreen(this.position);

    // Draw wolf body
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw eyes
    ctx.fillStyle = '#FF0000';
    const eyeOffset = this.radius * 0.4;
    ctx.beginPath();
    ctx.arc(screenPos.x - eyeOffset / 2, screenPos.y - eyeOffset / 2, 2, 0, Math.PI * 2);
    ctx.arc(screenPos.x + eyeOffset / 2, screenPos.y - eyeOffset / 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
