import React from 'react';
import { WorldState, PlayerState, Vector2D } from '../../types/gameTypes';

interface MinimapProps {
  world: WorldState;
  player: PlayerState;
  children: Vector2D[];
}

export const Minimap: React.FC<MinimapProps> = ({ world, player, children }) => {
  const minimapSize = 150;
  const worldSize = Math.max(world.width, world.height);

  const playerX = (player.position.x / worldSize) * minimapSize;
  const playerY = (player.position.y / worldSize) * minimapSize;

  return (
    <div className="minimap">
      <div className="minimap-container" style={{ width: minimapSize, height: minimapSize }}>
        {/* World border */}
        <div className="minimap-world" />

        {/* Campfire */}
        {world.campfirePosition && (
          <div
            className="minimap-campfire"
            style={{
              left: `${(world.campfirePosition.x / worldSize) * minimapSize}px`,
              top: `${(world.campfirePosition.y / worldSize) * minimapSize}px`,
            }}
          />
        )}

        {/* Children */}
        {children.map((child, index) => (
          !world.childrenRescued[index] && (
            <div
              key={index}
              className="minimap-child"
              style={{
                left: `${(child.x / worldSize) * minimapSize}px`,
                top: `${(child.y / worldSize) * minimapSize}px`,
              }}
            />
          )
        ))}

        {/* Player */}
        <div
          className="minimap-player"
          style={{
            left: `${playerX}px`,
            top: `${playerY}px`,
          }}
        />
      </div>
      <div className="minimap-label">Minimap</div>
    </div>
  );
};
