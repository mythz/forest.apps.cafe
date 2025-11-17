import { Vector2D } from '../../types/gameTypes';
import { Camera } from '../core/Camera';

interface Particle {
  position: Vector2D;
  velocity: Vector2D;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  public createParticles(
    position: Vector2D,
    count: number,
    color: string,
    life: number
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 100 + 50;

      this.particles.push({
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        life,
        maxLife: life,
        size: Math.random() * 3 + 2,
        color,
      });
    }
  }

  public update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      particle.position.x += particle.velocity.x * deltaTime;
      particle.position.y += particle.velocity.y * deltaTime;
      particle.life -= deltaTime;

      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    for (const particle of this.particles) {
      const screenPos = camera.worldToScreen(particle.position);
      const alpha = particle.life / particle.maxLife;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}
