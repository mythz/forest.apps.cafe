import { Vector2D } from '../../types/gameTypes';
import { ItemType } from '../../types/itemTypes';
import { GAME_CONFIG } from '../../constants/gameConfig';
import { SeededRandom } from '../../utils/random';

export interface Resource {
  id: string;
  type: ItemType;
  position: Vector2D;
  isCollected: boolean;
}

export class ResourceManager {
  private resources: Map<string, Resource> = new Map();
  private spawnTimer: number = 0;
  private random: SeededRandom;
  private worldWidth: number;
  private worldHeight: number;
  private resourceIdCounter: number = 0;

  constructor(seed: number, worldWidth: number, worldHeight: number) {
    this.random = new SeededRandom(seed);
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
  }

  public update(deltaTime: number): void {
    this.spawnTimer += deltaTime;

    if (
      this.spawnTimer >= GAME_CONFIG.RESOURCES.SPAWN_INTERVAL &&
      this.resources.size < GAME_CONFIG.RESOURCES.MAX_RESOURCES
    ) {
      this.spawnResource();
      this.spawnTimer = 0;
    }
  }

  private spawnResource(): void {
    const resourceTypes = [ItemType.WOOD, ItemType.METAL, ItemType.FOOD, ItemType.FUEL];
    const type = this.random.choice(resourceTypes);

    const position: Vector2D = {
      x: this.random.range(100, this.worldWidth - 100),
      y: this.random.range(100, this.worldHeight - 100),
    };

    const id = `resource_${this.resourceIdCounter++}`;

    this.resources.set(id, {
      id,
      type,
      position,
      isCollected: false,
    });
  }

  public collectResource(resourceId: string): ItemType | null {
    const resource = this.resources.get(resourceId);
    if (!resource || resource.isCollected) {
      return null;
    }

    resource.isCollected = true;
    this.resources.delete(resourceId);
    return resource.type;
  }

  public getResourcesNear(position: Vector2D, radius: number): Resource[] {
    const nearby: Resource[] = [];

    for (const resource of this.resources.values()) {
      if (resource.isCollected) continue;

      const dx = resource.position.x - position.x;
      const dy = resource.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        nearby.push(resource);
      }
    }

    return nearby;
  }

  public getAllResources(): Resource[] {
    return Array.from(this.resources.values()).filter((r) => !r.isCollected);
  }

  public getResourceById(id: string): Resource | undefined {
    return this.resources.get(id);
  }
}
