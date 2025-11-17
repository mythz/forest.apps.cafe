import React from 'react';
import { PlayerState, DayNightState, InventoryState } from '../../types/gameTypes';

interface HUDProps {
  player: PlayerState;
  dayNightCycle: DayNightState;
  inventory: InventoryState;
  childrenRescued: number;
}

export const HUD: React.FC<HUDProps> = ({ player, dayNightCycle, inventory, childrenRescued }) => {
  const healthPercent = (player.health / player.maxHealth) * 100;
  const fuelPercent = (player.flashlightFuel / player.maxFlashlightFuel) * 100;

  return (
    <div className="hud">
      <div className="hud-top">
        <div className="stat-panel">
          <div className="stat-label">Health</div>
          <div className="stat-bar">
            <div className="stat-bar-fill health" style={{ width: `${healthPercent}%` }} />
          </div>
          <div className="stat-value">{Math.floor(player.health)} / {player.maxHealth}</div>
        </div>

        {player.hasFlashlight && (
          <div className="stat-panel">
            <div className="stat-label">Flashlight Fuel</div>
            <div className="stat-bar">
              <div className="stat-bar-fill fuel" style={{ width: `${fuelPercent}%` }} />
            </div>
            <div className="stat-value">{Math.floor(player.flashlightFuel)} / {player.maxFlashlightFuel}</div>
          </div>
        )}
      </div>

      <div className="hud-top-right">
        <div className="day-counter">
          <div className="day-label">Day</div>
          <div className="day-value">{dayNightCycle.currentDay} / 99</div>
        </div>

        <div className={`time-indicator ${dayNightCycle.isNight ? 'night' : 'day'}`}>
          {dayNightCycle.isNight ? 'NIGHT' : 'DAY'}
        </div>

        <div className="children-counter">
          <div className="children-label">Children Rescued</div>
          <div className="children-value">{childrenRescued} / 4</div>
        </div>
      </div>

      <div className="hud-bottom">
        <div className="hotkey-hints">
          <div className="hint">[E] Interact</div>
          <div className="hint">[I] Inventory</div>
          <div className="hint">[C] Crafting</div>
          <div className="hint">[F] Flashlight</div>
          <div className="hint">[Q] Use Food</div>
        </div>

        {inventory.equippedWeapon && (
          <div className="equipped-weapon">
            Equipped: {inventory.equippedWeapon}
          </div>
        )}
      </div>
    </div>
  );
};
