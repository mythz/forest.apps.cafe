import { Entity } from './Entity';
import { GameState, PlayerState } from '../../types/gameTypes';
import { EntityType, EntityState } from '../../types/entityTypes';
import { Camera } from '../core/Camera';
import { InputManager } from '../core/InputManager';
import { GAME_CONFIG, CONTROLS } from '../../constants/gameConfig';
import { FOOD_HEAL_AMOUNT, FUEL_REFILL_AMOUNT } from '../../constants/items';

export class Player extends Entity {
  private speed: number;
  private hasFlashlight: boolean;
  private flashlightActive: boolean;
  private flashlightFuel: number;
  private maxFlashlightFuel: number;
  private inputManager: InputManager;
  public isMoving: boolean = false;

  // Dash ability
  private dashCooldown: number = 3; // seconds
  private lastDashTime: number = -10;
  private dashSpeed: number = 500;
  private dashDuration: number = 0.2;
  private isDashing: boolean = false;
  private dashTimer: number = 0;
  private dashDirection: { x: number; y: number } = { x: 0, y: 0 };

  constructor(state: PlayerState, inputManager: InputManager) {
    const entityState: EntityState = {
      id: 'player',
      type: EntityType.PLAYER,
      position: state.position,
      velocity: { x: 0, y: 0 },
      health: state.health,
      maxHealth: state.maxHealth,
      radius: GAME_CONFIG.PLAYER.RADIUS,
      isActive: true,
      direction: state.direction,
    };

    super(entityState);

    this.speed = state.speed;
    this.hasFlashlight = state.hasFlashlight;
    this.flashlightActive = state.flashlightActive;
    this.flashlightFuel = state.flashlightFuel;
    this.maxFlashlightFuel = state.maxFlashlightFuel;
    this.inputManager = inputManager;
  }

  update(deltaTime: number, _gameState: GameState): void {
    this.handleDash(deltaTime);
    this.handleMovement(deltaTime);
    this.updateFlashlight(deltaTime);
  }

  private handleDash(deltaTime: number): void {
    const currentTime = Date.now() / 1000;

    // Handle dash input
    if (this.inputManager.isKeyPressed(' ') && !this.isDashing) {
      if (currentTime - this.lastDashTime >= this.dashCooldown) {
        this.isDashing = true;
        this.dashTimer = 0;
        this.lastDashTime = currentTime;

        // Get current movement direction
        const vel = { x: 0, y: 0 };
        if (this.inputManager.isKeyDown(CONTROLS.MOVE_UP)) vel.y -= 1;
        if (this.inputManager.isKeyDown(CONTROLS.MOVE_DOWN)) vel.y += 1;
        if (this.inputManager.isKeyDown(CONTROLS.MOVE_LEFT)) vel.x -= 1;
        if (this.inputManager.isKeyDown(CONTROLS.MOVE_RIGHT)) vel.x += 1;

        const length = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
        if (length > 0) {
          this.dashDirection = { x: vel.x / length, y: vel.y / length };
        } else {
          // Dash in facing direction if no input
          this.dashDirection = {
            x: Math.cos(this.direction),
            y: Math.sin(this.direction),
          };
        }
      }
    }

    // Update dash
    if (this.isDashing) {
      this.dashTimer += deltaTime;
      if (this.dashTimer >= this.dashDuration) {
        this.isDashing = false;
        this.dashTimer = 0;
      }
    }
  }

  private handleMovement(deltaTime: number): void {
    // If dashing, use dash velocity
    if (this.isDashing) {
      this.velocity.x = this.dashDirection.x * this.dashSpeed;
      this.velocity.y = this.dashDirection.y * this.dashSpeed;
      this.position.x += this.velocity.x * deltaTime;
      this.position.y += this.velocity.y * deltaTime;
      this.isMoving = true;
      return;
    }

    const vel = { x: 0, y: 0 };

    if (this.inputManager.isKeyDown(CONTROLS.MOVE_UP)) vel.y -= 1;
    if (this.inputManager.isKeyDown(CONTROLS.MOVE_DOWN)) vel.y += 1;
    if (this.inputManager.isKeyDown(CONTROLS.MOVE_LEFT)) vel.x -= 1;
    if (this.inputManager.isKeyDown(CONTROLS.MOVE_RIGHT)) vel.x += 1;

    const length = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
    if (length > 0) {
      vel.x /= length;
      vel.y /= length;
    }

    const isSprinting = this.inputManager.isKeyDown(CONTROLS.SPRINT);
    const speed = this.speed * (isSprinting ? GAME_CONFIG.PLAYER.SPRINT_MULTIPLIER : 1);

    this.velocity.x = vel.x * speed;
    this.velocity.y = vel.y * speed;

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    if (length > 0) {
      this.direction = Math.atan2(vel.y, vel.x);
    }

    this.isMoving = length > 0;
  }

  private updateFlashlight(deltaTime: number): void {
    if (!this.hasFlashlight) return;

    if (this.inputManager.isKeyPressed(CONTROLS.TOGGLE_FLASHLIGHT)) {
      if (this.flashlightFuel > 0) {
        this.flashlightActive = !this.flashlightActive;
      } else {
        this.flashlightActive = false;
      }
    }

    if (this.flashlightActive) {
      this.flashlightFuel = Math.max(
        0,
        this.flashlightFuel - GAME_CONFIG.PLAYER.FLASHLIGHT_DRAIN_RATE * deltaTime
      );
      if (this.flashlightFuel <= 0) {
        this.flashlightActive = false;
      }
    }
  }

  public consumeFood(): boolean {
    if (this.health >= this.maxHealth) return false;

    this.health = Math.min(this.maxHealth, this.health + FOOD_HEAL_AMOUNT);
    return true;
  }

  public refillFlashlight(): void {
    this.flashlightFuel = Math.min(
      this.maxFlashlightFuel,
      this.flashlightFuel + FUEL_REFILL_AMOUNT
    );
  }

  public giveFlashlight(): void {
    this.hasFlashlight = true;
    this.flashlightFuel = GAME_CONFIG.PLAYER.FLASHLIGHT_MAX_FUEL;
  }

  public getPlayerState(): PlayerState {
    return {
      position: { ...this.position },
      health: this.health,
      maxHealth: this.maxHealth,
      speed: this.speed,
      direction: this.direction,
      isMoving: this.isMoving,
      hasFlashlight: this.hasFlashlight,
      flashlightActive: this.flashlightActive,
      flashlightFuel: this.flashlightFuel,
      maxFlashlightFuel: this.maxFlashlightFuel,
    };
  }

  public getDashCooldownProgress(): number {
    const currentTime = Date.now() / 1000;
    const timeSinceDash = currentTime - this.lastDashTime;
    return Math.min(1, timeSinceDash / this.dashCooldown);
  }

  public isDashingNow(): boolean {
    return this.isDashing;
  }

  public isFlashlightActive(): boolean {
    return this.flashlightActive;
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screenPos = camera.worldToScreen(this.position);

    // Draw dash trail if dashing
    if (this.isDashing) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, this.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Draw player circle
    ctx.fillStyle = this.isDashing ? '#00FFFF' : '#4CAF50';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw direction indicator
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y);
    ctx.lineTo(
      screenPos.x + Math.cos(this.direction) * this.radius * 1.5,
      screenPos.y + Math.sin(this.direction) * this.radius * 1.5
    );
    ctx.stroke();

    // Draw health bar
    const barWidth = 40;
    const barHeight = 5;
    const healthPercent = this.health / this.maxHealth;

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(screenPos.x - barWidth / 2, screenPos.y - this.radius - 10, barWidth, barHeight);

    ctx.fillStyle = '#00FF00';
    ctx.fillRect(
      screenPos.x - barWidth / 2,
      screenPos.y - this.radius - 10,
      barWidth * healthPercent,
      barHeight
    );
  }
}
