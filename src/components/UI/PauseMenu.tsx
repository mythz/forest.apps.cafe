import React from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onSave: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onSave, onMainMenu }) => {
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
            <span className="key">Q</span>
            <span>Use Food</span>
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
