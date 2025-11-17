import { DayNightState } from '../../types/gameTypes';
import { GAME_CONFIG } from '../../constants/gameConfig';

export class DayNightCycle {
  private state: DayNightState;
  private cycleTime: number;
  private totalCycleLength: number;

  constructor(initialState?: DayNightState) {
    this.state = initialState || {
      currentDay: 1,
      timeOfDay: 0.5, // Start at noon
      isNight: false,
      totalDaysPassed: 0,
    };
    this.cycleTime = 0;
    this.totalCycleLength =
      GAME_CONFIG.DAY_NIGHT.DAY_LENGTH + GAME_CONFIG.DAY_NIGHT.NIGHT_LENGTH;
  }

  public update(deltaTime: number): void {
    this.cycleTime += deltaTime;

    // Calculate time of day (0-1)
    const cycleProgress = this.cycleTime / this.totalCycleLength;
    this.state.timeOfDay = cycleProgress;

    // Determine if it's night
    this.state.isNight =
      this.state.timeOfDay < GAME_CONFIG.DAY_NIGHT.DUSK_TIME ||
      this.state.timeOfDay > GAME_CONFIG.DAY_NIGHT.DAWN_TIME;

    // Handle day transition
    if (this.cycleTime >= this.totalCycleLength) {
      this.cycleTime = 0;
      if (this.state.isNight) {
        this.state.currentDay++;
        this.state.totalDaysPassed++;
      }
    }
  }

  public getState(): DayNightState {
    return { ...this.state };
  }

  public isNight(): boolean {
    return this.state.isNight;
  }

  public getCurrentDay(): number {
    return this.state.currentDay;
  }

  public isGameComplete(): boolean {
    return this.state.totalDaysPassed >= GAME_CONFIG.DAY_NIGHT.TOTAL_NIGHTS;
  }

  public getTimeRemaining(): number {
    return this.totalCycleLength - this.cycleTime;
  }

  public getAmbientLight(): number {
    // Return a value between 0 (night) and 1 (day)
    if (!this.state.isNight) return 1;

    const nightProgress =
      this.state.timeOfDay < GAME_CONFIG.DAY_NIGHT.DUSK_TIME
        ? this.state.timeOfDay / GAME_CONFIG.DAY_NIGHT.DUSK_TIME
        : 1 - (this.state.timeOfDay - GAME_CONFIG.DAY_NIGHT.DAWN_TIME) /
          (1 - GAME_CONFIG.DAY_NIGHT.DAWN_TIME);

    return 0.2 + nightProgress * 0.3; // Minimum 20% light at night
  }
}
