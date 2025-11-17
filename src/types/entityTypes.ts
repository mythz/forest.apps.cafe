import { Vector2D } from './gameTypes';

export enum EntityType {
  PLAYER = 'player',
  WOLF = 'wolf',
  BEAR = 'bear',
  FOX = 'fox',
  DEER_MONSTER = 'deer_monster',
  OWL_MONSTER = 'owl_monster',
  CHILD = 'child',
  CAMPFIRE = 'campfire',
  RESOURCE = 'resource',
}

export interface EntityState {
  id: string;
  type: EntityType;
  position: Vector2D;
  velocity: Vector2D;
  health: number;
  maxHealth: number;
  radius: number;
  isActive: boolean;
  direction: number;
  metadata?: any; // Entity-specific data
}

export interface CreatureAI {
  state: AIState;
  target: Vector2D | null;
  wanderAngle: number;
  detectionRadius: number;
  attackRadius: number;
  attackCooldown: number;
  lastAttackTime: number;
}

export enum AIState {
  IDLE = 'idle',
  WANDER = 'wander',
  CHASE = 'chase',
  ATTACK = 'attack',
  FLEE = 'flee',
}
