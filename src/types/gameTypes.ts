import { EntityState } from './entityTypes';

export interface Vector2D {
  x: number;
  y: number;
}

export interface GameState {
  id: string;
  lastSaved: number;
  player: PlayerState;
  world: WorldState;
  dayNightCycle: DayNightState;
  entities: EntityState[];
  inventory: InventoryState;
  statistics: GameStatistics;
  gameOver: boolean;
  victory: boolean;
}

export interface PlayerState {
  position: Vector2D;
  health: number;
  maxHealth: number;
  speed: number;
  direction: number; // radians
  isMoving: boolean;
  hasFlashlight: boolean;
  flashlightActive: boolean;
  flashlightFuel: number;
  maxFlashlightFuel: number;
}

export interface DayNightState {
  currentDay: number;
  timeOfDay: number; // 0-1 (0 = midnight, 0.5 = noon)
  isNight: boolean;
  totalDaysPassed: number;
}

export interface WorldState {
  seed: number;
  width: number;
  height: number;
  campfirePosition: Vector2D | null;
  childrenPositions: Vector2D[];
  childrenRescued: boolean[];
}

export interface InventoryState {
  items: { [key: string]: number };
  maxSlots: number;
  equippedWeapon: string | null;
}

export interface GameStatistics {
  creaturesKilled: number;
  resourcesGathered: number;
  itemsCrafted: number;
  distanceTraveled: number;
  damageDealt: number;
  damageTaken: number;
}
