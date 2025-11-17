import { Vector2D, GameState } from '../../types/gameTypes';
import { EntityState, EntityType } from '../../types/entityTypes';
import { Camera } from '../core/Camera';
import { distance } from '../../utils/math';

export abstract class Entity {
  public id: string;
  public type: EntityType;
  public position: Vector2D;
  public velocity: Vector2D;
  public radius: number;
  public health: number;
  public maxHealth: number;
  public isActive: boolean;
  public direction: number;
  public metadata: any;

  constructor(state: EntityState) {
    this.id = state.id;
    this.type = state.type;
    this.position = { ...state.position };
    this.velocity = { ...state.velocity };
    this.radius = state.radius;
    this.health = state.health;
    this.maxHealth = state.maxHealth;
    this.isActive = state.isActive;
    this.direction = state.direction;
    this.metadata = state.metadata || {};
  }

  abstract update(deltaTime: number, gameState: GameState): void;
  abstract render(ctx: CanvasRenderingContext2D, camera: Camera): void;

  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.onDeath();
    }
  }

  protected onDeath(): void {
    this.isActive = false;
  }

  public distanceTo(other: Entity | Vector2D): number {
    const target = 'position' in other ? other.position : other;
    return distance(this.position, target);
  }

  public getState(): EntityState {
    return {
      id: this.id,
      type: this.type,
      position: { ...this.position },
      velocity: { ...this.velocity },
      health: this.health,
      maxHealth: this.maxHealth,
      radius: this.radius,
      isActive: this.isActive,
      direction: this.direction,
      metadata: this.metadata,
    };
  }
}
