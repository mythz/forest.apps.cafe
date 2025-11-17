import { Vector2D } from '../../types/gameTypes';

export class InputManager {
  private keys: Map<string, boolean> = new Map();
  private keysPressed: Map<string, boolean> = new Map();
  private keysReleased: Map<string, boolean> = new Map();
  private mousePosition: Vector2D = { x: 0, y: 0 };
  private mouseButtons: Map<number, boolean> = new Map();
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    const wasDown = this.keys.get(e.key.toLowerCase());
    this.keys.set(e.key.toLowerCase(), true);
    if (!wasDown) {
      this.keysPressed.set(e.key.toLowerCase(), true);
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.set(e.key.toLowerCase(), false);
    this.keysReleased.set(e.key.toLowerCase(), true);
  };

  private handleMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  private handleMouseDown = (e: MouseEvent): void => {
    this.mouseButtons.set(e.button, true);
  };

  private handleMouseUp = (e: MouseEvent): void => {
    this.mouseButtons.set(e.button, false);
  };

  public isKeyDown(key: string): boolean {
    return this.keys.get(key.toLowerCase()) || false;
  }

  public isKeyPressed(key: string): boolean {
    return this.keysPressed.get(key.toLowerCase()) || false;
  }

  public isKeyReleased(key: string): boolean {
    return this.keysReleased.get(key.toLowerCase()) || false;
  }

  public getMousePosition(): Vector2D {
    return { ...this.mousePosition };
  }

  public isMouseButtonDown(button: number): boolean {
    return this.mouseButtons.get(button) || false;
  }

  public update(): void {
    this.keysPressed.clear();
    this.keysReleased.clear();
  }

  public cleanup(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
  }
}
