import { Camera } from '../core/Camera';

export class ScreenEffects {
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;
  private shakeTimer: number = 0;

  public triggerShake(intensity: number, duration: number): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = 0;
  }

  public update(deltaTime: number): void {
    if (this.shakeTimer < this.shakeDuration) {
      this.shakeTimer += deltaTime;
    }
  }

  public getShakeOffset(): { x: number; y: number } {
    if (this.shakeTimer >= this.shakeDuration) {
      return { x: 0, y: 0 };
    }

    const progress = this.shakeTimer / this.shakeDuration;
    const intensity = this.shakeIntensity * (1 - progress);

    return {
      x: (Math.random() - 0.5) * intensity,
      y: (Math.random() - 0.5) * intensity,
    };
  }
}

export interface FloatingText {
  text: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  life: number;
  maxLife: number;
  color: string;
  fontSize: number;
}

export class FloatingTextManager {
  private texts: FloatingText[] = [];

  public addText(
    text: string,
    x: number,
    y: number,
    color: string = '#fff',
    fontSize: number = 20
  ): void {
    this.texts.push({
      text,
      position: { x, y },
      velocity: { x: (Math.random() - 0.5) * 20, y: -50 },
      life: 1.5,
      maxLife: 1.5,
      color,
      fontSize,
    });
  }

  public update(deltaTime: number): void {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const text = this.texts[i];
      text.position.x += text.velocity.x * deltaTime;
      text.position.y += text.velocity.y * deltaTime;
      text.life -= deltaTime;

      if (text.life <= 0) {
        this.texts.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const text of this.texts) {
      const alpha = text.life / text.maxLife;
      const screenPos = camera.worldToScreen(text.position);

      ctx.globalAlpha = alpha;
      ctx.font = `bold ${text.fontSize}px Arial`;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(text.text, screenPos.x, screenPos.y);
      ctx.fillStyle = text.color;
      ctx.fillText(text.text, screenPos.x, screenPos.y);
    }

    ctx.restore();
  }
}
