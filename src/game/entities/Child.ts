import { Entity } from './Entity';
import { GameState } from '../../types/gameTypes';
import { EntityType, EntityState } from '../../types/entityTypes';
import { Camera } from '../core/Camera';
import { GAME_CONFIG } from '../../constants/gameConfig';

export class Child extends Entity {
  private isRescued: boolean;

  constructor(id: string, x: number, y: number) {
    const state: EntityState = {
      id,
      type: EntityType.CHILD,
      position: { x, y },
      velocity: { x: 0, y: 0 },
      health: 1,
      maxHealth: 1,
      radius: GAME_CONFIG.CHILD.RADIUS,
      isActive: true,
      direction: 0,
      metadata: { isRescued: false },
    };

    super(state);
    this.isRescued = false;
  }

  update(_deltaTime: number, _gameState: GameState): void {
    // Child is static, no update needed
  }

  public rescue(): void {
    this.isRescued = true;
    this.metadata.isRescued = true;
    this.isActive = false;
  }

  public getRescued(): boolean {
    return this.isRescued;
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    if (this.isRescued) return;

    const screenPos = camera.worldToScreen(this.position);

    // Draw interaction radius (pulsing)
    const pulse = 0.8 + Math.sin(Date.now() / 500) * 0.2;
    ctx.strokeStyle = `rgba(100, 200, 255, ${pulse * 0.3})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, GAME_CONFIG.CHILD.INTERACTION_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    // Draw child
    ctx.fillStyle = '#00BFFF';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw "!" indicator
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', screenPos.x, screenPos.y - this.radius - 15);
  }
}
