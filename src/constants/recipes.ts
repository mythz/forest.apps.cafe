import { Recipe, ItemType } from '../types/itemTypes';

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
