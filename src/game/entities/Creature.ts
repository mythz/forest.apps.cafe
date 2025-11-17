import { Entity } from './Entity';
import { GameState } from '../../types/gameTypes';
import { EntityState, CreatureAI, AIState } from '../../types/entityTypes';
import { Camera } from '../core/Camera';
import { AISystem } from '../systems/AISystem';
import { LightingSystem } from '../systems/LightingSystem';

export abstract class Creature extends Entity {
  protected ai: CreatureAI;
  protected attackDamage: number;
  protected speed: number;

  constructor(state: EntityState, config: {
    detectionRadius: number;
    attackRadius: number;
    attackCooldown: number;
    attackDamage: number;
    speed: number;
  }) {
    super(state);

    this.ai = {
      state: AIState.WANDER,
      target: null,
      wanderAngle: Math.random() * Math.PI * 2,
      detectionRadius: config.detectionRadius,
      attackRadius: config.attackRadius,
      attackCooldown: config.attackCooldown,
      lastAttackTime: 0,
    };

    this.attackDamage = config.attackDamage;
    this.speed = config.speed;
  }

  update(deltaTime: number, gameState: GameState): void {
    // Creatures only active at night
    if (!gameState.dayNightCycle.isNight) {
      return;
    }

    this.updateAI(deltaTime, gameState);
    this.applyMovement(deltaTime);
  }

  protected updateAI(deltaTime: number, gameState: GameState): void {
    const playerPos = gameState.player.position;
    const lightingSystem = new LightingSystem();
    lightingSystem.update(gameState);
    const isPlayerInLight = lightingSystem.isInLight(playerPos);

    // Determine AI state
    this.ai.state = AISystem.determineState(
      this.ai,
      this.position,
      playerPos,
      isPlayerInLight,
      false // Regular creatures don't avoid light
    );

    // Update based on state
    switch (this.ai.state) {
      case AIState.WANDER:
        this.velocity = AISystem.updateWanderAI(this.ai, this.position, this.speed, deltaTime);
        break;

      case AIState.CHASE:
        this.ai.target = playerPos;
        this.velocity = AISystem.updateChaseAI(this.position, playerPos, this.speed, deltaTime);
        this.direction = Math.atan2(playerPos.y - this.position.y, playerPos.x - this.position.x);
        break;

      case AIState.ATTACK:
        this.velocity = { x: 0, y: 0 };
        if (AISystem.shouldAttack(this.ai, this.position, playerPos, Date.now())) {
          this.attack(gameState);
          this.ai.lastAttackTime = Date.now();
        }
        break;

      default:
        break;
    }
  }

  protected applyMovement(_deltaTime: number): void {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  protected attack(_gameState: GameState): void {
    // Attack is handled externally by checking collision with player
  }

  public getAttackDamage(): number {
    return this.attackDamage;
  }

  public isAttacking(): boolean {
    return this.ai.state === AIState.ATTACK;
  }

  abstract render(ctx: CanvasRenderingContext2D, camera: Camera): void;
}
