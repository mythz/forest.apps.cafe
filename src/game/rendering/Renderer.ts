import { GameState } from '../../types/gameTypes';
import { Camera } from '../core/Camera';
import { Entity } from '../entities/Entity';
import { GAME_CONFIG } from '../../constants/gameConfig';
import { DayNightCycle } from '../systems/DayNightCycle';
import { LightingSystem } from '../systems/LightingSystem';
import { Resource } from '../systems/ResourceManager';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;

  constructor(ctx: CanvasRenderingContext2D, camera: Camera) {
    this.ctx = ctx;
    this.camera = camera;
  }

  public render(
    gameState: GameState,
    entities: Entity[],
    resources: Resource[],
    dayNightCycle: DayNightCycle,
    lightingSystem: LightingSystem
  ): void {
    this.clearScreen();
    this.renderWorld(gameState, dayNightCycle);
    this.renderResources(resources);
    this.renderEntities(entities);
    this.renderLighting(lightingSystem, gameState, dayNightCycle);
  }

  private clearScreen(): void {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, GAME_CONFIG.RENDERING.CANVAS_WIDTH, GAME_CONFIG.RENDERING.CANVAS_HEIGHT);
  }

  private renderWorld(gameState: GameState, dayNightCycle: DayNightCycle): void {
    const ambientLight = dayNightCycle.getAmbientLight();
    const lightness = Math.floor(20 + ambientLight * 60); // 20-80

    // Draw forest background
    this.ctx.fillStyle = `hsl(120, 30%, ${lightness}%)`;
    this.ctx.fillRect(0, 0, GAME_CONFIG.RENDERING.CANVAS_WIDTH, GAME_CONFIG.RENDERING.CANVAS_HEIGHT);

    // Draw world bounds
    const topLeft = this.camera.worldToScreen({ x: 0, y: 0 });
    const bottomRight = this.camera.worldToScreen({
      x: gameState.world.width,
      y: gameState.world.height,
    });

    this.ctx.strokeStyle = '#444';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(
      topLeft.x,
      topLeft.y,
      bottomRight.x - topLeft.x,
      bottomRight.y - topLeft.y
    );
  }

  private renderResources(resources: Resource[]): void {
    for (const resource of resources) {
      if (!this.camera.isVisible(resource.position)) continue;

      const screenPos = this.camera.worldToScreen(resource.position);

      // Color based on resource type
      let color = '#FFD700';
      switch (resource.type) {
        case 'wood':
          color = '#8B4513';
          break;
        case 'metal':
          color = '#C0C0C0';
          break;
        case 'food':
          color = '#FF6347';
          break;
        case 'fuel':
          color = '#FFD700';
          break;
      }

      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(screenPos.x, screenPos.y, GAME_CONFIG.RESOURCES.RADIUS, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw outline
      this.ctx.strokeStyle = '#FFF';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }

  private renderEntities(entities: Entity[]): void {
    // Sort by Y position for proper layering
    const sorted = [...entities].sort((a, b) => a.position.y - b.position.y);

    for (const entity of sorted) {
      if (!entity.isActive) continue;
      if (!this.camera.isVisible(entity.position, entity.radius + 50)) continue;

      entity.render(this.ctx, this.camera);
    }
  }

  private renderLighting(
    lightingSystem: LightingSystem,
    _gameState: GameState,
    dayNightCycle: DayNightCycle
  ): void {
    if (!dayNightCycle.isNight()) return;

    // Create darkness overlay
    this.ctx.fillStyle = 'rgba(0, 0, 20, 0.7)';
    this.ctx.fillRect(0, 0, GAME_CONFIG.RENDERING.CANVAS_WIDTH, GAME_CONFIG.RENDERING.CANVAS_HEIGHT);

    // Draw light sources
    const lightSources = lightingSystem.getLightSources();

    for (const light of lightSources) {
      if (!this.camera.isVisible(light.position, light.radius)) continue;

      const screenPos = this.camera.worldToScreen(light.position);

      const gradient = this.ctx.createRadialGradient(
        screenPos.x,
        screenPos.y,
        0,
        screenPos.x,
        screenPos.y,
        light.radius
      );

      gradient.addColorStop(0, `rgba(255, 240, 200, ${light.intensity})`);
      gradient.addColorStop(0.5, `rgba(255, 220, 150, ${light.intensity * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');

      this.ctx.globalCompositeOperation = 'lighter';
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(screenPos.x, screenPos.y, light.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalCompositeOperation = 'source-over';
    }
  }
}
