import { Entity } from './Entity';
import { GameState } from '../../types/gameTypes';
import { EntityType, EntityState } from '../../types/entityTypes';
import { Camera } from '../core/Camera';
import { AISystem } from '../systems/AISystem';
import { LightingSystem } from '../systems/LightingSystem';
import { GAME_CONFIG } from '../../constants/gameConfig';

export class Deer extends Entity {
  private speed: number;
  private attackDamage: number;
  private detectionRadius: number;
  private lightFleeRadius: number;
  private wanderAngle: number = Math.random() * Math.PI * 2;

  constructor(id: string, x: number, y: number) {
    const state: EntityState = {
      id,
      type: EntityType.DEER_MONSTER,
      position: { x, y },
      velocity: { x: 0, y: 0 },
      health: GAME_CONFIG.MONSTERS.DEER.HEALTH,
      maxHealth: GAME_CONFIG.MONSTERS.DEER.HEALTH,
      radius: GAME_CONFIG.MONSTERS.DEER.RADIUS,
      isActive: true,
      direction: 0,
    };

    super(state);

    this.speed = GAME_CONFIG.MONSTERS.DEER.SPEED;
    this.attackDamage = GAME_CONFIG.MONSTERS.DEER.DAMAGE;
    this.detectionRadius = GAME_CONFIG.MONSTERS.DEER.DETECTION_RADIUS;
    this.lightFleeRadius = GAME_CONFIG.MONSTERS.DEER.LIGHT_FLEE_RADIUS;
  }

  update(deltaTime: number, gameState: GameState): void {
    // Deer monster only active at night
    if (!gameState.dayNightCycle.isNight) {
      return;
    }

    const playerPos = gameState.player.position;
    const lightingSystem = new LightingSystem();
    lightingSystem.update(gameState);

    // Check if player is in light
    const isPlayerInLight = lightingSystem.isInLight(playerPos);
    const isNearLight = this.isNearAnyLight(lightingSystem);

    // Deer flees from light sources
    if (isNearLight) {
      const nearestLight = this.findNearestLight(lightingSystem);
      if (nearestLight) {
        this.velocity = AISystem.updateFleeAI(
          this.position,
          nearestLight.position,
          this.speed,
          deltaTime
        );
      }
    } else {
      // Chase player if detected and not in light
      const distToPlayer = this.distanceTo(playerPos);

      if (distToPlayer <= this.detectionRadius && !isPlayerInLight) {
        this.velocity = AISystem.updateChaseAI(this.position, playerPos, this.speed, deltaTime);
        this.direction = Math.atan2(playerPos.y - this.position.y, playerPos.x - this.position.x);
      } else {
        // Wander
        if (Math.random() < 0.02) {
          this.wanderAngle = Math.random() * Math.PI * 2;
        }
        this.velocity = {
          x: Math.cos(this.wanderAngle) * this.speed * deltaTime,
          y: Math.sin(this.wanderAngle) * this.speed * deltaTime,
        };
      }
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  private isNearAnyLight(lightingSystem: LightingSystem): boolean {
    for (const light of lightingSystem.getLightSources()) {
      if (this.distanceTo(light.position) <= this.lightFleeRadius) {
        return true;
      }
    }
    return false;
  }

  private findNearestLight(lightingSystem: LightingSystem) {
    const lights = lightingSystem.getLightSources();
    if (lights.length === 0) return null;

    let nearest = lights[0];
    let minDist = this.distanceTo(nearest.position);

    for (const light of lights) {
      const dist = this.distanceTo(light.position);
      if (dist < minDist) {
        minDist = dist;
        nearest = light;
      }
    }

    return nearest;
  }

  public getAttackDamage(): number {
    return this.attackDamage;
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screenPos = camera.worldToScreen(this.position);

    // Draw ominous glow
    const gradient = ctx.createRadialGradient(
      screenPos.x,
      screenPos.y,
      0,
      screenPos.x,
      screenPos.y,
      this.radius * 2
    );
    gradient.addColorStop(0, 'rgba(100, 0, 100, 0.5)');
    gradient.addColorStop(1, 'rgba(100, 0, 100, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw deer body
    ctx.fillStyle = '#4B0082';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw antlers
    ctx.strokeStyle = '#8B008B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - this.radius * 0.5, screenPos.y - this.radius);
    ctx.lineTo(screenPos.x - this.radius * 0.3, screenPos.y - this.radius * 1.5);
    ctx.moveTo(screenPos.x + this.radius * 0.5, screenPos.y - this.radius);
    ctx.lineTo(screenPos.x + this.radius * 0.3, screenPos.y - this.radius * 1.5);
    ctx.stroke();

    // Draw glowing eyes
    ctx.fillStyle = '#FF00FF';
    const eyeOffset = this.radius * 0.4;
    ctx.beginPath();
    ctx.arc(screenPos.x - eyeOffset / 2, screenPos.y - eyeOffset / 2, 4, 0, Math.PI * 2);
    ctx.arc(screenPos.x + eyeOffset / 2, screenPos.y - eyeOffset / 2, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
