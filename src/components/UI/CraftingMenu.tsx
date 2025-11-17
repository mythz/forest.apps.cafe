import React from 'react';
import { InventoryState } from '../../types/gameTypes';
import { Recipe, ItemType } from '../../types/itemTypes';
import { ITEMS } from '../../constants/items';

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
      const available = inventory.items[itemType as ItemType] || 0;
      if (available < (required as number)) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="crafting-overlay" onClick={onClose}>
      <div className="crafting-panel" onClick={(e) => e.stopPropagation()}>
        <div className="crafting-header">
          <h2>Crafting</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="recipes-list">
          {recipes.map((recipe) => {
            const craftable = canCraft(recipe);
            const resultItem = ITEMS[recipe.result];

            return (
              <div
                key={recipe.id}
                className={`recipe-item ${craftable ? 'craftable' : 'locked'}`}
              >
                <div className="recipe-result">
                  <div className="recipe-icon">{recipe.result.charAt(0).toUpperCase()}</div>
                  <div className="recipe-name">{resultItem.name}</div>
                  <div className="recipe-count">x{recipe.resultCount}</div>
                </div>

                <div className="recipe-requirements">
                  <div className="requirements-label">Requires:</div>
                  {Object.entries(recipe.requirements).map(([itemType, count]) => {
                    const available = inventory.items[itemType as ItemType] || 0;
                    const required = count as number;
                    const hasEnough = available >= required;

                    return (
                      <div
                        key={itemType}
                        className={`requirement ${hasEnough ? 'has' : 'lacks'}`}
                      >
                        {ITEMS[itemType as ItemType].name}: {available} / {required}
                      </div>
                    );
                  })}
                </div>

                <button
                  className="craft-button"
                  disabled={!craftable}
                  onClick={() => craftable && onCraft(recipe.id)}
                >
                  {craftable ? 'Craft' : 'Insufficient Materials'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="crafting-footer">
          <p>Press [C] to close crafting menu</p>
        </div>
      </div>
    </div>
  );
};
