import { GameState } from '../types/gameTypes';
import { ItemType } from '../types/itemTypes';
import { IndexedDBManager } from './IndexedDBManager';
import { GAME_CONFIG } from '../constants/gameConfig';
import { generateSeed } from '../utils/random';

export class SaveSystem {
  private dbManager: IndexedDBManager;

  constructor(dbManager: IndexedDBManager) {
    this.dbManager = dbManager;
  }

  createNewGame(): GameState {
    const seed = generateSeed();
    const worldWidth = GAME_CONFIG.WORLD.WIDTH;
    const worldHeight = GAME_CONFIG.WORLD.HEIGHT;

    return {
      id: `save_${Date.now()}`,
      lastSaved: Date.now(),
      player: {
        position: { x: worldWidth / 2, y: worldHeight / 2 },
        health: GAME_CONFIG.PLAYER.MAX_HEALTH,
        maxHealth: GAME_CONFIG.PLAYER.MAX_HEALTH,
        speed: GAME_CONFIG.PLAYER.BASE_SPEED,
        direction: 0,
        isMoving: false,
        hasFlashlight: false,
        flashlightActive: false,
        flashlightFuel: 0,
        maxFlashlightFuel: GAME_CONFIG.PLAYER.FLASHLIGHT_MAX_FUEL,
      },
      world: {
        seed,
        width: worldWidth,
        height: worldHeight,
        campfirePosition: null,
        childrenPositions: [],
        childrenRescued: [false, false, false, false],
      },
      dayNightCycle: {
        currentDay: 1,
        timeOfDay: 0.5,
        isNight: false,
        totalDaysPassed: 0,
      },
      entities: [],
      inventory: {
        items: {
          [ItemType.WOOD]: GAME_CONFIG.PLAYER.STARTING_ITEMS[ItemType.WOOD],
          [ItemType.FOOD]: GAME_CONFIG.PLAYER.STARTING_ITEMS[ItemType.FOOD],
        },
        maxSlots: 20,
        equippedWeapon: null,
      },
      statistics: {
        creaturesKilled: 0,
        resourcesGathered: 0,
        itemsCrafted: 0,
        distanceTraveled: 0,
        damageDealt: 0,
        damageTaken: 0,
      },
      gameOver: false,
      victory: false,
    };
  }

  async saveGame(gameState: GameState): Promise<void> {
    const saveData = {
      ...gameState,
      lastSaved: Date.now(),
    };

    await this.dbManager.save('saves', saveData);
  }

  async loadGame(saveId: string): Promise<GameState | null> {
    try {
      const save = await this.dbManager.load('saves', saveId);
      return save || null;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  async loadLatestSave(): Promise<GameState | null> {
    try {
      const saves = await this.dbManager.getAll('saves');

      if (saves.length === 0) {
        return null;
      }

      // Sort by lastSaved descending
      saves.sort((a, b) => b.lastSaved - a.lastSaved);

      return saves[0];
    } catch (error) {
      console.error('Failed to load latest save:', error);
      return null;
    }
  }

  async getAllSaves(): Promise<GameState[]> {
    try {
      const saves = await this.dbManager.getAll('saves');
      return saves.sort((a, b) => b.lastSaved - a.lastSaved);
    } catch (error) {
      console.error('Failed to get all saves:', error);
      return [];
    }
  }

  async deleteSave(saveId: string): Promise<void> {
    await this.dbManager.delete('saves', saveId);
  }
}
