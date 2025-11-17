import { InventoryState } from '../../types/gameTypes';
import { ItemType, WeaponType } from '../../types/itemTypes';
import { ITEMS } from '../../constants/items';

export class InventorySystem {
  private state: InventoryState;

  constructor(initialState?: InventoryState) {
    this.state = initialState || {
      items: {},
      maxSlots: 20,
      equippedWeapon: null,
    };
  }

  public addItem(itemType: ItemType, amount: number = 1): boolean {
    const item = ITEMS[itemType];

    if (!item.stackable && this.hasItem(itemType)) {
      return false; // Can't add non-stackable item if already have one
    }

    const currentAmount = this.state.items[itemType] || 0;

    if (item.stackable) {
      const newAmount = Math.min(currentAmount + amount, item.maxStack);
      this.state.items[itemType] = newAmount;
      return true;
    } else {
      this.state.items[itemType] = 1;
      return true;
    }
  }

  public removeItem(itemType: ItemType, amount: number = 1): boolean {
    const currentAmount = this.state.items[itemType] || 0;

    if (currentAmount < amount) {
      return false;
    }

    const newAmount = currentAmount - amount;
    if (newAmount <= 0) {
      delete this.state.items[itemType];
    } else {
      this.state.items[itemType] = newAmount;
    }

    return true;
  }

  public hasItem(itemType: ItemType, amount: number = 1): boolean {
    return (this.state.items[itemType] || 0) >= amount;
  }

  public getItemCount(itemType: ItemType): number {
    return this.state.items[itemType] || 0;
  }

  public equipWeapon(weaponType: WeaponType): boolean {
    if (!this.hasItem(weaponType)) {
      return false;
    }

    this.state.equippedWeapon = weaponType;
    return true;
  }

  public unequipWeapon(): void {
    this.state.equippedWeapon = null;
  }

  public getEquippedWeapon(): WeaponType | null {
    return this.state.equippedWeapon as WeaponType | null;
  }

  public getState(): InventoryState {
    return {
      items: { ...this.state.items },
      maxSlots: this.state.maxSlots,
      equippedWeapon: this.state.equippedWeapon,
    };
  }

  public getItemList(): Array<{ type: ItemType; count: number }> {
    return Object.entries(this.state.items).map(([type, count]) => ({
      type: type as ItemType,
      count,
    }));
  }
}
