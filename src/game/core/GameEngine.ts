import { GameState } from '../../types/gameTypes';
import { EntityType } from '../../types/entityTypes';
import { ItemType } from '../../types/itemTypes';
import { Entity } from '../entities/Entity';
import { Player } from '../entities/Player';
import { Wolf } from '../entities/Wolf';
import { Bear } from '../entities/Bear';
import { Fox } from '../entities/Fox';
import { Deer } from '../entities/Deer';
import { Owl } from '../entities/Owl';
import { Child } from '../entities/Child';
import { Campfire } from '../entities/Campfire';
import { Camera } from './Camera';
import { InputManager } from './InputManager';
import { CollisionSystem } from './Collision';
import { DayNightCycle } from '../systems/DayNightCycle';
import { ResourceManager } from '../systems/ResourceManager';
import { InventorySystem } from '../systems/InventorySystem';
import { CraftingSystem } from '../systems/CraftingSystem';
import { LightingSystem } from '../systems/LightingSystem';
import { World } from '../world/World';
import { Renderer } from '../rendering/Renderer';
import { ParticleSystem } from '../rendering/ParticleSystem';
import { ScreenEffects, FloatingTextManager } from '../rendering/ScreenEffects';
import { AchievementSystem } from '../systems/AchievementSystem';
import { TutorialSystem } from '../systems/TutorialSystem';
import { GAME_CONFIG, CONTROLS } from '../../constants/gameConfig';
import { WEAPONS } from '../../constants/items';

export class GameEngine {
  private gameState: GameState;
  private player: Player;
  private entities: Map<string, Entity> = new Map();
  private camera: Camera;
  private inputManager: InputManager;

  // Systems
  private world: World;
  private dayNightCycle: DayNightCycle;
  private resourceManager: ResourceManager;
  private inventorySystem: InventorySystem;
  private craftingSystem: CraftingSystem;
  private lightingSystem: LightingSystem;
  private particleSystem: ParticleSystem;
  private screenEffects: ScreenEffects;
  private floatingTextManager: FloatingTextManager;
  private achievementSystem: AchievementSystem;
  private tutorialSystem: TutorialSystem;
  private renderer: Renderer | null = null;

  private creatureSpawnTimer: number = 0;
  private wasNight: boolean = false;

  constructor(initialState: GameState, inputManager: InputManager) {
    this.gameState = initialState;
    this.inputManager = inputManager;

    // Initialize camera
    this.camera = new Camera(
      GAME_CONFIG.WORLD.WIDTH,
      GAME_CONFIG.WORLD.HEIGHT,
      GAME_CONFIG.RENDERING.CANVAS_WIDTH,
      GAME_CONFIG.RENDERING.CANVAS_HEIGHT
    );

    // Initialize world
    this.world = new World(initialState.world.seed);
    if (initialState.world.campfirePosition) {
      this.world.placeCampfire(initialState.world.campfirePosition);
    }

    // Initialize systems
    this.dayNightCycle = new DayNightCycle(initialState.dayNightCycle);
    this.resourceManager = new ResourceManager(
      initialState.world.seed,
      GAME_CONFIG.WORLD.WIDTH,
      GAME_CONFIG.WORLD.HEIGHT
    );
    this.inventorySystem = new InventorySystem(initialState.inventory);
    this.craftingSystem = new CraftingSystem();
    this.lightingSystem = new LightingSystem();
    this.particleSystem = new ParticleSystem();
    this.screenEffects = new ScreenEffects();
    this.floatingTextManager = new FloatingTextManager();
    this.achievementSystem = new AchievementSystem();
    this.tutorialSystem = new TutorialSystem();

    // Initialize player
    this.player = new Player(initialState.player, this.inputManager);

    // Spawn initial entities
    this.spawnInitialEntities();
  }

  private spawnInitialEntities(): void {
    // Spawn children
    const childPositions = this.gameState.world.childrenPositions;
    childPositions.forEach((pos, index) => {
      if (!this.gameState.world.childrenRescued[index]) {
        const child = new Child(`child_${index}`, pos.x, pos.y);
        this.entities.set(child.id, child);
      }
    });

    // Spawn campfire if exists
    if (this.gameState.world.campfirePosition) {
      const campfire = new Campfire(
        'campfire',
        this.gameState.world.campfirePosition.x,
        this.gameState.world.campfirePosition.y
      );
      this.entities.set(campfire.id, campfire);
    }
  }

  public update(deltaTime: number): void {
    // Limit delta time to prevent large jumps
    deltaTime = Math.min(deltaTime, 0.1);

    // Update input
    this.inputManager.update();

    // Update day/night cycle
    this.dayNightCycle.update(deltaTime);

    // Check for day/night transitions and update difficulty
    this.handleDayNightTransitions();

    // Update resource manager
    this.resourceManager.update(deltaTime);

    // Update lighting system
    this.lightingSystem.update(this.getState());

    // Update screen effects and UI systems
    this.screenEffects.update(deltaTime);
    this.floatingTextManager.update(deltaTime);
    this.tutorialSystem.update(deltaTime);

    // Update player
    this.player.update(deltaTime, this.gameState);

    // Handle player input
    this.handlePlayerInput();

    // Update entities
    for (const entity of this.entities.values()) {
      entity.update(deltaTime, this.gameState);
    }

    // Spawn creatures at night
    if (this.dayNightCycle.isNight()) {
      this.handleCreatureSpawning(deltaTime);
    }

    // Handle collisions
    this.handleCollisions();

    // Clamp player to world bounds
    this.player.position = CollisionSystem.clampToWorld(
      this.player.position,
      GAME_CONFIG.PLAYER.RADIUS,
      GAME_CONFIG.WORLD.WIDTH,
      GAME_CONFIG.WORLD.HEIGHT
    );

    // Update camera to follow player
    this.camera.follow(this.player.position);

    // Update particle system
    this.particleSystem.update(deltaTime);

    // Update achievements
    this.updateAchievements();

    // Update game state
    this.updateGameState();

    // Remove dead entities
    this.removeDeadEntities();
  }

  private handleDayNightTransitions(): void {
    const isNight = this.dayNightCycle.isNight();

    if (isNight && !this.wasNight) {
      // Night just started
      this.tutorialSystem.triggerHint('night_coming');
    }

    this.wasNight = isNight;
  }

  private updateAchievements(): void {
    // Update achievement progress
    this.achievementSystem.checkProgress('hunter', this.gameState.statistics.creaturesKilled);
    this.achievementSystem.checkProgress('monster_slayer', this.gameState.statistics.creaturesKilled);
    this.achievementSystem.checkProgress('gatherer', this.gameState.statistics.resourcesGathered);
    this.achievementSystem.checkProgress('craftsman', this.gameState.statistics.itemsCrafted);
    this.achievementSystem.checkProgress('survivor_week', this.gameState.dayNightCycle.totalDaysPassed);
    this.achievementSystem.checkProgress('survivor_month', this.gameState.dayNightCycle.totalDaysPassed);

    const childrenRescued = this.gameState.world.childrenRescued.filter(r => r).length;
    this.achievementSystem.checkProgress('rescuer', childrenRescued);

    if (childrenRescued === 1) {
      this.achievementSystem.unlock('first_rescue');
    }

    if (this.gameState.statistics.creaturesKilled === 1) {
      this.achievementSystem.unlock('first_blood');
    }
  }

  private handlePlayerInput(): void {
    // Handle interact key
    if (this.inputManager.isKeyPressed(CONTROLS.INTERACT)) {
      this.handleInteraction();
    }

    // Handle food consumption
    if (this.inputManager.isKeyPressed(CONTROLS.USE_FOOD)) {
      if (this.inventorySystem.hasItem(ItemType.FOOD)) {
        if (this.player.consumeFood()) {
          this.inventorySystem.removeItem(ItemType.FOOD);
          this.gameState.statistics.resourcesGathered++;
        }
      }
    }

    // Handle attack
    if (this.inputManager.isMouseButtonDown(0)) {
      this.handleAttack();
    }
  }

  private handleInteraction(): void {
    // Collect resources
    const nearbyResources = this.resourceManager.getResourcesNear(
      this.player.position,
      GAME_CONFIG.RESOURCES.COLLECTION_RADIUS
    );

    for (const resource of nearbyResources) {
      const itemType = this.resourceManager.collectResource(resource.id);
      if (itemType) {
        this.inventorySystem.addItem(itemType);
        this.gameState.statistics.resourcesGathered++;
        this.particleSystem.createParticles(resource.position, 10, '#FFD700', 0.5);
        this.floatingTextManager.addText(
          `+1 ${itemType}`,
          resource.position.x,
          resource.position.y,
          '#FFD700',
          16
        );
        this.tutorialSystem.triggerHint('collect_resources');
      }
    }

    // Rescue children
    for (const entity of this.entities.values()) {
      if (entity.type === EntityType.CHILD) {
        const child = entity as Child;
        if (
          !child.getRescued() &&
          this.player.distanceTo(child.position) <= GAME_CONFIG.CHILD.INTERACTION_RADIUS
        ) {
          child.rescue();
          const childIndex = parseInt(child.id.split('_')[1]);
          this.world.rescueChild(childIndex);
          this.gameState.world.childrenRescued[childIndex] = true;
          this.floatingTextManager.addText(
            'CHILD RESCUED!',
            child.position.x,
            child.position.y,
            '#00FF00',
            32
          );
          this.tutorialSystem.triggerHint('children');
        }
      }
    }

    // Place campfire
    if (this.inventorySystem.hasItem(ItemType.CAMPFIRE_KIT)) {
      if (!this.gameState.world.campfirePosition) {
        this.inventorySystem.removeItem(ItemType.CAMPFIRE_KIT);
        const campfire = new Campfire('campfire', this.player.position.x, this.player.position.y);
        this.entities.set(campfire.id, campfire);
        this.world.placeCampfire(this.player.position);
        this.gameState.world.campfirePosition = { ...this.player.position };
        this.achievementSystem.unlock('light_keeper');
        this.tutorialSystem.triggerHint('campfire');
        this.floatingTextManager.addText(
          'SAFE ZONE CREATED!',
          this.player.position.x,
          this.player.position.y - 40,
          '#FF6600',
          28
        );
      }
    }
  }

  private handleAttack(): void {
    const equippedWeapon = this.inventorySystem.getEquippedWeapon();
    if (!equippedWeapon) return;

    const weapon = WEAPONS[equippedWeapon];

    // Check which enemies are in range
    for (const entity of this.entities.values()) {
      if (
        entity.type === EntityType.WOLF ||
        entity.type === EntityType.BEAR ||
        entity.type === EntityType.FOX ||
        entity.type === EntityType.DEER_MONSTER ||
        entity.type === EntityType.OWL_MONSTER
      ) {
        const distToEnemy = this.player.distanceTo(entity.position);

        if (distToEnemy <= weapon.range) {
          entity.takeDamage(weapon.damage);
          this.gameState.statistics.damageDealt += weapon.damage;

          // Add floating damage number
          this.floatingTextManager.addText(
            `-${weapon.damage}`,
            entity.position.x,
            entity.position.y,
            '#FF6666',
            24
          );

          // Add hit particles
          this.particleSystem.createParticles(entity.position, 10, '#FF0000', 0.5);

          if (entity.health <= 0) {
            this.gameState.statistics.creaturesKilled++;
            this.particleSystem.createParticles(entity.position, 20, '#FF0000', 1);
            this.floatingTextManager.addText(
              'KILL!',
              entity.position.x,
              entity.position.y - 20,
              '#FFD700',
              28
            );
          }
        }
      }
    }
  }

  private handleCreatureSpawning(deltaTime: number): void {
    this.creatureSpawnTimer += deltaTime;

    if (this.creatureSpawnTimer >= 30) {
      // Spawn every 30 seconds during night
      this.creatureSpawnTimer = 0;

      const count = this.entities.size;
      if (count < 20) {
        // Limit total entities
        this.spawnRandomCreature();
      }
    }
  }

  private spawnRandomCreature(): void {
    const types = ['wolf', 'bear', 'fox', 'deer', 'owl'];
    const type = types[Math.floor(Math.random() * types.length)];

    const angle = Math.random() * Math.PI * 2;
    const distance = 400 + Math.random() * 200;

    const x = this.player.position.x + Math.cos(angle) * distance;
    const y = this.player.position.y + Math.sin(angle) * distance;

    const clampedX = Math.max(50, Math.min(GAME_CONFIG.WORLD.WIDTH - 50, x));
    const clampedY = Math.max(50, Math.min(GAME_CONFIG.WORLD.HEIGHT - 50, y));

    const id = `${type}_${Date.now()}_${Math.random()}`;

    let creature: Entity;
    switch (type) {
      case 'wolf':
        creature = new Wolf(id, clampedX, clampedY);
        break;
      case 'bear':
        creature = new Bear(id, clampedX, clampedY);
        break;
      case 'fox':
        creature = new Fox(id, clampedX, clampedY);
        break;
      case 'deer':
        creature = new Deer(id, clampedX, clampedY);
        break;
      case 'owl':
        creature = new Owl(id, clampedX, clampedY);
        break;
      default:
        return;
    }

    this.entities.set(id, creature);
  }

  private handleCollisions(): void {
    // Check player collision with enemies
    for (const entity of this.entities.values()) {
      if (
        entity.type === EntityType.WOLF ||
        entity.type === EntityType.BEAR ||
        entity.type === EntityType.FOX ||
        entity.type === EntityType.DEER_MONSTER ||
        entity.type === EntityType.OWL_MONSTER
      ) {
        if (
          CollisionSystem.checkCircleCollision(
            this.player.position,
            this.player.radius,
            entity.position,
            entity.radius
          )
        ) {
          // Check if player is in safe zone
          const isInSafeZone = this.lightingSystem.isInLight(this.player.position);

          // Player can't be damaged while dashing
          if (!isInSafeZone && !this.player.isDashingNow()) {
            const creature = entity as any;
            if (creature.getAttackDamage) {
              const damage = creature.getAttackDamage();
              this.player.takeDamage(damage);
              this.gameState.statistics.damageTaken += damage;

              // Screen shake on damage
              this.screenEffects.triggerShake(10, 0.3);

              // Show damage number on player
              this.floatingTextManager.addText(
                `-${damage}`,
                this.player.position.x,
                this.player.position.y - 30,
                '#FF0000',
                28
              );

              // Blood particles
              this.particleSystem.createParticles(this.player.position, 15, '#AA0000', 0.6);
            }
          }

          // Push entities apart
          const resolved = CollisionSystem.resolveCollision(
            this.player.position,
            this.player.radius,
            entity.position,
            entity.radius
          );
          this.player.position = resolved.pos1;
          entity.position = resolved.pos2;
        }
      }
    }
  }

  private removeDeadEntities(): void {
    for (const [id, entity] of this.entities.entries()) {
      if (!entity.isActive) {
        this.entities.delete(id);
      }
    }
  }

  private updateGameState(): void {
    this.gameState.player = this.player.getPlayerState();
    this.gameState.dayNightCycle = this.dayNightCycle.getState();
    this.gameState.inventory = this.inventorySystem.getState();
    this.gameState.world = this.world.getState();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.renderer) {
      this.renderer = new Renderer(ctx, this.camera);
    }

    // Apply screen shake
    const shake = this.screenEffects.getShakeOffset();
    ctx.save();
    ctx.translate(shake.x, shake.y);

    const entityList = [this.player, ...Array.from(this.entities.values())];
    const resources = this.resourceManager.getAllResources();

    this.renderer.render(
      this.gameState,
      entityList,
      resources,
      this.dayNightCycle,
      this.lightingSystem
    );

    this.particleSystem.render(ctx, this.camera);
    this.floatingTextManager.render(ctx, this.camera);

    ctx.restore();
  }

  public getState(): GameState {
    return { ...this.gameState };
  }

  // Public methods for UI interactions
  public handleUseItem(item: ItemType): void {
    if (item === ItemType.FOOD) {
      if (this.inventorySystem.hasItem(ItemType.FOOD)) {
        if (this.player.consumeFood()) {
          this.inventorySystem.removeItem(ItemType.FOOD);
        }
      }
    } else if (item === ItemType.FUEL) {
      if (this.inventorySystem.hasItem(ItemType.FUEL)) {
        this.player.refillFlashlight();
        this.inventorySystem.removeItem(ItemType.FUEL);
      }
    } else if (item === ItemType.FLASHLIGHT) {
      if (this.inventorySystem.hasItem(ItemType.FLASHLIGHT)) {
        this.player.giveFlashlight();
      }
    }
  }

  public handleEquipWeapon(weapon: string): void {
    this.inventorySystem.equipWeapon(weapon as any);
  }

  public handleCraft(recipeId: string): boolean {
    const success = this.craftingSystem.craft(recipeId, this.inventorySystem);
    if (success) {
      this.gameState.statistics.itemsCrafted++;
      this.tutorialSystem.triggerHint('crafting');
    }
    return success;
  }

  public getPlayer(): Player {
    return this.player;
  }

  public getTutorialHint(): string | null {
    return this.tutorialSystem.getCurrentHint();
  }

  public getAchievementSystem(): AchievementSystem {
    return this.achievementSystem;
  }

  public dismissTutorialHint(): void {
    this.tutorialSystem.dismissCurrentHint();
  }
}
