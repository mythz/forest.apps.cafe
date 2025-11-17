import React from 'react';
import { InventoryState } from '../../types/gameTypes';
import { ItemType } from '../../types/itemTypes';
import { ITEMS } from '../../constants/items';

interface InventoryProps {
  inventory: InventoryState;
  onClose: () => void;
  onUseItem: (item: ItemType) => void;
  onEquipWeapon: (weapon: string) => void;
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
    <div className="inventory-overlay" onClick={onClose}>
      <div className="inventory-panel" onClick={(e) => e.stopPropagation()}>
        <div className="inventory-header">
          <h2>Inventory</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="inventory-grid">
          {items.map((item) => (
            <div key={item.type} className="inventory-item">
              <div className="item-icon">{item.type.charAt(0).toUpperCase()}</div>
              <div className="item-info">
                <div className="item-name">{item.definition.name}</div>
                <div className="item-description">{item.definition.description}</div>
                <div className="item-count">x{item.count}</div>
              </div>
              <div className="item-actions">
                {item.definition.category === 'weapon' && (
                  <button
                    className="item-button"
                    onClick={() => onEquipWeapon(item.type)}
                  >
                    {inventory.equippedWeapon === item.type ? 'Equipped' : 'Equip'}
                  </button>
                )}
                {(item.definition.category === 'consumable' || item.type === ItemType.FUEL) && (
                  <button
                    className="item-button"
                    onClick={() => onUseItem(item.type)}
                  >
                    Use
                  </button>
                )}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="empty-inventory">
              <p>Inventory is empty</p>
              <p>Collect resources to fill your inventory</p>
            </div>
          )}
        </div>

        <div className="inventory-footer">
          <p>Press [I] to close inventory</p>
        </div>
      </div>
    </div>
  );
};
