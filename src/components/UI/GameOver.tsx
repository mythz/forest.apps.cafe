import React from 'react';
import { GameStatistics } from '../../types/gameTypes';

interface GameOverProps {
  statistics: GameStatistics;
  daysLasted: number;
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ statistics, daysLasted, onRestart }) => {
  return (
    <div className="game-over-overlay">
      <div className="game-over-panel">
        <h1 className="game-over-title">Game Over</h1>
        <p className="game-over-subtitle">
          You survived {daysLasted} night{daysLasted !== 1 ? 's' : ''}
        </p>

        <div className="statistics">
          <h3>Your Statistics</h3>

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

        <button onClick={onRestart} className="restart-button">
          Try Again
        </button>
      </div>
    </div>
  );
};
