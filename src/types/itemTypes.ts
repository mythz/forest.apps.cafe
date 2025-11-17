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

export type WeaponType =
  | ItemType.SPEAR
  | ItemType.RIFLE
  | ItemType.REVOLVER
  | ItemType.SWORD
  | ItemType.KUNAI;

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
  durability: number | null; // null = infinite
  ammoType?: ItemType;
}

export interface Recipe {
  id: string;
  result: ItemType;
  resultCount: number;
  requirements: { [key in ItemType]?: number };
}
