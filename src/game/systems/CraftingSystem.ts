import { Recipe, ItemType } from '../../types/itemTypes';
import { RECIPES } from '../../constants/recipes';
import { InventorySystem } from './InventorySystem';

export class CraftingSystem {
  private recipes: Recipe[];

  constructor() {
    this.recipes = RECIPES;
  }

  public canCraft(recipeId: string, inventory: InventorySystem): boolean {
    const recipe = this.recipes.find((r) => r.id === recipeId);
    if (!recipe) return false;

    for (const [itemType, required] of Object.entries(recipe.requirements)) {
      if (!inventory.hasItem(itemType as ItemType, required as number)) {
        return false;
      }
    }

    return true;
  }

  public craft(recipeId: string, inventory: InventorySystem): boolean {
    const recipe = this.recipes.find((r) => r.id === recipeId);
    if (!recipe) return false;

    if (!this.canCraft(recipeId, inventory)) {
      return false;
    }

    // Remove ingredients
    for (const [itemType, required] of Object.entries(recipe.requirements)) {
      inventory.removeItem(itemType as ItemType, required as number);
    }

    // Add result
    inventory.addItem(recipe.result, recipe.resultCount);

    return true;
  }

  public getAvailableRecipes(inventory: InventorySystem): Recipe[] {
    return this.recipes.filter((recipe) => this.canCraft(recipe.id, inventory));
  }

  public getAllRecipes(): Recipe[] {
    return [...this.recipes];
  }

  public getRecipe(recipeId: string): Recipe | undefined {
    return this.recipes.find((r) => r.id === recipeId);
  }
}
