import { ItemType } from '../types/itemTypes';

export const GAME_CONFIG = {
  WORLD: {
    WIDTH: 5000,
    HEIGHT: 5000,
    TILE_SIZE: 50,
  },

  PLAYER: {
    MAX_HEALTH: 100,
    BASE_SPEED: 150, // pixels per second
    SPRINT_MULTIPLIER: 1.5,
    RADIUS: 20,
    FLASHLIGHT_RADIUS: 200,
    FLASHLIGHT_MAX_FUEL: 100,
    FLASHLIGHT_DRAIN_RATE: 5, // per second
    STARTING_ITEMS: {
      [ItemType.WOOD]: 5,
      [ItemType.FOOD]: 3,
    },
  },

  DAY_NIGHT: {
    TOTAL_NIGHTS: 99,
    DAY_LENGTH: 120, // seconds
    NIGHT_LENGTH: 60, // seconds
    DAWN_TIME: 0.8, // when night ends (0-1)
    DUSK_TIME: 0.2, // when night starts (0-1)
  },

  CAMPFIRE: {
    SAFE_RADIUS: 300,
    LIGHT_RADIUS: 400,
    WOOD_COST: 10,
    METAL_COST: 5,
    RADIUS: 30,
  },

  CREATURES: {
    WOLF: {
      HEALTH: 30,
      SPEED: 120,
      DAMAGE: 15,
      DETECTION_RADIUS: 400,
      ATTACK_RADIUS: 50,
      ATTACK_COOLDOWN: 2,
      RADIUS: 15,
    },
    BEAR: {
      HEALTH: 60,
      SPEED: 80,
      DAMAGE: 30,
      DETECTION_RADIUS: 350,
      ATTACK_RADIUS: 70,
      ATTACK_COOLDOWN: 3,
      RADIUS: 25,
    },
    FOX: {
      HEALTH: 20,
      SPEED: 160,
      DAMAGE: 10,
      DETECTION_RADIUS: 300,
      ATTACK_RADIUS: 40,
      ATTACK_COOLDOWN: 1.5,
      RADIUS: 12,
    },
  },

  MONSTERS: {
    DEER: {
      HEALTH: 999, // Cannot be killed
      SPEED: 200,
      DAMAGE: 50,
      DETECTION_RADIUS: 600,
      LIGHT_FLEE_RADIUS: 250,
      RADIUS: 30,
    },
    OWL: {
      HEALTH: 999,
      SPEED: 180,
      DAMAGE: 60,
      DETECTION_RADIUS: 500,
      LIGHT_FLEE_RADIUS: 250,
      MOVEMENT_DETECTION_RADIUS: 400,
      STATIONARY_INVISIBLE_TIME: 2, // seconds
      RADIUS: 25,
    },
  },

  CHILD: {
    RADIUS: 15,
    INTERACTION_RADIUS: 60,
  },

  RESOURCES: {
    SPAWN_INTERVAL: 10, // seconds
    MAX_RESOURCES: 50,
    COLLECTION_RADIUS: 60,
    RADIUS: 10,
  },

  RENDERING: {
    TARGET_FPS: 60,
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,
  },
};

export const CONTROLS = {
  MOVE_UP: 'w',
  MOVE_DOWN: 's',
  MOVE_LEFT: 'a',
  MOVE_RIGHT: 'd',
  SPRINT: 'Shift',
  INTERACT: 'e',
  TOGGLE_FLASHLIGHT: 'f',
  USE_FOOD: 'q',
  ATTACK: 'mouse0',
  OPEN_INVENTORY: 'i',
  OPEN_CRAFTING: 'c',
  PAUSE: 'Escape',
};
