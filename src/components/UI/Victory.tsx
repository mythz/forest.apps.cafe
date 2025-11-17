import React from 'react';
import { GameStatistics } from '../../types/gameTypes';

interface VictoryProps {
  statistics: GameStatistics;
  onMainMenu: () => void;
}

export const Victory: React.FC<VictoryProps> = ({ statistics, onMainMenu }) => {
  return (
    <div className="victory-overlay">
      <div className="victory-panel">
        <h1 className="victory-title">Victory!</h1>
        <p className="victory-subtitle">
          You survived 99 nights and rescued all 4 children!
        </p>

        <div className="statistics">
          <h3>Final Statistics</h3>

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
            <span className="stat-value">{Math.floor(statistics.distanceTraveled)} m</span>
          </div>

          <div className="stat-row">
            <span className="stat-label">Damage Dealt:</span>
            <span className="stat-value">{Math.floor(statistics.damageDealt)}</span>
          </div>

          <div className="stat-row">
            <span className="stat-label">Damage Taken:</span>
            <span className="stat-value">{Math.floor(statistics.damageTaken)}</span>
          </div>
        </div>

        <button onClick={onMainMenu} className="menu-button">
          Main Menu
        </button>
      </div>
    </div>
  );
};
