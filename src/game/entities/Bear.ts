import { Creature } from './Creature';
import { EntityType, EntityState } from '../../types/entityTypes';
import { Camera } from '../core/Camera';
import { GAME_CONFIG } from '../../constants/gameConfig';

export class Bear extends Creature {
  constructor(id: string, x: number, y: number) {
    const state: EntityState = {
      id,
      type: EntityType.BEAR,
      position: { x, y },
      velocity: { x: 0, y: 0 },
      health: GAME_CONFIG.CREATURES.BEAR.HEALTH,
      maxHealth: GAME_CONFIG.CREATURES.BEAR.HEALTH,
      radius: GAME_CONFIG.CREATURES.BEAR.RADIUS,
      isActive: true,
      direction: 0,
    };

    super(state, {
      detectionRadius: GAME_CONFIG.CREATURES.BEAR.DETECTION_RADIUS,
      attackRadius: GAME_CONFIG.CREATURES.BEAR.ATTACK_RADIUS,
      attackCooldown: GAME_CONFIG.CREATURES.BEAR.ATTACK_COOLDOWN,
      attackDamage: GAME_CONFIG.CREATURES.BEAR.DAMAGE,
      speed: GAME_CONFIG.CREATURES.BEAR.SPEED,
    });
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screenPos = camera.worldToScreen(this.position);

    // Draw bear body
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw ears
    ctx.beginPath();
    ctx.arc(screenPos.x - this.radius * 0.6, screenPos.y - this.radius * 0.6, this.radius * 0.3, 0, Math.PI * 2);
    ctx.arc(screenPos.x + this.radius * 0.6, screenPos.y - this.radius * 0.6, this.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Draw eyes
    ctx.fillStyle = '#FF0000';
    const eyeOffset = this.radius * 0.4;
    ctx.beginPath();
    ctx.arc(screenPos.x - eyeOffset / 2, screenPos.y - eyeOffset / 2, 3, 0, Math.PI * 2);
    ctx.arc(screenPos.x + eyeOffset / 2, screenPos.y - eyeOffset / 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
