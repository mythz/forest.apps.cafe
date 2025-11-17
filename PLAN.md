# 99 Nights: Forest Survival Game - Complete Implementation Plan

## 1. Project Overview

### 1.1 Core Concept
A top-down 2D survival game where players must survive 99 nights in a haunted forest, rescue 4 children, gather resources, craft items, and defend against hostile creatures while avoiding two deadly nocturnal monsters.

### 1.2 Technical Stack
- **Framework**: React 19+ with TypeScript
- **Build Tool**: Vite
- **Rendering**: HTML5 Canvas
- **Storage**: IndexedDB (primary) + localStorage (settings backup)
- **Deployment**: Static hosting compatible (no backend required)

### 1.3 Game Mechanics Summary
- **Day/Night Cycle**: Each day lasts 3 minutes real-time (2 min day, 1 min night)
- **Win Condition**: Survive 99 nights AND rescue all 4 children
- **Lose Condition**: Player health reaches 0
- **Safe Zones**: Campfire radius, flashlight beam
- **Resource Management**: Food, wood, metal, fuel, weapons
- **Crafting System**: Combine resources to create tools and weapons

---

## 2. Project Structure

```
src/
├── main.tsx                 # Entry point
├── App.tsx                  # Main game container
├── components/
│   ├── Game.tsx            # Main game loop component
│   ├── Canvas.tsx          # Canvas rendering component
│   ├── UI/
│   │   ├── HUD.tsx         # Health, day counter, inventory display
│   │   ├── Inventory.tsx   # Inventory management UI
│   │   ├── CraftingMenu.tsx # Crafting interface
│   │   ├── PauseMenu.tsx   # Pause/settings menu
│   │   ├── GameOver.tsx    # Game over screen
│   │   └── Victory.tsx     # Victory screen
│   └── MainMenu.tsx        # Start screen
├── game/
│   ├── core/
│   │   ├── GameEngine.ts   # Main game loop and state
│   │   ├── InputManager.ts # Keyboard/mouse input handling
│   │   ├── Camera.ts       # Camera system for following player
│   │   └── Collision.ts    # Collision detection utilities
│   ├── entities/
│   │   ├── Entity.ts       # Base entity class
│   │   ├── Player.ts       # Player character
│   │   ├── Creature.ts     # Base hostile creature
│   │   ├── Wolf.ts         # Wolf enemy
│   │   ├── Bear.ts         # Bear enemy
│   │   ├── Fox.ts          # Fox enemy
│   │   ├── Deer.ts         # Deer monster
│   │   ├── Owl.ts          # Owl monster
│   │   ├── Child.ts        # Rescuable children
│   │   └── Campfire.ts     # Campfire entity
│   ├── systems/
│   │   ├── DayNightCycle.ts # Day/night management
│   │   ├── ResourceManager.ts # Resource spawning/collection
│   │   ├── CraftingSystem.ts # Crafting logic
│   │   ├── InventorySystem.ts # Inventory management
│   │   ├── LightingSystem.ts # Light sources and safe zones
│   │   └── AISystem.ts     # Enemy AI behaviors
│   ├── world/
│   │   ├── World.ts        # World generation and management
│   │   ├── Terrain.ts      # Terrain tiles and obstacles
│   │   └── MapGenerator.ts # Procedural map generation
│   └── rendering/
│       ├── Renderer.ts     # Main rendering engine
│       ├── SpriteManager.ts # Sprite loading and caching
│       └── ParticleSystem.ts # Visual effects (fire, etc.)
├── storage/
│   ├── IndexedDBManager.ts # IndexedDB wrapper
│   ├── SaveSystem.ts       # Game save/load logic
│   └── SettingsManager.ts  # Settings persistence
├── types/
│   ├── gameTypes.ts        # Game state interfaces
│   ├── entityTypes.ts      # Entity interfaces
│   └── itemTypes.ts        # Item and resource types
├── constants/
│   ├── gameConfig.ts       # Game balance constants
│   ├── items.ts            # Item definitions
│   └── recipes.ts          # Crafting recipes
└── utils/
    ├── math.ts             # Math helpers (distance, angles)
    └── random.ts           # Random generation utilities
```

---

## 3. Data Models & Types

### 3.1 Core Types (`types/gameTypes.ts`)

```typescript
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
  equippedWeapon: WeaponType | null;
}

export interface GameStatistics {
  creaturesKilled: number;
  resourcesGathered: number;
  itemsCrafted: number;
  distanceTraveled: number;
  damageDealt: number;
  damageTaken: number;
}
```

### 3.2 Entity Types (`types/entityTypes.ts`)

```typescript
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
```

### 3.3 Item Types (`types/itemTypes.ts`)

```typescript
export enum ItemType {
  // Resources
  WOOD = 'wood',
  METAL = 'metal',
  FOOD = 'food',
  FUEL = 'fuel',
  
  // Tools
  FLASHLIGHT = 'flashlight',
  
  // Weapons
  SPEAR = 'spear',
  RIFLE = 'rifle',
  REVOLVER = 'revolver',
  SWORD = 'sword',
  KUNAI = 'kunai',
  
  // Special
  CAMPFIRE_KIT = 'campfire_kit',
}

export interface ItemDefinition {
  id: ItemType;
  name: string;
  description: string;
  stackable: boolean;
  maxStack: number;
  category: 'resource' | 'tool' | 'weapon' | 'consumable';
}

export interface WeaponStats {
  damage: number;
  range: number;
  attackSpeed: number; // attacks per second
  durability?: number; // null = infinite
  ammoType?: ItemType;
}

export interface Recipe {
  id: string;
  result: ItemType;
  resultCount: number;
  requirements: { [key in ItemType]?: number };
}
```

---

## 4. Constants & Configuration

### 4.1 Game Config (`constants/gameConfig.ts`)

```typescript
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
  },
  
  CREATURES: {
    WOLF: {
      HEALTH: 30,
      SPEED: 120,
      DAMAGE: 15,
      DETECTION_RADIUS: 400,
      ATTACK_RADIUS: 50,
      ATTACK_COOLDOWN: 2,
    },
    BEAR: {
      HEALTH: 60,
      SPEED: 80,
      DAMAGE: 30,
      DETECTION_RADIUS: 350,
      ATTACK_RADIUS: 70,
      ATTACK_COOLDOWN: 3,
    },
    FOX: {
      HEALTH: 20,
      SPEED: 160,
      DAMAGE: 10,
      DETECTION_RADIUS: 300,
      ATTACK_RADIUS: 40,
      ATTACK_COOLDOWN: 1.5,
    },
  },
  
  MONSTERS: {
    DEER: {
      HEALTH: 999, // Cannot be killed
      SPEED: 200,
      DAMAGE: 50,
      DETECTION_RADIUS: 600,
      LIGHT_FLEE_RADIUS: 250,
    },
    OWL: {
      HEALTH: 999,
      SPEED: 180,
      DAMAGE: 60,
      DETECTION_RADIUS: 500,
      LIGHT_FLEE_RADIUS: 250,
      MOVEMENT_DETECTION_RADIUS: 400,
      STATIONARY_INVISIBLE_TIME: 2, // seconds
    },
  },
  
  RESOURCES: {
    SPAWN_INTERVAL: 10, // seconds
    MAX_RESOURCES: 50,
    COLLECTION_RADIUS: 60,
  },
  
  RENDERING: {
    TARGET_FPS: 60,
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,
  },
};
```

### 4.2 Item Definitions (`constants/items.ts`)

```typescript
export const ITEMS: { [key in ItemType]: ItemDefinition } = {
  [ItemType.WOOD]: {
    id: ItemType.WOOD,
    name: 'Wood',
    description: 'Basic building material',
    stackable: true,
    maxStack: 99,
    category: 'resource',
  },
  [ItemType.METAL]: {
    id: ItemType.METAL,
    name: 'Metal',
    description: 'Used for crafting advanced items',
    stackable: true,
    maxStack: 99,
    category: 'resource',
  },
  [ItemType.FOOD]: {
    id: ItemType.FOOD,
    name: 'Food',
    description: 'Restores 25 health',
    stackable: true,
    maxStack: 20,
    category: 'consumable',
  },
  [ItemType.FUEL]: {
    id: ItemType.FUEL,
    name: 'Fuel',
    description: 'Powers flashlight',
    stackable: true,
    maxStack: 50,
    category: 'resource',
  },
  [ItemType.FLASHLIGHT]: {
    id: ItemType.FLASHLIGHT,
    name: 'Flashlight',
    description: 'Emits light to ward off monsters',
    stackable: false,
    maxStack: 1,
    category: 'tool',
  },
  // ... weapon definitions
};

export const WEAPONS: { [key in WeaponType]: WeaponStats } = {
  [ItemType.SPEAR]: {
    damage: 20,
    range: 100,
    attackSpeed: 1,
    durability: null,
  },
  [ItemType.RIFLE]: {
    damage: 50,
    range: 500,
    attackSpeed: 0.5,
    durability: 100,
    ammoType: ItemType.METAL,
  },
  [ItemType.REVOLVER]: {
    damage: 35,
    range: 300,
    attackSpeed: 1.5,
    durability: 150,
    ammoType: ItemType.METAL,
  },
  [ItemType.SWORD]: {
    damage: 30,
    range: 80,
    attackSpeed: 2,
    durability: null,
  },
  [ItemType.KUNAI]: {
    damage: 15,
    range: 200,
    attackSpeed: 3,
    durability: 50,
  },
};
```

### 4.3 Crafting Recipes (`constants/recipes.ts`)

```typescript
export const RECIPES: Recipe[] = [
  {
    id: 'campfire',
    result: ItemType.CAMPFIRE_KIT,
    resultCount: 1,
    requirements: {
      [ItemType.WOOD]: 10,
      [ItemType.METAL]: 5,
    },
  },
  {
    id: 'flashlight',
    result: ItemType.FLASHLIGHT,
    resultCount: 1,
    requirements: {
      [ItemType.METAL]: 8,
      [ItemType.FUEL]: 10,
    },
  },
  {
    id: 'spear',
    result: ItemType.SPEAR,
    resultCount: 1,
    requirements: {
      [ItemType.WOOD]: 5,
      [ItemType.METAL]: 2,
    },
  },
  {
    id: 'rifle',
    result: ItemType.RIFLE,
    resultCount: 1,
    requirements: {
      [ItemType.WOOD]: 15,
      [ItemType.METAL]: 20,
    },
  },
  {
    id: 'revolver',
    result: ItemType.REVOLVER,
    resultCount: 1,
    requirements: {
      [ItemType.METAL]: 15,
    },
  },
  {
    id: 'sword',
    result: ItemType.SWORD,
    resultCount: 1,
    requirements: {
      [ItemType.METAL]: 12,
    },
  },
  {
    id: 'kunai',
    result: ItemType.KUNAI,
    resultCount: 5,
    requirements: {
      [ItemType.METAL]: 3,
    },
  },
];
```

---

## 5. Core Systems Implementation

### 5.1 Game Engine (`game/core/GameEngine.ts`)

**Purpose**: Main game loop, state management, and system coordination.

**Key Responsibilities**:
- Initialize game systems
- Run fixed timestep game loop (60 FPS)
- Update all entities and systems
- Coordinate between systems
- Handle game state transitions

**Implementation Details**:
```typescript
class GameEngine {
  private gameState: GameState;
  private systems: {
    dayNight: DayNightCycle;
    resources: ResourceManager;
    inventory: InventorySystem;
    crafting: CraftingSystem;
    lighting: LightingSystem;
    ai: AISystem;
  };
  private entities: Map<string, Entity>;
  private isPaused: boolean;
  private lastUpdateTime: number;
  private accumulator: number;
  
  constructor() {
    // Initialize with new game state or loaded state
  }
  
  public init(savedState?: GameState): void {
    // Load or create new game
    // Initialize all systems
    // Spawn initial entities
  }
  
  public update(deltaTime: number): void {
    if (this.isPaused) return;
    
    // Fixed timestep accumulator
    this.accumulator += deltaTime;
    const fixedDelta = 1 / 60;
    
    while (this.accumulator >= fixedDelta) {
      // Update day/night cycle
      // Update player input
      // Update entities (movement, AI)
      // Check collisions
      // Update systems
      // Handle entity interactions
      // Remove dead entities
      
      this.accumulator -= fixedDelta;
    }
  }
  
  public render(renderer: Renderer): void {
    // Delegate to renderer with current game state
  }
  
  public saveGame(): void {
    // Serialize game state to IndexedDB
  }
  
  public loadGame(saveId: string): void {
    // Load game state from IndexedDB
  }
  
  // Event handlers
  public handlePlayerAttack(): void;
  public handleResourceCollection(resourceId: string): void;
  public handleCrafting(recipeId: string): void;
  public handleChildRescue(childId: string): void;
  public handleCampfirePlacement(): void;
}
```

### 5.2 Input Manager (`game/core/InputManager.ts`)

**Purpose**: Handle keyboard and mouse input with proper state management.

**Key Responsibilities**:
- Track key states (pressed, released, held)
- Handle mouse position and clicks
- Provide input query methods for game logic
- Support key rebinding

**Implementation Details**:
```typescript
class InputManager {
  private keys: Map<string, boolean>;
  private keysPressed: Map<string, boolean>; // This frame
  private keysReleased: Map<string, boolean>; // This frame
  private mousePosition: Vector2D;
  private mouseButtons: Map<number, boolean>;
  private canvas: HTMLCanvasElement;
  
  constructor(canvas: HTMLCanvasElement) {
    this.setupEventListeners();
  }
  
  public isKeyDown(key: string): boolean;
  public isKeyPressed(key: string): boolean; // Just pressed this frame
  public isKeyReleased(key: string): boolean;
  public getMousePosition(): Vector2D;
  public isMouseButtonDown(button: number): boolean;
  
  public update(): void {
    // Clear frame-specific states
    this.keysPressed.clear();
    this.keysReleased.clear();
  }
  
  private setupEventListeners(): void {
    // Add keydown, keyup, mousemove, mousedown, mouseup listeners
  }
}

// Input bindings
export const CONTROLS = {
  MOVE_UP: 'w',
  MOVE_DOWN: 's',
  MOVE_LEFT: 'a',
  MOVE_RIGHT: 'd',
  SPRINT: 'Shift',
  INTERACT: 'e',
  TOGGLE_FLASHLIGHT: 'f',
  ATTACK: 'mouse0',
  OPEN_INVENTORY: 'i',
  OPEN_CRAFTING: 'c',
  PAUSE: 'Escape',
};
```

### 5.3 Collision System (`game/core/Collision.ts`)

**Purpose**: Detect and resolve collisions between entities.

**Implementation Details**:
```typescript
export class CollisionSystem {
  // Circle-circle collision
  static checkCircleCollision(
    pos1: Vector2D, 
    radius1: number, 
    pos2: Vector2D, 
    radius2: number
  ): boolean {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius1 + radius2;
  }
  
  // Resolve collision by pushing entities apart
  static resolveCollision(
    entity1: Entity, 
    entity2: Entity
  ): void {
    const dx = entity2.position.x - entity1.position.x;
    const dy = entity2.position.y - entity1.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const overlap = entity1.radius + entity2.radius - distance;
    
    if (overlap > 0) {
      const nx = dx / distance;
      const ny = dy / distance;
      
      entity1.position.x -= nx * overlap * 0.5;
      entity1.position.y -= ny * overlap * 0.5;
      entity2.position.x += nx * overlap * 0.5;
      entity2.position.y += ny * overlap * 0.5;
    }
  }
  
  // Check if entity is within world bounds
  static clampToWorld(
    position: Vector2D, 
    worldWidth: number, 
    worldHeight: number
  ): Vector2D {
    return {
      x: Math.max(0, Math.min(worldWidth, position.x)),
      y: Math.max(0, Math.min(worldHeight, position.y)),
    };
  }
  
  // Point in circle check (for resource collection)
  static pointInCircle(
    point: Vector2D, 
    center: Vector2D, 
    radius: number
  ): boolean;
}
```

### 5.4 Camera System (`game/core/Camera.ts`)

**Purpose**: Follow player and handle screen-to-world coordinate conversion.

**Implementation Details**:
```typescript
class Camera {
  private position: Vector2D;
  private targetPosition: Vector2D;
  private worldWidth: number;
  private worldHeight: number;
  private viewportWidth: number;
  private viewportHeight: number;
  private smoothing: number = 0.1; // Camera smoothing factor
  
  constructor(
    worldWidth: number, 
    worldHeight: number, 
    viewportWidth: number, 
    viewportHeight: number
  ) {
    // Initialize camera at world center
  }
  
  public follow(target: Vector2D): void {
    // Smoothly interpolate toward target
    this.position.x += (target.x - this.position.x) * this.smoothing;
    this.position.y += (target.y - this.position.y) * this.smoothing;
    
    // Clamp to world bounds
    this.clampToWorld();
  }
  
  public worldToScreen(worldPos: Vector2D): Vector2D {
    return {
      x: worldPos.x - this.position.x + this.viewportWidth / 2,
      y: worldPos.y - this.position.y + this.viewportHeight / 2,
    };
  }
  
  public screenToWorld(screenPos: Vector2D): Vector2D {
    return {
      x: screenPos.x + this.position.x - this.viewportWidth / 2,
      y: screenPos.y + this.position.y - this.viewportHeight / 2,
    };
  }
  
  private clampToWorld(): void {
    // Ensure camera doesn't show outside world bounds
  }
}
```

---

## 6. Entity System

### 6.1 Base Entity (`game/entities/Entity.ts`)

**Purpose**: Abstract base class for all game entities.

```typescript
abstract class Entity {
  public id: string;
  public position: Vector2D;
  public velocity: Vector2D;
  public radius: number;
  public health: number;
  public maxHealth: number;
  public isActive: boolean;
  public direction: number;
  
  constructor(state: EntityState) {
    // Initialize from state
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
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  public getState(): EntityState {
    // Serialize entity state
  }
}
```

### 6.2 Player (`game/entities/Player.ts`)

**Purpose**: Player character with movement, health, and flashlight.

**Key Features**:
- WASD movement with sprint
- Flashlight toggle and fuel management
- Weapon system
- Interaction with resources and children
- Safe zone detection

**Implementation Details**:
```typescript
class Player extends Entity {
  public speed: number;
  public hasFlashlight: boolean;
  public flashlightActive: boolean;
  public flashlightFuel: number;
  public maxFlashlightFuel: number;
  public equippedWeapon: WeaponType | null;
  public lastAttackTime: number;
  private inputManager: InputManager;
  
  constructor(state: PlayerState, inputManager: InputManager) {
    super(state);
  }
  
  update(deltaTime: number, gameState: GameState): void {
    this.handleMovement(deltaTime);
    this.updateFlashlight(deltaTime);
    this.checkSafeZone(gameState);
    
    // Handle food consumption
    if (this.inputManager.isKeyPressed(CONTROLS.USE_FOOD)) {
      this.consumeFood(gameState.inventory);
    }
  }
  
  private handleMovement(deltaTime: number): void {
    const vel = { x: 0, y: 0 };
    
    if (this.inputManager.isKeyDown(CONTROLS.MOVE_UP)) vel.y -= 1;
    if (this.inputManager.isKeyDown(CONTROLS.MOVE_DOWN)) vel.y += 1;
    if (this.inputManager.isKeyDown(CONTROLS.MOVE_LEFT)) vel.x -= 1;
    if (this.inputManager.isKeyDown(CONTROLS.MOVE_RIGHT)) vel.x += 1;
    
    // Normalize diagonal movement
    const length = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
    if (length > 0) {
      vel.x /= length;
      vel.y /= length;
    }
    
    // Apply sprint multiplier
    const isSprinting = this.inputManager.isKeyDown(CONTROLS.SPRINT);
    const speed = this.speed * (isSprinting ? PLAYER.SPRINT_MULTIPLIER : 1);
    
    // Update position
    this.position.x += vel.x * speed * deltaTime;
    this.position.y += vel.y * speed * deltaTime;
    
    // Update direction for rendering
    if (length > 0) {
      this.direction = Math.atan2(vel.y, vel.x);
    }
    
    this.isMoving = length > 0;
  }
  
  private updateFlashlight(deltaTime: number): void {
    if (!this.hasFlashlight) return;
    
    // Toggle flashlight
    if (this.inputManager.isKeyPressed(CONTROLS.TOGGLE_FLASHLIGHT)) {
      this.flashlightActive = !this.flashlightActive;
    }
    
    // Drain fuel when active
    if (this.flashlightActive) {
      this.flashlightFuel = Math.max(0, this.flashlightFuel - PLAYER.FLASHLIGHT_DRAIN_RATE * deltaTime);
      if (this.flashlightFuel <= 0) {
        this.flashlightActive = false;
      }
    }
  }
  
  public attack(): void {
    if (!this.equippedWeapon) return;
    
    const weapon = WEAPONS[this.equippedWeapon];
    const now = Date.now();
    
    if (now - this.lastAttackTime < 1000 / weapon.attackSpeed) return;
    
    this.lastAttackTime = now;
    // Emit attack event with weapon stats
  }
  
  public refillFlashlight(amount: number): void {
    this.flashlightFuel = Math.min(this.maxFlashlightFuel, this.flashlightFuel + amount);
  }
  
  public isInSafeZone(gameState: GameState): boolean {
    // Check campfire radius
    if (gameState.world.campfirePosition) {
      const distance = this.distanceTo(gameState.world.campfirePosition);
      if (distance <= CAMPFIRE.SAFE_RADIUS) return true;
    }
    
    // Flashlight creates safe zone
    return this.flashlightActive;
  }
  
  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screenPos = camera.worldToScreen(this.position);
    
    // Draw player circle
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw direction indicator
    ctx.strokeStyle = '#FFF';
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y);
    ctx.lineTo(
      screenPos.x + Math.cos(this.direction) * this.radius * 1.5,
      screenPos.y + Math.sin(this.direction) * this.radius * 1.5
    );
    ctx.stroke();
    
    // Draw flashlight beam if active
    if (this.flashlightActive) {
      this.renderFlashlight(ctx, screenPos);
    }
  }
  
  private renderFlashlight(ctx: CanvasRenderingContext2D, screenPos: Vector2D): void {
    const gradient = ctx.createRadialGradient(
      screenPos.x, screenPos.y, 0,
      screenPos.x, screenPos.y, PLAYER.FLASHLIGHT_RADIUS
    );
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, PLAYER.FLASHLIGHT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

### 6.3 Hostile Creatures (`game/entities/Creature.ts`, `Wolf.ts`, `Bear.ts`, `Fox.ts`)

**Base Creature Class**:
```typescript
abstract class Creature extends Entity {
  protected ai: CreatureAI;
  protected attackDamage: number;
  protected attackRange: number;
  protected detectionRadius: number;
  
  constructor(state: EntityState, aiConfig: Partial<CreatureAI>) {
    super(state);
    this.ai = {
      state: AIState.WANDER,
      target: null,
      wanderAngle: Math.random() * Math.PI * 2,
      detectionRadius: aiConfig.detectionRadius || 300,
      attackRadius: aiConfig.attackRadius || 50,
      attackCooldown: aiConfig.attackCooldown || 2,
      lastAttackTime: 0,
    };
  }
  
  update(deltaTime: number, gameState: GameState): void {
    if (!gameState.dayNightCycle.isNight) {
      // Creatures are only active at night
      return;
    }
    
    this.updateAI(deltaTime, gameState);
    this.applyMovement(deltaTime);
  }
  
  protected updateAI(deltaTime: number, gameState: GameState): void {
    const player = gameState.player;
    const distanceToPlayer = this.distanceTo(player.position);
    
    // State machine
    switch (this.ai.state) {
      case AIState.WANDER:
        this.wanderBehavior(deltaTime);
        if (distanceToPlayer < this.ai.detectionRadius) {
          this.ai.state = AIState.CHASE;
          this.ai.target = player.position;
        }
        break;
        
      case AIState.CHASE:
        if (distanceToPlayer > this.ai.detectionRadius * 1.5) {
          this.ai.state = AIState.WANDER;
          this.ai.target = null;
        } else if (distanceToPlayer < this.ai.attackRange) {
          this.ai.state = AIState.ATTACK;
        } else {
          this.chaseTarget(player.position);
        }
        break;
        
      case AIState.ATTACK:
        if (distanceToPlayer > this.ai.attackRange * 1.2) {
          this.ai.state = AIState.CHASE;
        } else {
          this.attackTarget(player, deltaTime);
        }
        break;
    }
  }
  
  protected wanderBehavior(deltaTime: number): void {
    // Random wander with occasional direction changes
    if (Math.random() < 0.02) { // 2% chance per frame to change direction
      this.ai.wanderAngle += (Math.random() - 0.5) * Math.PI;
    }
    
    const speed = this.speed * 0.3; // Wander at 30% speed
    this.velocity.x = Math.cos(this.ai.wanderAngle) * speed;
    this.velocity.y = Math.sin(this.ai.wanderAngle) * speed;
  }
  
  protected chaseTarget(target: Vector2D): void {
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    this.velocity.x = (dx / distance) * this.speed;
    this.velocity.y = (dy / distance) * this.speed;
    this.direction = Math.atan2(dy, dx);
  }
  
  protected attackTarget(player: Player, deltaTime: number): void {
    const now = Date.now() / 1000;
    if (now - this.ai.lastAttackTime > this.ai.attackCooldown) {
      player.takeDamage(this.attackDamage);
      this.ai.lastAttackTime = now;
    }
  }
  
  protected applyMovement(deltaTime: number): void {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }
  
  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screenPos = camera.worldToScreen(this.position);
    
    // Different colors per creature type
    ctx.fillStyle = this.getColor();
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Health bar
    this.renderHealthBar(ctx, screenPos);
  }
  
  protected abstract getColor(): string;
}

// Wolf: Fast, pack behavior
class Wolf extends Creature {
  constructor(state: EntityState) {
    super(state, GAME_CONFIG.CREATURES.WOLF);
    this.attackDamage = GAME_CONFIG.CREATURES.WOLF.DAMAGE;
  }
  
  protected getColor(): string {
    return '#757575';
  }
}

// Bear: Slow, high damage, high health
class Bear extends Creature {
  constructor(state: EntityState) {
    super(state, GAME_CONFIG.CREATURES.BEAR);
    this.attackDamage = GAME_CONFIG.CREATURES.BEAR.DAMAGE;
  }
  
  protected getColor(): string {
    return '#5D4037';
  }
}

// Fox: Fast, low health, quick attacks
class Fox extends Creature {
  constructor(state: EntityState) {
    super(state, GAME_CONFIG.CREATURES.FOX);
    this.attackDamage = GAME_CONFIG.CREATURES.FOX.DAMAGE;
  }
  
  protected getColor(): string {
    return '#FF5722';
  }
}
```

### 6.4 Monsters (`game/entities/Deer.ts`, `Owl.ts`)

**Deer Monster**:
```typescript
class Deer extends Entity {
  private detectionRadius: number;
  private lightFleeRadius: number;
  private attackDamage: number;
  
  constructor(state: EntityState) {
    super(state);
    this.health = GAME_CONFIG.MONSTERS.DEER.HEALTH;
    this.speed = GAME_CONFIG.MONSTERS.DEER.SPEED;
    this.detectionRadius = GAME_CONFIG.MONSTERS.DEER.DETECTION_RADIUS;
    this.lightFleeRadius = GAME_CONFIG.MONSTERS.DEER.LIGHT_FLEE_RADIUS;
    this.attackDamage = GAME_CONFIG.MONSTERS.DEER.DAMAGE;
  }
  
  update(deltaTime: number, gameState: GameState): void {
    // Only active at night
    if (!gameState.dayNightCycle.isNight) return;
    
    const player = gameState.player;
    const distanceToPlayer = this.distanceTo(player.position);
    
    // Check if player is in safe zone
    if (player.isInSafeZone(gameState)) {
      // Flee from light
      this.fleeFromPlayer(player.position);
    } else if (distanceToPlayer < this.detectionRadius) {
      // Chase player
      this.chasePlayer(player.position);
      
      // Attack if in range
      if (distanceToPlayer < this.radius + player.radius) {
        player.takeDamage(this.attackDamage);
      }
    } else {
      // Wander
      this.wander();
    }
    
    // Apply movement
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }
  
  private fleeFromPlayer(playerPos: Vector2D): void {
    const dx = this.position.x - playerPos.x;
    const dy = this.position.y - playerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    this.velocity.x = (dx / distance) * this.speed;
    this.velocity.y = (dy / distance) * this.speed;
  }
  
  private chasePlayer(playerPos: Vector2D): void {
    const dx = playerPos.x - this.position.x;
    const dy = playerPos.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    this.velocity.x = (dx / distance) * this.speed;
    this.velocity.y = (dy / distance) * this.speed;
  }
  
  private wander(): void {
    // Slow wandering behavior
    this.velocity.x *= 0.95;
    this.velocity.y *= 0.95;
  }
  
  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screenPos = camera.worldToScreen(this.position);
    
    // Creepy red glow
    ctx.fillStyle = '#8B0000';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FF0000';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
```

**Owl Monster**:
```typescript
class Owl extends Entity {
  private detectionRadius: number;
  private movementDetectionRadius: number;
  private lightFleeRadius: number;
  private attackDamage: number;
  private stationaryTime: number; // How long player has been still
  
  constructor(state: EntityState) {
    super(state);
    this.health = GAME_CONFIG.MONSTERS.OWL.HEALTH;
    this.speed = GAME_CONFIG.MONSTERS.OWL.SPEED;
    this.detectionRadius = GAME_CONFIG.MONSTERS.OWL.DETECTION_RADIUS;
    this.movementDetectionRadius = GAME_CONFIG.MONSTERS.OWL.MOVEMENT_DETECTION_RADIUS;
    this.lightFleeRadius = GAME_CONFIG.MONSTERS.OWL.LIGHT_FLEE_RADIUS;
    this.attackDamage = GAME_CONFIG.MONSTERS.OWL.DAMAGE;
    this.stationaryTime = 0;
  }
  
  update(deltaTime: number, gameState: GameState): void {
    if (!gameState.dayNightCycle.isNight) return;
    
    const player = gameState.player;
    const distanceToPlayer = this.distanceTo(player.position);
    
    // Check if player is in light
    if (player.isInSafeZone(gameState)) {
      this.fleeFromPlayer(player.position);
      this.stationaryTime = 0;
      return;
    }
    
    // Check if player is moving
    if (player.isMoving) {
      this.stationaryTime = 0;
      
      // Chase if player is moving within detection radius
      if (distanceToPlayer < this.movementDetectionRadius) {
        this.chasePlayer(player.position);
        
        // Attack if in range
        if (distanceToPlayer < this.radius + player.radius) {
          player.takeDamage(this.attackDamage);
        }
      }
    } else {
      // Player is standing still - owl becomes blind to them
      this.stationaryTime += deltaTime;
      
      if (this.stationaryTime >= GAME_CONFIG.MONSTERS.OWL.STATIONARY_INVISIBLE_TIME) {
        // Stop chasing and wander
        this.wander();
      } else {
        // Still chasing for a brief moment
        if (distanceToPlayer < this.detectionRadius) {
          this.chasePlayer(player.position);
        }
      }
    }
    
    // Apply movement
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }
  
  private fleeFromPlayer(playerPos: Vector2D): void {
    const dx = this.position.x - playerPos.x;
    const dy = this.position.y - playerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    this.velocity.x = (dx / distance) * this.speed;
    this.velocity.y = (dy / distance) * this.speed;
  }
  
  private chasePlayer(playerPos: Vector2D): void {
    const dx = playerPos.x - this.position.x;
    const dy = playerPos.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    this.velocity.x = (dx / distance) * this.speed;
    this.velocity.y = (dy / distance) * this.speed;
  }
  
  private wander(): void {
    this.velocity.x *= 0.9;
    this.velocity.y *= 0.9;
  }
  
  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screenPos = camera.worldToScreen(this.position);
    
    // Eerie yellow glow
    ctx.fillStyle = '#FFD700';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FFFF00';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Draw eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(screenPos.x - 10, screenPos.y - 5, 5, 0, Math.PI * 2);
    ctx.arc(screenPos.x + 10, screenPos.y - 5, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

### 6.5 Children & Campfire (`game/entities/Child.ts`, `Campfire.ts`)

**Child Entity**:
```typescript
class Child extends Entity {
  public isRescued: boolean;
  private rescueRadius: number = 80;
  
  constructor(state: EntityState) {
    super(state);
    this.isRescued = false;
  }
  
  update(deltaTime: number, gameState: GameState): void {
    if (this.isRescued) return;
    
    const player = gameState.player;
    const distance = this.distanceTo(player.position);
    
    // Check if player is close enough to rescue
    if (distance < this.rescueRadius) {
      this.isRescued = true;
      // Emit rescue event
    }
  }
  
  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    if (this.isRescued) return;
    
    const screenPos = camera.worldToScreen(this.position);
    
    // Draw child (blue circle)
    ctx.fillStyle = '#2196F3';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw rescue radius indicator
    ctx.strokeStyle = 'rgba(33, 150, 243, 0.3)';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.rescueRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
}
```

**Campfire Entity**:
```typescript
class Campfire extends Entity {
  private lightRadius: number;
  private safeRadius: number;
  
  constructor(position: Vector2D) {
    super({
      id: 'campfire',
      type: EntityType.CAMPFIRE,
      position,
      velocity: { x: 0, y: 0 },
      health: 100,
      maxHealth: 100,
      radius: 30,
      isActive: true,
      direction: 0,
    });
    
    this.lightRadius = GAME_CONFIG.CAMPFIRE.LIGHT_RADIUS;
    this.safeRadius = GAME_CONFIG.CAMPFIRE.SAFE_RADIUS;
  }
  
  update(deltaTime: number, gameState: GameState): void {
    // Static entity, no update needed
  }
  
  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screenPos = camera.worldToScreen(this.position);
    
    // Draw light radius (only at night)
    if (gameState.dayNightCycle.isNight) {
      const gradient = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, this.lightRadius
      );
      gradient.addColorStop(0, 'rgba(255, 150, 50, 0.6)');
      gradient.addColorStop(0.7, 'rgba(255, 150, 50, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, this.lightRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw campfire
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Animated flames (simple)
    const flameHeight = Math.sin(Date.now() / 100) * 10 + 30;
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y - flameHeight);
    ctx.lineTo(screenPos.x - 10, screenPos.y);
    ctx.lineTo(screenPos.x + 10, screenPos.y);
    ctx.closePath();
    ctx.fill();
  }
}
```

---

## 7. Game Systems

### 7.1 Day/Night Cycle (`game/systems/DayNightCycle.ts`)

```typescript
class DayNightCycle {
  private currentDay: number;
  private timeOfDay: number; // 0-1
  private cycleLength: number; // seconds
  private dayLength: number;
  private nightLength: number;
  
  constructor() {
    this.currentDay = 1;
    this.timeOfDay = 0.5; // Start at noon
    this.dayLength = GAME_CONFIG.DAY_NIGHT.DAY_LENGTH;
    this.nightLength = GAME_CONFIG.DAY_NIGHT.NIGHT_LENGTH;
    this.cycleLength = this.dayLength + this.nightLength;
  }
  
  update(deltaTime: number): void {
    const cycleFraction = deltaTime / this.cycleLength;
    this.timeOfDay += cycleFraction;
    
    if (this.timeOfDay >= 1) {
      this.timeOfDay -= 1;
      this.currentDay++;
    }
  }
  
  isNight(): boolean {
    return this.timeOfDay < GAME_CONFIG.DAY_NIGHT.DAWN_TIME || 
           this.timeOfDay > GAME_CONFIG.DAY_NIGHT.DUSK_TIME;
  }
  
  getDayNumber(): number {
    return this.currentDay;
  }
  
  getTimeOfDay(): number {
    return this.timeOfDay;
  }
  
  getSkyColor(): string {
    // Interpolate between day and night colors
    if (this.isNight()) {
      return '#0a0a1a'; // Dark blue night
    } else {
      // Calculate sun position for gradient
      const sunProgress = (this.timeOfDay - GAME_CONFIG.DAY_NIGHT.DAWN_TIME) / 
                         (GAME_CONFIG.DAY_NIGHT.DUSK_TIME - GAME_CONFIG.DAY_NIGHT.DAWN_TIME);
      
      if (sunProgress < 0.2) {
        // Dawn (orange)
        return this.lerpColor('#0a0a1a', '#FF7F50', sunProgress * 5);
      } else if (sunProgress > 0.8) {
        // Dusk (orange to dark)
        return this.lerpColor('#87CEEB', '#FF7F50', (sunProgress - 0.8) * 5);
      } else {
        // Day (blue)
        return '#87CEEB';
      }
    }
  }
  
  private lerpColor(color1: string, color2: string, t: number): string {
    // Simple color interpolation
    // Implementation needed
  }
  
  getAmbientLightLevel(): number {
    // 0 = full darkness, 1 = full light
    return this.isNight() ? 0.2 : 1.0;
  }
}
```

### 7.2 Resource Manager (`game/systems/ResourceManager.ts`)

```typescript
class ResourceManager {
  private resources: Map<string, Entity>;
  private spawnTimer: number;
  private spawnInterval: number;
  private maxResources: number;
  private worldBounds: { width: number; height: number };
  
  constructor(worldWidth: number, worldHeight: number) {
    this.resources = new Map();
    this.spawnTimer = 0;
    this.spawnInterval = GAME_CONFIG.RESOURCES.SPAWN_INTERVAL;
    this.maxResources = GAME_CONFIG.RESOURCES.MAX_RESOURCES;
    this.worldBounds = { width: worldWidth, height: worldHeight };
  }
  
  update(deltaTime: number): void {
    this.spawnTimer += deltaTime;
    
    if (this.spawnTimer >= this.spawnInterval && 
        this.resources.size < this.maxResources) {
      this.spawnResource();
      this.spawnTimer = 0;
    }
  }
  
  private spawnResource(): void {
    const types = [ItemType.WOOD, ItemType.METAL, ItemType.FOOD, ItemType.FUEL];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const position = {
      x: Math.random() * this.worldBounds.width,
      y: Math.random() * this.worldBounds.height,
    };
    
    const resource = new ResourceEntity(type, position);
    this.resources.set(resource.id, resource);
  }
  
  collectResource(resourceId: string, inventory: InventorySystem): boolean {
    const resource = this.resources.get(resourceId);
    if (!resource) return false;
    
    const success = inventory.addItem(resource.itemType, 1);
    if (success) {
      this.resources.delete(resourceId);
    }
    
    return success;
  }
  
  checkPlayerCollisions(player: Player): string | null {
    for (const [id, resource] of this.resources) {
      const distance = player.distanceTo(resource.position);
      if (distance < GAME_CONFIG.RESOURCES.COLLECTION_RADIUS) {
        return id;
      }
    }
    return null;
  }
  
  getAllResources(): Entity[] {
    return Array.from(this.resources.values());
  }
}

class ResourceEntity extends Entity {
  public itemType: ItemType;
  
  constructor(itemType: ItemType, position: Vector2D) {
    super({
      id: `resource_${Date.now()}_${Math.random()}`,
      type: EntityType.RESOURCE,
      position,
      velocity: { x: 0, y: 0 },
      health: 1,
      maxHealth: 1,
      radius: 20,
      isActive: true,
      direction: 0,
    });
    
    this.itemType = itemType;
  }
  
  update(deltaTime: number, gameState: GameState): void {
    // Static, no update needed
  }
  
  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screenPos = camera.worldToScreen(this.position);
    
    // Different colors for different resources
    const colors = {
      [ItemType.WOOD]: '#8B4513',
      [ItemType.METAL]: '#888888',
      [ItemType.FOOD]: '#4CAF50',
      [ItemType.FUEL]: '#FFD700',
    };
    
    ctx.fillStyle = colors[this.itemType] || '#FFF';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw icon/symbol for resource type
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.getSymbol(), screenPos.x, screenPos.y);
  }
  
  private getSymbol(): string {
    const symbols = {
      [ItemType.WOOD]: '🪵',
      [ItemType.METAL]: '⚙️',
      [ItemType.FOOD]: '🍎',
      [ItemType.FUEL]: '⛽',
    };
    return symbols[this.itemType] || '?';
  }
}
```

### 7.3 Inventory System (`game/systems/InventorySystem.ts`)

```typescript
class InventorySystem {
  private items: Map<ItemType, number>;
  private maxSlots: number;
  
  constructor(maxSlots: number = 20) {
    this.items = new Map();
    this.maxSlots = maxSlots;
  }
  
  addItem(itemType: ItemType, amount: number = 1): boolean {
    const itemDef = ITEMS[itemType];
    
    if (!itemDef.stackable && this.items.has(itemType)) {
      return false; // Can't add non-stackable item if already have one
    }
    
    const currentAmount = this.items.get(itemType) || 0;
    const newAmount = currentAmount + amount;
    
    if (itemDef.stackable && newAmount > itemDef.maxStack) {
      return false; // Would exceed max stack
    }
    
    // Check slot limit for new item types
    if (!this.items.has(itemType) && this.items.size >= this.maxSlots) {
      return false; // No free slots
    }
    
    this.items.set(itemType, newAmount);
    return true;
  }
  
  removeItem(itemType: ItemType, amount: number = 1): boolean {
    const currentAmount = this.items.get(itemType) || 0;
    
    if (currentAmount < amount) {
      return false; // Not enough items
    }
    
    const newAmount = currentAmount - amount;
    if (newAmount === 0) {
      this.items.delete(itemType);
    } else {
      this.items.set(itemType, newAmount);
    }
    
    return true;
  }
  
  hasItem(itemType: ItemType, amount: number = 1): boolean {
    return (this.items.get(itemType) || 0) >= amount;
  }
  
  getItemCount(itemType: ItemType): number {
    return this.items.get(itemType) || 0;
  }
  
  getAllItems(): Map<ItemType, number> {
    return new Map(this.items);
  }
  
  getState(): InventoryState {
    const items: { [key: string]: number } = {};
    for (const [type, count] of this.items) {
      items[type] = count;
    }
    
    return {
      items,
      maxSlots: this.maxSlots,
      equippedWeapon: null, // Handled separately
    };
  }
  
  loadState(state: InventoryState): void {
    this.items.clear();
    for (const [type, count] of Object.entries(state.items)) {
      this.items.set(type as ItemType, count);
    }
  }
}
```

### 7.4 Crafting System (`game/systems/CraftingSystem.ts`)

```typescript
class CraftingSystem {
  private recipes: Recipe[];
  
  constructor() {
    this.recipes = RECIPES;
  }
  
  canCraft(recipeId: string, inventory: InventorySystem): boolean {
    const recipe = this.recipes.find(r => r.id === recipeId);
    if (!recipe) return false;
    
    for (const [itemType, required] of Object.entries(recipe.requirements)) {
      if (!inventory.hasItem(itemType as ItemType, required)) {
        return false;
      }
    }
    
    return true;
  }
  
  craft(recipeId: string, inventory: InventorySystem): boolean {
    if (!this.canCraft(recipeId, inventory)) {
      return false;
    }
    
    const recipe = this.recipes.find(r => r.id === recipeId)!;
    
    // Remove requirements
    for (const [itemType, required] of Object.entries(recipe.requirements)) {
      inventory.removeItem(itemType as ItemType, required);
    }
    
    // Add result
    inventory.addItem(recipe.result, recipe.resultCount);
    
    return true;
  }
  
  getAvailableRecipes(inventory: InventorySystem): Recipe[] {
    return this.recipes.filter(recipe => this.canCraft(recipe.id, inventory));
  }
  
  getAllRecipes(): Recipe[] {
    return [...this.recipes];
  }
}
```

### 7.5 AI System (`game/systems/AISystem.ts`)

```typescript
class AISystem {
  updateCreatures(
    creatures: Creature[], 
    player: Player, 
    deltaTime: number
  ): void {
    for (const creature of creatures) {
      if (!creature.isActive) continue;
      creature.update(deltaTime, { player } as any);
    }
  }
  
  updateMonsters(
    monsters: (Deer | Owl)[], 
    gameState: GameState, 
    deltaTime: number
  ): void {
    for (const monster of monsters) {
      if (!monster.isActive) continue;
      monster.update(deltaTime, gameState);
    }
  }
  
  spawnCreature(
    type: EntityType, 
    worldBounds: { width: number; height: number },
    playerPosition: Vector2D,
    minDistanceFromPlayer: number = 500
  ): Creature | null {
    // Find spawn position far from player
    let attempts = 0;
    let position: Vector2D;
    
    do {
      position = {
        x: Math.random() * worldBounds.width,
        y: Math.random() * worldBounds.height,
      };
      
      const dx = position.x - playerPosition.x;
      const dy = position.y - playerPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance >= minDistanceFromPlayer) {
        break;
      }
      
      attempts++;
    } while (attempts < 10);
    
    if (attempts >= 10) return null;
    
    // Create creature based on type
    const state: EntityState = {
      id: `${type}_${Date.now()}_${Math.random()}`,
      type,
      position,
      velocity: { x: 0, y: 0 },
      health: 50,
      maxHealth: 50,
      radius: 25,
      isActive: true,
      direction: 0,
    };
    
    switch (type) {
      case EntityType.WOLF:
        return new Wolf(state);
      case EntityType.BEAR:
        return new Bear(state);
      case EntityType.FOX:
        return new Fox(state);
      default:
        return null;
    }
  }
}
```

---

## 8. Storage & Persistence

### 8.1 IndexedDB Manager (`storage/IndexedDBManager.ts`)

```typescript
class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = '99NightsGame';
  private readonly DB_VERSION = 1;
  private readonly STORES = {
    SAVES: 'saves',
    SETTINGS: 'settings',
  };
  
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains(this.STORES.SAVES)) {
          db.createObjectStore(this.STORES.SAVES, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(this.STORES.SETTINGS)) {
          db.createObjectStore(this.STORES.SETTINGS, { keyPath: 'key' });
        }
      };
    });
  }
  
  async saveSaveGame(saveData: GameState): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.SAVES], 'readwrite');
      const store = transaction.objectStore(this.STORES.SAVES);
      const request = store.put(saveData);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  
  async loadSaveGame(saveId: string): Promise<GameState | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.SAVES], 'readonly');
      const store = transaction.objectStore(this.STORES.SAVES);
      const request = store.get(saveId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }
  
  async getAllSaves(): Promise<GameState[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.SAVES], 'readonly');
      const store = transaction.objectStore(this.STORES.SAVES);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
  
  async deleteSaveGame(saveId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.SAVES], 'readwrite');
      const store = transaction.objectStore(this.STORES.SAVES);
      const request = store.delete(saveId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  
  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.SETTINGS], 'readwrite');
      const store = transaction.objectStore(this.STORES.SETTINGS);
      const request = store.put({ key, value });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  
  async loadSetting(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.SETTINGS], 'readonly');
      const store = transaction.objectStore(this.STORES.SETTINGS);
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.value || null);
    });
  }
}

export const dbManager = new IndexedDBManager();
```

### 8.2 Save System (`storage/SaveSystem.ts`)

```typescript
class SaveSystem {
  private dbManager: IndexedDBManager;
  
  constructor(dbManager: IndexedDBManager) {
    this.dbManager = dbManager;
  }
  
  async saveGame(gameState: GameState): Promise<void> {
    const saveData: GameState = {
      ...gameState,
      lastSaved: Date.now(),
    };
    
    await this.dbManager.saveSaveGame(saveData);
    
    // Also backup to localStorage as fallback
    try {
      localStorage.setItem('lastSave', JSON.stringify(saveData));
    } catch (e) {
      console.warn('Failed to backup to localStorage:', e);
    }
  }
  
  async loadGame(saveId: string): Promise<GameState | null> {
    const save = await this.dbManager.loadSaveGame(saveId);
    return save;
  }
  
  async loadLatestSave(): Promise<GameState | null> {
    const saves = await this.dbManager.getAllSaves();
    if (saves.length === 0) return null;
    
    // Sort by lastSaved and return most recent
    saves.sort((a, b) => b.lastSaved - a.lastSaved);
    return saves[0];
  }
  
  async getAllSaves(): Promise<GameState[]> {
    return await this.dbManager.getAllSaves();
  }
  
  async deleteSave(saveId: string): Promise<void> {
    await this.dbManager.deleteSaveGame(saveId);
  }
  
  createNewGame(): GameState {
    return {
      id: `save_${Date.now()}`,
      lastSaved: Date.now(),
      player: {
        position: { x: GAME_CONFIG.WORLD.WIDTH / 2, y: GAME_CONFIG.WORLD.HEIGHT / 2 },
        health: GAME_CONFIG.PLAYER.MAX_HEALTH,
        maxHealth: GAME_CONFIG.PLAYER.MAX_HEALTH,
        speed: GAME_CONFIG.PLAYER.BASE_SPEED,
        direction: 0,
        isMoving: false,
        hasFlashlight: false,
        flashlightActive: false,
        flashlightFuel: 0,
      },
      world: {
        seed: Math.floor(Math.random() * 1000000),
        width: GAME_CONFIG.WORLD.WIDTH,
        height: GAME_CONFIG.WORLD.HEIGHT,
        campfirePosition: null,
        childrenPositions: this.generateChildPositions(),
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
        items: GAME_CONFIG.PLAYER.STARTING_ITEMS,
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
    };
  }
  
  private generateChildPositions(): Vector2D[] {
    // Generate 4 random positions across the map
    const positions: Vector2D[] = [];
    const worldW = GAME_CONFIG.WORLD.WIDTH;
    const worldH = GAME_CONFIG.WORLD.HEIGHT;
    const margin = 500;
    
    for (let i = 0; i < 4; i++) {
      positions.push({
        x: margin + Math.random() * (worldW - margin * 2),
        y: margin + Math.random() * (worldH - margin * 2),
      });
    }
    
    return positions;
  }
}
```

---

## 9. UI Components

### 9.1 HUD (`components/UI/HUD.tsx`)

```typescript
interface HUDProps {
  player: PlayerState;
  dayNightCycle: DayNightState;
  inventory: InventoryState;
  childrenRescued: number;
}

export const HUD: React.FC<HUDProps> = ({ 
  player, 
  dayNightCycle, 
  inventory,
  childrenRescued 
}) => {
  const healthPercentage = (player.health / player.maxHealth) * 100;
  const fuelPercentage = (player.flashlightFuel / PLAYER.FLASHLIGHT_MAX_FUEL) * 100;
  
  return (
    <div className="hud">
      {/* Health Bar */}
      <div className="health-bar">
        <div className="bar-label">Health</div>
        <div className="bar-container">
          <div 
            className="bar-fill health" 
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
        <div className="bar-text">{player.health} / {player.maxHealth}</div>
      </div>
      
      {/* Flashlight Fuel */}
      {player.hasFlashlight && (
        <div className="fuel-bar">
          <div className="bar-label">Flashlight</div>
          <div className="bar-container">
            <div 
              className="bar-fill fuel" 
              style={{ width: `${fuelPercentage}%` }}
            />
          </div>
          <div className="bar-text">
            {Math.floor(player.flashlightFuel)} / {PLAYER.FLASHLIGHT_MAX_FUEL}
          </div>
        </div>
      )}
      
      {/* Day/Night Info */}
      <div className="day-info">
        <div className="day-number">Night {dayNightCycle.currentDay} / 99</div>
        <div className={`time-indicator ${dayNightCycle.isNight ? 'night' : 'day'}`}>
          {dayNightCycle.isNight ? '🌙 Night' : '☀️ Day'}
        </div>
      </div>
      
      {/* Children Rescued */}
      <div className="rescue-counter">
        Children Rescued: {childrenRescued} / 4
      </div>
      
      {/* Quick Inventory */}
      <div className="quick-inventory">
        <div className="inventory-item">
          🪵 {inventory.items[ItemType.WOOD] || 0}
        </div>
        <div className="inventory-item">
          ⚙️ {inventory.items[ItemType.METAL] || 0}
        </div>
        <div className="inventory-item">
          🍎 {inventory.items[ItemType.FOOD] || 0}
        </div>
        <div className="inventory-item">
          ⛽ {inventory.items[ItemType.FUEL] || 0}
        </div>
      </div>
      
      {/* Controls Hint */}
      <div className="controls-hint">
        [WASD] Move | [F] Flashlight | [E] Interact | [I] Inventory | [C] Craft
      </div>
    </div>
  );
};
```

### 9.2 Inventory UI (`components/UI/Inventory.tsx`)

```typescript
interface InventoryProps {
  inventory: InventoryState;
  onClose: () => void;
  onUseItem: (itemType: ItemType) => void;
  onEquipWeapon: (weaponType: WeaponType) => void;
}

export const Inventory: React.FC<InventoryProps> = ({
  inventory,
  onClose,
  onUseItem,
  onEquipWeapon,
}) => {
  const items = Object.entries(inventory.items).map(([type, count]) => ({
    type: type as ItemType,
    count,
    definition: ITEMS[type as ItemType],
  }));
  
  return (
    <div className="inventory-overlay">
      <div className="inventory-panel">
        <div className="inventory-header">
          <h2>Inventory</h2>
          <button onClick={onClose}>✕</button>
        </div>
        
        <div className="inventory-grid">
          {items.map(({ type, count, definition }) => (
            <div key={type} className="inventory-slot">
              <div className="item-icon">{getItemIcon(type)}</div>
              <div className="item-name">{definition.name}</div>
              <div className="item-count">×{count}</div>
              <div className="item-description">{definition.description}</div>
              
              {definition.category === 'weapon' && (
                <button 
                  onClick={() => onEquipWeapon(type as WeaponType)}
                  className={inventory.equippedWeapon === type ? 'equipped' : ''}
                >
                  {inventory.equippedWeapon === type ? 'Equipped' : 'Equip'}
                </button>
              )}
              
              {definition.category === 'consumable' && (
                <button onClick={() => onUseItem(type)}>
                  Use
                </button>
              )}
            </div>
          ))}
        </div>
        
        {inventory.equippedWeapon && (
          <div className="equipped-weapon">
            <strong>Equipped:</strong> {ITEMS[inventory.equippedWeapon].name}
            <div className="weapon-stats">
              Damage: {WEAPONS[inventory.equippedWeapon].damage} | 
              Range: {WEAPONS[inventory.equippedWeapon].range} | 
              Speed: {WEAPONS[inventory.equippedWeapon].attackSpeed}/s
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getItemIcon(itemType: ItemType): string {
  const icons = {
    [ItemType.WOOD]: '🪵',
    [ItemType.METAL]: '⚙️',
    [ItemType.FOOD]: '🍎',
    [ItemType.FUEL]: '⛽',
    [ItemType.FLASHLIGHT]: '🔦',
    [ItemType.SPEAR]: '🔱',
    [ItemType.RIFLE]: '🔫',
    [ItemType.REVOLVER]: '🔫',
    [ItemType.SWORD]: '⚔️',
    [ItemType.KUNAI]: '🗡️',
    [ItemType.CAMPFIRE_KIT]: '🔥',
  };
  return icons[itemType] || '❓';
}
```

### 9.3 Crafting Menu (`components/UI/CraftingMenu.tsx`)

```typescript
interface CraftingMenuProps {
  recipes: Recipe[];
  inventory: InventoryState;
  onCraft: (recipeId: string) => void;
  onClose: () => void;
}

export const CraftingMenu: React.FC<CraftingMenuProps> = ({
  recipes,
  inventory,
  onCraft,
  onClose,
}) => {
  const canCraft = (recipe: Recipe): boolean => {
    for (const [itemType, required] of Object.entries(recipe.requirements)) {
      if ((inventory.items[itemType as ItemType] || 0) < required) {
        return false;
      }
    }
    return true;
  };
  
  return (
    <div className="crafting-overlay">
      <div className="crafting-panel">
        <div className="crafting-header">
          <h2>Crafting</h2>
          <button onClick={onClose}>✕</button>
        </div>
        
        <div className="recipe-list">
          {recipes.map((recipe) => {
            const craftable = canCraft(recipe);
            const resultItem = ITEMS[recipe.result];
            
            return (
              <div 
                key={recipe.id} 
                className={`recipe-card ${craftable ? 'craftable' : 'locked'}`}
              >
                <div className="recipe-result">
                  <div className="result-icon">{getItemIcon(recipe.result)}</div>
                  <div className="result-name">{resultItem.name}</div>
                  <div className="result-count">×{recipe.resultCount}</div>
                </div>
                
                <div className="recipe-requirements">
                  <div className="requirements-label">Requires:</div>
                  {Object.entries(recipe.requirements).map(([type, count]) => {
                    const has = inventory.items[type as ItemType] || 0;
                    const enough = has >= count;
                    
                    return (
                      <div 
                        key={type} 
                        className={`requirement ${enough ? 'satisfied' : 'missing'}`}
                      >
                        {getItemIcon(type as ItemType)} {ITEMS[type as ItemType].name} 
                        <span className="requirement-count">
                          ({has}/{count})
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <button 
                  onClick={() => onCraft(recipe.id)}
                  disabled={!craftable}
                  className="craft-button"
                >
                  {craftable ? 'Craft' : 'Insufficient Materials'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
```

---

## 10. Rendering System

### 10.1 Main Renderer (`game/rendering/Renderer.ts`)

```typescript
class Renderer {
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private canvas: HTMLCanvasElement;
  
  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.camera = camera;
  }
  
  render(gameState: GameState, entities: Entity[]): void {
    // Clear canvas
    this.ctx.fillStyle = gameState.dayNightCycle.getSkyColor();
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Apply ambient lighting overlay if night
    if (gameState.dayNightCycle.isNight) {
      this.renderNightOverlay();
    }
    
    // Render world grid (optional debug)
    if (DEBUG_MODE) {
      this.renderGrid();
    }
    
    // Sort entities by y-position for depth sorting
    const sortedEntities = [...entities].sort((a, b) => a.position.y - b.position.y);
    
    // Render all entities
    for (const entity of sortedEntities) {
      if (!entity.isActive) continue;
      entity.render(this.ctx, this.camera);
    }
    
    // Render player
    gameState.player.render(this.ctx, this.camera);
    
    // Render minimap
    this.renderMinimap(gameState);
  }
  
  private renderNightOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  private renderGrid(): void {
    const tileSize = GAME_CONFIG.WORLD.TILE_SIZE;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;
    
    const startX = Math.floor(this.camera.position.x / tileSize) * tileSize;
    const startY = Math.floor(this.camera.position.y / tileSize) * tileSize;
    
    for (let x = startX; x < startX + this.canvas.width; x += tileSize) {
      const screenX = this.camera.worldToScreen({ x, y: 0 }).x;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, 0);
      this.ctx.lineTo(screenX, this.canvas.height);
      this.ctx.stroke();
    }
    
    for (let y = startY; y < startY + this.canvas.height; y += tileSize) {
      const screenY = this.camera.worldToScreen({ x: 0, y }).y;
      this.ctx.beginPath();
      this.ctx.moveTo(0, screenY);
      this.ctx.lineTo(this.canvas.width, screenY);
      this.ctx.stroke();
    }
  }
  
  private renderMinimap(gameState: GameState): void {
    const minimapSize = 150;
    const minimapX = this.canvas.width - minimapSize - 20;
    const minimapY = 20;
    
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // World border
    this.ctx.strokeStyle = '#FFF';
    this.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Scale factor
    const scaleX = minimapSize / GAME_CONFIG.WORLD.WIDTH;
    const scaleY = minimapSize / GAME_CONFIG.WORLD.HEIGHT;
    
    // Player position
    const playerX = minimapX + gameState.player.position.x * scaleX;
    const playerY = minimapY + gameState.player.position.y * scaleY;
    
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.beginPath();
    this.ctx.arc(playerX, playerY, 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Campfire
    if (gameState.world.campfirePosition) {
      const cfX = minimapX + gameState.world.campfirePosition.x * scaleX;
      const cfY = minimapY + gameState.world.campfirePosition.y * scaleY;
      
      this.ctx.fillStyle = '#FF6B35';
      this.ctx.beginPath();
      this.ctx.arc(cfX, cfY, 4, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Children
    for (let i = 0; i < gameState.world.childrenPositions.length; i++) {
      if (gameState.world.childrenRescued[i]) continue;
      
      const child = gameState.world.childrenPositions[i];
      const childX = minimapX + child.x * scaleX;
      const childY = minimapY + child.y * scaleY;
      
      this.ctx.fillStyle = '#2196F3';
      this.ctx.beginPath();
      this.ctx.arc(childX, childY, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
```

---

## 11. Main Game Component

### 11.1 Game Component (`components/Game.tsx`)

```typescript
export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showCrafting, setShowCrafting] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  
  const gameEngineRef = useRef<GameEngine | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);
  const animationFrameRef = useRef<number>();
  
  useEffect(() => {
    initGame();
    return () => cleanup();
  }, []);
  
  const initGame = async () => {
    // Initialize IndexedDB
    await dbManager.init();
    
    // Try to load latest save
    const saveSystem = new SaveSystem(dbManager);
    const latestSave = await saveSystem.loadLatestSave();
    
    const initialState = latestSave || saveSystem.createNewGame();
    
    // Initialize input manager
    if (canvasRef.current) {
      inputManagerRef.current = new InputManager(canvasRef.current);
    }
    
    // Initialize game engine
    gameEngineRef.current = new GameEngine(
      initialState,
      inputManagerRef.current!
    );
    
    setGameState(initialState);
    
    // Start game loop
    startGameLoop();
  };
  
  const startGameLoop = () => {
    let lastTime = performance.now();
    
    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;
      
      if (!isPaused && gameEngineRef.current) {
        // Update game
        gameEngineRef.current.update(deltaTime);
        
        // Get updated state
        const updatedState = gameEngineRef.current.getState();
        setGameState(updatedState);
        
        // Check win/lose conditions
        checkGameConditions(updatedState);
        
        // Render
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d')!;
          gameEngineRef.current.render(ctx);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    
    animationFrameRef.current = requestAnimationFrame(loop);
  };
  
  const checkGameConditions = (state: GameState) => {
    // Check lose condition
    if (state.player.health <= 0) {
      setGameOver(true);
      setIsPaused(true);
    }
    
    // Check win condition
    const allChildrenRescued = state.world.childrenRescued.every(r => r);
    if (state.dayNightCycle.currentDay >= 99 && allChildrenRescued) {
      setVictory(true);
      setIsPaused(true);
    }
  };
  
  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };
  
  const handleSaveGame = async () => {
    if (gameState) {
      const saveSystem = new SaveSystem(dbManager);
      await saveSystem.saveGame(gameState);
      // Show save confirmation
    }
  };
  
  const handlePause = () => {
    setIsPaused(!isPaused);
  };
  
  const handleInventoryToggle = () => {
    setShowInventory(!showInventory);
    setIsPaused(!showInventory);
  };
  
  const handleCraftingToggle = () => {
    setShowCrafting(!showCrafting);
    setIsPaused(!showCrafting);
  };
  
  if (!gameState) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.RENDERING.CANVAS_WIDTH}
        height={GAME_CONFIG.RENDERING.CANVAS_HEIGHT}
        className="game-canvas"
      />
      
      <HUD
        player={gameState.player}
        dayNightCycle={gameState.dayNightCycle}
        inventory={gameState.inventory}
        childrenRescued={gameState.world.childrenRescued.filter(r => r).length}
      />
      
      {showInventory && (
        <Inventory
          inventory={gameState.inventory}
          onClose={handleInventoryToggle}
          onUseItem={(item) => gameEngineRef.current?.handleUseItem(item)}
          onEquipWeapon={(weapon) => gameEngineRef.current?.handleEquipWeapon(weapon)}
        />
      )}
      
      {showCrafting && (
        <CraftingMenu
          recipes={RECIPES}
          inventory={gameState.inventory}
          onCraft={(recipeId) => gameEngineRef.current?.handleCraft(recipeId)}
          onClose={handleCraftingToggle}
        />
      )}
      
      {isPaused && !showInventory && !showCrafting && !gameOver && !victory && (
        <PauseMenu
          onResume={handlePause}
          onSave={handleSaveGame}
          onMainMenu={() => window.location.reload()}
        />
      )}
      
      {gameOver && (
        <GameOver
          statistics={gameState.statistics}
          daysLasted={gameState.dayNightCycle.currentDay}
          onRestart={() => window.location.reload()}
        />
      )}
      
      {victory && (
        <Victory
          statistics={gameState.statistics}
          onMainMenu={() => window.location.reload()}
        />
      )}
    </div>
  );
};
```

### 11.2 Pause Menu (`components/UI/PauseMenu.tsx`)

```typescript
interface PauseMenuProps {
  onResume: () => void;
  onSave: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onSave,
  onMainMenu,
}) => {
  return (
    <div className="pause-overlay">
      <div className="pause-menu">
        <h2>Game Paused</h2>
        
        <div className="menu-buttons">
          <button onClick={onResume} className="menu-button primary">
            Resume Game
          </button>
          
          <button onClick={onSave} className="menu-button">
            Save Game
          </button>
          
          <button onClick={onMainMenu} className="menu-button danger">
            Main Menu
          </button>
        </div>
        
        <div className="controls-reference">
          <h3>Controls</h3>
          <div className="control-row">
            <span className="key">W A S D</span>
            <span>Move</span>
          </div>
          <div className="control-row">
            <span className="key">Shift</span>
            <span>Sprint</span>
          </div>
          <div className="control-row">
            <span className="key">F</span>
            <span>Toggle Flashlight</span>
          </div>
          <div className="control-row">
            <span className="key">E</span>
            <span>Interact / Collect</span>
          </div>
          <div className="control-row">
            <span className="key">I</span>
            <span>Inventory</span>
          </div>
          <div className="control-row">
            <span className="key">C</span>
            <span>Crafting</span>
          </div>
          <div className="control-row">
            <span className="key">Left Click</span>
            <span>Attack</span>
          </div>
          <div className="control-row">
            <span className="key">ESC</span>
            <span>Pause</span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 11.3 Game Over Screen (`components/UI/GameOver.tsx`)

```typescript
interface GameOverProps {
  statistics: GameStatistics;
  daysLasted: number;
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
  statistics,
  daysLasted,
  onRestart,
}) => {
  return (
    <div className="game-over-overlay">
      <div className="game-over-panel">
        <h1 className="game-over-title">Game Over</h1>
        <p className="game-over-subtitle">
          You survived {daysLasted} night{daysLasted !== 1 ? 's' : ''}
        </p>
        
        <div className="statistics">
          <h3>Your Statistics</h3>
          
          <div className="stat-row">
            <span className="stat-label">Creatures Killed:</span>
            <span className="stat-value">{statistics.creaturesKilled}</span>
          </div>
          
          <div className="stat-row">
            <span className="stat-label">Resources Gathered:</span>
            <span className="stat-value">{statistics.resourcesGathered}</span>
          </div>
          
          <div className="stat-row">
            <span className="stat-label">Items Crafted:</span>
            <span className="stat-value">{statistics.itemsCrafted}</span>
          </div>
          
          <div className="stat-row">
            <span className="stat-label">Distance Traveled:</span>
            <span className="stat-value">
              {Math.floor(statistics.distanceTraveled)} m
            </span>
          </div>
          
          <div className="stat-row">
            <span className="stat-label">Damage Dealt:</span>
            <span className="stat-value">{statistics.damageDealt}</span>
          </div>
          
          <div className="stat-row">
            <span className="stat-label">Damage Taken:</span>
            <span className="stat-value">{statistics.damageTaken}</span>
          </div>
        </div>
        
        <button onClick={onRestart} className="restart-button">
          Try Again
        </button>
      </div>
    </div>
  );
};
```

### 11.4 Victory Screen (`components/UI/Victory.tsx`)

```typescript
interface VictoryProps {
  statistics: GameStatistics;
  onMainMenu: () => void;
}

export const Victory: React.FC<VictoryProps> = ({
  statistics,
  onMainMenu,
}) => {
  return (
    <div className="victory-overlay">
      <div className="victory-panel">
        <h1 className="victory-title">Victory!</h1>
        <p className="victory-subtitle">
          You survived 99 nights and rescued all 4 children!
        </p>
        
        <div className="victory-message">
          <p>
            Against all odds, you braved the haunted forest, collected resources,
            crafted powerful weapons, and protected the innocent from the horrors
            that lurk in the darkness.
          </p>
          <p>
            The children are safe, and the forest will remember your courage.
          </p>
        </div>
        
        <div className="statistics">
          <h3>Final Statistics</h3>
          
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon">⚔️</div>
              <div className="stat-number">{statistics.creaturesKilled}</div>
              <div className="stat-label">Creatures Defeated</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-number">{statistics.resourcesGathered}</div>
              <div className="stat-label">Resources Gathered</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🔨</div>
              <div className="stat-number">{statistics.itemsCrafted}</div>
              <div className="stat-label">Items Crafted</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🏃</div>
              <div className="stat-number">
                {Math.floor(statistics.distanceTraveled)}m
              </div>
              <div className="stat-label">Distance Traveled</div>
            </div>
          </div>
        </div>
        
        <button onClick={onMainMenu} className="menu-button">
          Main Menu
        </button>
      </div>
    </div>
  );
};
```

### 11.5 Main Menu (`components/MainMenu.tsx`)

```typescript
interface MainMenuProps {
  onNewGame: () => void;
  onLoadGame: (saveId: string) => void;
  onSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onNewGame,
  onLoadGame,
  onSettings,
}) => {
  const [saves, setSaves] = useState<GameState[]>([]);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  
  useEffect(() => {
    loadSaves();
  }, []);
  
  const loadSaves = async () => {
    const saveSystem = new SaveSystem(dbManager);
    const allSaves = await saveSystem.getAllSaves();
    setSaves(allSaves);
  };
  
  const handleDeleteSave = async (saveId: string) => {
    const saveSystem = new SaveSystem(dbManager);
    await saveSystem.deleteSave(saveId);
    loadSaves();
  };
  
  return (
    <div className="main-menu">
      <div className="menu-background" />
      
      <div className="menu-content">
        <h1 className="game-title">99 Nights</h1>
        <p className="game-subtitle">Survive the Forest</p>
        
        {!showLoadMenu ? (
          <div className="menu-buttons">
            <button onClick={onNewGame} className="menu-button primary">
              New Game
            </button>
            
            <button 
              onClick={() => setShowLoadMenu(true)} 
              className="menu-button"
              disabled={saves.length === 0}
            >
              Continue ({saves.length} saves)
            </button>
            
            <button onClick={onSettings} className="menu-button">
              Settings
            </button>
          </div>
        ) : (
          <div className="load-game-menu">
            <h2>Load Game</h2>
            
            <div className="save-list">
              {saves.map((save) => (
                <div key={save.id} className="save-item">
                  <div className="save-info">
                    <div className="save-header">
                      <span className="save-day">Night {save.dayNightCycle.currentDay}</span>
                      <span className="save-date">
                        {new Date(save.lastSaved).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="save-stats">
                      <span>Health: {save.player.health}/{save.player.maxHealth}</span>
                      <span>Children: {save.world.childrenRescued.filter(r => r).length}/4</span>
                    </div>
                  </div>
                  
                  <div className="save-actions">
                    <button 
                      onClick={() => onLoadGame(save.id)}
                      className="load-button"
                    >
                      Load
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteSave(save.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setShowLoadMenu(false)}
              className="back-button"
            >
              Back
            </button>
          </div>
        )}
        
        <div className="game-description">
          <h3>About the Game</h3>
          <p>
            Survive 99 nights in a haunted forest. Gather resources, craft weapons,
            build a campfire, and rescue 4 lost children. Beware of wolves, bears,
            foxes, and the terrifying monsters that only emerge in darkness.
          </p>
        </div>
      </div>
    </div>
  );
};
```

---

## 12. Styling (CSS)

### 12.1 Main Styles (`src/styles/game.css`)

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background: #000;
  color: #fff;
  overflow: hidden;
}

.game-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
}

.game-canvas {
  border: 2px solid #333;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
}

/* HUD Styles */
.hud {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 20px;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.health-bar, .fuel-bar {
  width: 300px;
}

.bar-label {
  font-size: 14px;
  margin-bottom: 5px;
  color: #ddd;
}

.bar-container {
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #666;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.bar-fill.health {
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
}

.bar-fill.fuel {
  background: linear-gradient(90deg, #FFD700, #FFA500);
}

.bar-text {
  font-size: 12px;
  margin-top: 3px;
  color: #aaa;
}

.day-info {
  position: absolute;
  top: 20px;
  right: 20px;
  text-align: right;
}

.day-number {
  font-size: 24px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.time-indicator {
  font-size: 16px;
  margin-top: 5px;
  padding: 5px 10px;
  border-radius: 5px;
  display: inline-block;
}

.time-indicator.day {
  background: rgba(255, 200, 0, 0.3);
  color: #FFD700;
}

.time-indicator.night {
  background: rgba(0, 0, 100, 0.5);
  color: #87CEEB;
}

.rescue-counter {
  position: absolute;
  top: 100px;
  right: 20px;
  font-size: 18px;
  padding: 10px;
  background: rgba(33, 150, 243, 0.3);
  border: 2px solid #2196F3;
  border-radius: 5px;
}

.quick-inventory {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
}

.inventory-item {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #666;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 16px;
  min-width: 60px;
  text-align: center;
}

.controls-hint {
  position: absolute;
  bottom: 20px;
  right: 20px;
  font-size: 12px;
  color: #888;
  background: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 5px;
}

/* Inventory Overlay */
.inventory-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
}

.inventory-panel {
  background: #1a1a1a;
  border: 3px solid #444;
  border-radius: 10px;
  padding: 30px;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.inventory-header h2 {
  font-size: 28px;
}

.inventory-header button {
  background: #d32f2f;
  border: none;
  color: white;
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 5px;
  cursor: pointer;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.inventory-slot {
  background: #2a2a2a;
  border: 2px solid #555;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  transition: transform 0.2s;
}

.inventory-slot:hover {
  transform: translateY(-2px);
  border-color: #888;
}

.item-icon {
  font-size: 36px;
  margin-bottom: 10px;
}

.item-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.item-count {
  font-size: 14px;
  color: #aaa;
  margin-bottom: 8px;
}

.item-description {
  font-size: 12px;
  color: #888;
  margin-bottom: 10px;
  min-height: 30px;
}

.inventory-slot button {
  background: #4CAF50;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.inventory-slot button:hover {
  background: #45a049;
}

.inventory-slot button.equipped {
  background: #2196F3;
}

.inventory-slot button:disabled {
  background: #555;
  cursor: not-allowed;
}

.equipped-weapon {
  margin-top: 20px;
  padding: 15px;
  background: #2a2a2a;
  border: 2px solid #4CAF50;
  border-radius: 8px;
}

.weapon-stats {
  margin-top: 10px;
  font-size: 14px;
  color: #aaa;
}

/* Crafting Menu */
.crafting-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
}

.crafting-panel {
  background: #1a1a1a;
  border: 3px solid #444;
  border-radius: 10px;
  padding: 30px;
  max-width: 900px;
  max-height: 80vh;
  overflow-y: auto;
}

.crafting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.recipe-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.recipe-card {
  background: #2a2a2a;
  border: 2px solid #555;
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.2s;
}

.recipe-card.craftable {
  border-color: #4CAF50;
}

.recipe-card.locked {
  opacity: 0.6;
}

.recipe-result {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #444;
}

.result-icon {
  font-size: 32px;
}

.result-name {
  font-size: 18px;
  font-weight: bold;
  flex: 1;
}

.result-count {
  font-size: 16px;
  color: #aaa;
}

.recipe-requirements {
  margin-bottom: 15px;
}

.requirements-label {
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
}

.requirement {
  font-size: 14px;
  padding: 5px;
  margin: 3px 0;
  border-radius: 3px;
}

.requirement.satisfied {
  color: #4CAF50;
}

.requirement.missing {
  color: #f44336;
}

.requirement-count {
  float: right;
  color: #aaa;
}

.craft-button {
  width: 100%;
  padding: 10px;
  background: #4CAF50;
  border: none;
  color: white;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;
}

.craft-button:hover:not(:disabled) {
  background: #45a049;
}

.craft-button:disabled {
  background: #555;
  cursor: not-allowed;
}

/* Pause Menu */
.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
}

.pause-menu {
  background: #1a1a1a;
  border: 3px solid #444;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  min-width: 400px;
}

.pause-menu h2 {
  font-size: 36px;
  margin-bottom: 30px;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.menu-button {
  padding: 15px 30px;
  font-size: 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
  background: #444;
  color: white;
}

.menu-button:hover {
  background: #555;
  transform: translateY(-2px);
}

.menu-button.primary {
  background: #4CAF50;
}

.menu-button.primary:hover {
  background: #45a049;
}

.menu-button.danger {
  background: #d32f2f;
}

.menu-button.danger:hover {
  background: #b71c1c;
}

.controls-reference {
  text-align: left;
  background: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
}

.controls-reference h3 {
  margin-bottom: 15px;
  text-align: center;
}

.control-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #444;
}

.control-row:last-child {
  border-bottom: none;
}

.key {
  background: #444;
  padding: 3px 10px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 14px;
}

/* Game Over / Victory */
.game-over-overlay, .victory-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
}

.game-over-panel, .victory-panel {
  background: #1a1a1a;
  border: 3px solid #444;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  max-width: 600px;
}

.game-over-title {
  font-size: 48px;
  color: #d32f2f;
  margin-bottom: 10px;
}

.victory-title {
  font-size: 48px;
  color: #4CAF50;
  margin-bottom: 10px;
}

.game-over-subtitle, .victory-subtitle {
  font-size: 20px;
  color: #aaa;
  margin-bottom: 30px;
}

.victory-message {
  margin-bottom: 30px;
  text-align: left;
}

.victory-message p {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #ccc;
}

.statistics {
  background: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.statistics h3 {
  margin-bottom: 15px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #444;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  color: #aaa;
}

.stat-value {
  color: #fff;
  font-weight: bold;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-card {
  background: #333;
  padding: 20px;
  border-radius: 8px;
  border: 2px solid #555;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #4CAF50;
}

.stat-label {
  font-size: 14px;
  color: #aaa;
}

.restart-button {
  padding: 15px 40px;
  font-size: 20px;
  background: #4CAF50;
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;
}

.restart-button:hover {
  background: #45a049;
}

/* Main Menu */
.main-menu {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%);
}

.menu-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 107, 53, 0.3), transparent 50%);
  animation: pulse 10s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

.menu-content {
  position: relative;
  z-index: 1;
  background: rgba(26, 26, 26, 0.9);
  border: 3px solid #444;
  border-radius: 10px;
  padding: 60px;
  text-align: center;
  min-width: 500px;
}

.game-title {
  font-size: 64px;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #4CAF50, #2196F3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.game-subtitle {
  font-size: 24px;
  color: #aaa;
  margin-bottom: 40px;
}

.game-description {
  margin-top: 40px;
  text-align: left;
  padding: 20px;
  background: #2a2a2a;
  border-radius: 8px;
}

.game-description h3 {
  margin-bottom: 10px;
  text-align: center;
}

.game-description p {
  line-height: 1.6;
  color: #ccc;
}

/* Load Game Menu */
.load-game-menu {
  max-width: 700px;
}

.load-game-menu h2 {
  margin-bottom: 20px;
}

.save-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.save-item {
  background: #2a2a2a;
  border: 2px solid #555;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: border-color 0.2s;
}

.save-item:hover {
  border-color: #888;
}

.save-info {
  flex: 1;
  text-align: left;
}

.save-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.save-day {
  font-size: 18px;
  font-weight: bold;
}

.save-date {
  font-size: 12px;
  color: #888;
}

.save-stats {
  font-size: 14px;
  color: #aaa;
}

.save-stats span {
  margin-right: 15px;
}

.save-actions {
  display: flex;
  gap: 10px;
}

.load-button, .delete-button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.load-button {
  background: #4CAF50;
  color: white;
}

.load-button:hover {
  background: #45a049;
}

.delete-button {
  background: #d32f2f;
  color: white;
}

.delete-button:hover {
  background: #b71c1c;
}

.back-button {
  padding: 10px 30px;
  background: #666;
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.back-button:hover {
  background: #777;
}
```

---

## 13. Additional Implementation Details

### 13.1 World Generation (`game/world/MapGenerator.ts`)

```typescript
class MapGenerator {
  private seed: number;
  private width: number;
  private height: number;
  
  constructor(seed: number, width: number, height: number) {
    this.seed = seed;
    this.width = width;
    this.height = height;
  }
  
  generate(): WorldState {
    // Generate child positions scattered across map
    const childrenPositions = this.generateChildrenPositions();
    
    return {
      seed: this.seed,
      width: this.width,
      height: this.height,
      campfirePosition: null,
      childrenPositions,
      childrenRescued: [false, false, false, false],
    };
  }
  
  private generateChildrenPositions(): Vector2D[] {
    const positions: Vector2D[] = [];
    const quadrants = [
      { x: 0.25, y: 0.25 },
      { x: 0.75, y: 0.25 },
      { x: 0.25, y: 0.75 },
      { x: 0.75, y: 0.75 },
    ];
    
    for (const quad of quadrants) {
      positions.push({
        x: quad.x * this.width + (Math.random() - 0.5) * this.width * 0.2,
        y: quad.y * this.height + (Math.random() - 0.5) * this.height * 0.2,
      });
    }
    
    return positions;
  }
  
  // Could add terrain features, obstacles, etc.
  generateTerrain(): void {
    // Optional: Add trees, rocks, water as obstacles
  }
}
```

### 13.2 Particle System (`game/rendering/ParticleSystem.ts`)

```typescript
interface Particle {
  position: Vector2D;
  velocity: Vector2D;
  lifetime: number;
  maxLifetime: number;
  color: string;
  size: number;
}

class ParticleSystem {
  private particles: Particle[] = [];
  
  emit(config: {
    position: Vector2D;
    count: number;
    color: string;
    velocityRange: { min: number; max: number };
    lifetime: number;
  }): void {
    for (let i = 0; i < config.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = config.velocityRange.min + 
                    Math.random() * (config.velocityRange.max - config.velocityRange.min);
      
      this.particles.push({
        position: { ...config.position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        lifetime: config.lifetime,
        maxLifetime: config.lifetime,
        color: config.color,
        size: 3 + Math.random() * 3,
      });
    }
  }
  
  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      particle.position.x += particle.velocity.x * deltaTime;
      particle.position.y += particle.velocity.y * deltaTime;
      particle.lifetime -= deltaTime;
      
      // Apply gravity/wind
      particle.velocity.y += 50 * deltaTime;
      
      // Fade out
      if (particle.lifetime <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    for (const particle of this.particles) {
      const screenPos = camera.worldToScreen(particle.position);
      const alpha = particle.lifetime / particle.maxLifetime;
      
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  }
}
```

### 13.3 Sound System (Optional Enhancement)

```typescript
class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private volume: number = 0.5;
  
  loadSound(id: string, url: string): void {
    const audio = new Audio(url);
    audio.volume = this.volume;
    this.sounds.set(id, audio);
  }
  
  play(id: string, loop: boolean = false): void {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.currentTime = 0;
      sound.loop = loop;
      sound.play().catch(e => console.warn('Audio play failed:', e));
    }
  }
  
  stop(id: string): void {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }
  
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    for (const sound of this.sounds.values()) {
      sound.volume = this.volume;
    }
  }
}

// Usage:
// soundManager.loadSound('ambience', '/sounds/forest_ambience.mp3');
// soundManager.play('ambience', true);
```

---

## 14. Setup Instructions

### 14.1 Project Initialization

```bash
# Create Vite project with React + TypeScript
npm create vite@latest 99-nights-game -- --template react-ts

cd 99-nights-game

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### 14.2 `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // For static hosting
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
```

### 14.3 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 15. Implementation Checklist

### Phase 1: Core Engine
- [ ] Set up project structure
- [ ] Implement base Entity class
- [ ] Create GameEngine with game loop
- [ ] Implement InputManager
- [ ] Create Camera system
- [ ] Build Collision system

### Phase 2: Player & World
- [ ] Implement Player entity
- [ ] Create World generator
- [ ] Add movement and controls
- [ ] Implement day/night cycle
- [ ] Add campfire placement

### Phase 3: Enemies
- [ ] Create base Creature class
- [ ] Implement Wolf, Bear, Fox
- [ ] Build AI system
- [ ] Create Deer monster
- [ ] Create Owl monster
- [ ] Implement light avoidance

### Phase 4: Resources & Crafting
- [ ] Build ResourceManager
- [ ] Implement resource spawning
- [ ] Create InventorySystem
- [ ] Build CraftingSystem
- [ ] Add weapon system

### Phase 5: UI
- [ ] Create HUD component
- [ ] Build Inventory UI
- [ ] Create Crafting menu
- [ ] Add Pause menu
- [ ] Create Game Over/Victory screens
- [ ] Build Main Menu

### Phase 6: Persistence
- [ ] Implement IndexedDBManager
- [ ] Create SaveSystem
- [ ] Add auto-save functionality
- [ ] Implement save/load UI

### Phase 7: Polish
- [ ] Add particle effects
- [ ] Implement visual feedback
- [ ] Add sound effects (optional)
- [ ] Optimize rendering
- [ ] Balance game difficulty
- [ ] Playtesting and bug fixes

---

This comprehensive plan provides all the structure, logic, and implementation details needed for an LLM to build the complete game. The modular architecture allows for incremental development and testing of each system independently before integration.