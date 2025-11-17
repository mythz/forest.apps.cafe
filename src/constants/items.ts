import { ItemType, ItemDefinition, WeaponStats } from '../types/itemTypes';

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
  [ItemType.SPEAR]: {
    id: ItemType.SPEAR,
    name: 'Spear',
    description: 'Simple melee weapon',
    stackable: false,
    maxStack: 1,
    category: 'weapon',
  },
  [ItemType.RIFLE]: {
    id: ItemType.RIFLE,
    name: 'Rifle',
    description: 'Long-range weapon with high damage',
    stackable: false,
    maxStack: 1,
    category: 'weapon',
  },
  [ItemType.REVOLVER]: {
    id: ItemType.REVOLVER,
    name: 'Revolver',
    description: 'Mid-range weapon with fast fire rate',
    stackable: false,
    maxStack: 1,
    category: 'weapon',
  },
  [ItemType.SWORD]: {
    id: ItemType.SWORD,
    name: 'Sword',
    description: 'Fast melee weapon',
    stackable: false,
    maxStack: 1,
    category: 'weapon',
  },
  [ItemType.KUNAI]: {
    id: ItemType.KUNAI,
    name: 'Kunai',
    description: 'Throwable weapon',
    stackable: true,
    maxStack: 20,
    category: 'weapon',
  },
  [ItemType.CAMPFIRE_KIT]: {
    id: ItemType.CAMPFIRE_KIT,
    name: 'Campfire Kit',
    description: 'Creates a safe zone',
    stackable: false,
    maxStack: 1,
    category: 'tool',
  },
};

export const WEAPONS: { [key: string]: WeaponStats } = {
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

export const FOOD_HEAL_AMOUNT = 25;
export const FUEL_REFILL_AMOUNT = 20;
