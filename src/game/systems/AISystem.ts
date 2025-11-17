import { Vector2D } from '../../types/gameTypes';
import { AIState, CreatureAI } from '../../types/entityTypes';
import { normalize, distance } from '../../utils/math';

export class AISystem {
  public static updateWanderAI(
    ai: CreatureAI,
    _position: Vector2D,
    speed: number,
    deltaTime: number
  ): Vector2D {
    // Change wander direction occasionally
    if (Math.random() < 0.02) {
      ai.wanderAngle = Math.random() * Math.PI * 2;
    }

    const velocity: Vector2D = {
      x: Math.cos(ai.wanderAngle) * speed * deltaTime,
      y: Math.sin(ai.wanderAngle) * speed * deltaTime,
    };

    return velocity;
  }

  public static updateChaseAI(
    position: Vector2D,
    target: Vector2D,
    speed: number,
    deltaTime: number
  ): Vector2D {
    const direction = normalize({
      x: target.x - position.x,
      y: target.y - position.y,
    });

    return {
      x: direction.x * speed * deltaTime,
      y: direction.y * speed * deltaTime,
    };
  }

  public static updateFleeAI(
    position: Vector2D,
    threat: Vector2D,
    speed: number,
    deltaTime: number
  ): Vector2D {
    const direction = normalize({
      x: position.x - threat.x,
      y: position.y - threat.y,
    });

    return {
      x: direction.x * speed * deltaTime,
      y: direction.y * speed * deltaTime,
    };
  }

  public static shouldChasePlayer(
    ai: CreatureAI,
    creaturePos: Vector2D,
    playerPos: Vector2D
  ): boolean {
    return distance(creaturePos, playerPos) <= ai.detectionRadius;
  }

  public static shouldAttack(
    ai: CreatureAI,
    creaturePos: Vector2D,
    targetPos: Vector2D,
    currentTime: number
  ): boolean {
    const dist = distance(creaturePos, targetPos);
    const cooldownPassed = currentTime - ai.lastAttackTime >= ai.attackCooldown * 1000;

    return dist <= ai.attackRadius && cooldownPassed;
  }

  public static determineState(
    ai: CreatureAI,
    creaturePos: Vector2D,
    playerPos: Vector2D,
    isPlayerInLight: boolean,
    avoidLight: boolean = false
  ): AIState {
    // If creature avoids light and player is in light, flee
    if (avoidLight && isPlayerInLight) {
      return AIState.FLEE;
    }

    const distToPlayer = distance(creaturePos, playerPos);

    // Attack if in range
    if (distToPlayer <= ai.attackRadius) {
      return AIState.ATTACK;
    }

    // Chase if player is detected
    if (distToPlayer <= ai.detectionRadius) {
      return AIState.CHASE;
    }

    // Otherwise wander
    return AIState.WANDER;
  }
}
