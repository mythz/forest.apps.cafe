import { Entity } from './Entity';
import { GameState } from '../../types/gameTypes';
import { EntityType, EntityState } from '../../types/entityTypes';
import { Camera } from '../core/Camera';
import { LightingSystem } from '../systems/LightingSystem';
import { AISystem } from '../systems/AISystem';
import { GAME_CONFIG } from '../../constants/gameConfig';

export class Owl extends Entity {
  private speed: number;
  private attackDamage: number;
  private detectionRadius: number;
  private lightFleeRadius: number;
  private stationaryTime: number = 0;
  private lastPlayerPos: { x: number; y: number } | null = null;
  private isInvisible: boolean = false;
  private wanderAngle: number = Math.random() * Math.PI * 2;

  constructor(id: string, x: number, y: number) {
    const state: EntityState = {
      id,
      type: EntityType.OWL_MONSTER,
      position: { x, y },
      velocity: { x: 0, y: 0 },
      health: GAME_CONFIG.MONSTERS.OWL.HEALTH,
      maxHealth: GAME_CONFIG.MONSTERS.OWL.HEALTH,
      radius: GAME_CONFIG.MONSTERS.OWL.RADIUS,
      isActive: true,
      direction: 0,
    };

    super(state);

    this.speed = GAME_CONFIG.MONSTERS.OWL.SPEED;
    this.attackDamage = GAME_CONFIG.MONSTERS.OWL.DAMAGE;
    this.detectionRadius = GAME_CONFIG.MONSTERS.OWL.DETECTION_RADIUS;
    this.lightFleeRadius = GAME_CONFIG.MONSTERS.OWL.LIGHT_FLEE_RADIUS;
  }

  update(deltaTime: number, gameState: GameState): void {
    // Owl monster only active at night
    if (!gameState.dayNightCycle.isNight) {
      return;
    }

    const playerPos = gameState.player.position;
    const lightingSystem = new LightingSystem();
    lightingSystem.update(gameState);

    // Check if player is in light
    const isPlayerInLight = lightingSystem.isInLight(playerPos);
    const isNearLight = this.isNearAnyLight(lightingSystem);

    // Owl flees from light
    if (isNearLight) {
      const nearestLight = this.findNearestLight(lightingSystem);
      if (nearestLight) {
        this.velocity = AISystem.updateFleeAI(
          this.position,
          nearestLight.position,
          this.speed,
          deltaTime
        );
        this.isInvisible = false;
        this.stationaryTime = 0;
      }
    } else {
      // Check if player moved
      const playerMoved = this.hasPlayerMoved(playerPos);

      if (playerMoved) {
        this.stationaryTime = 0;
        this.isInvisible = false;
      } else {
        this.stationaryTime += deltaTime;
        if (this.stationaryTime >= GAME_CONFIG.MONSTERS.OWL.STATIONARY_INVISIBLE_TIME) {
          this.isInvisible = true;
        }
      }

      // Only chase if player is moving or close
      const distToPlayer = this.distanceTo(playerPos);

      if (!isPlayerInLight && (playerMoved || distToPlayer <= this.detectionRadius)) {
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

    this.lastPlayerPos = { ...playerPos };
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  private hasPlayerMoved(currentPos: { x: number; y: number }): boolean {
    if (!this.lastPlayerPos) return true;

    const dx = currentPos.x - this.lastPlayerPos.x;
    const dy = currentPos.y - this.lastPlayerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance > 1; // Threshold for movement
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

  public isCurrentlyInvisible(): boolean {
    return this.isInvisible;
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    if (this.isInvisible) return; // Don't render when invisible

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
    gradient.addColorStop(0, 'rgba(0, 100, 100, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 100, 100, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw owl body
    ctx.fillStyle = '#2F4F4F';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw wings
    ctx.fillStyle = '#1C1C1C';
    ctx.beginPath();
    ctx.ellipse(screenPos.x - this.radius, screenPos.y, this.radius * 0.7, this.radius * 0.4, 0, 0, Math.PI * 2);
    ctx.ellipse(screenPos.x + this.radius, screenPos.y, this.radius * 0.7, this.radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw glowing eyes
    ctx.fillStyle = '#00FFFF';
    const eyeOffset = this.radius * 0.3;
    ctx.beginPath();
    ctx.arc(screenPos.x - eyeOffset, screenPos.y - eyeOffset / 2, 5, 0, Math.PI * 2);
    ctx.arc(screenPos.x + eyeOffset, screenPos.y - eyeOffset / 2, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}
