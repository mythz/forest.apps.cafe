export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

export class AchievementSystem {
  private achievements: Map<string, Achievement> = new Map();
  private unlockedAchievements: Set<string> = new Set();

  constructor() {
    this.initializeAchievements();
  }

  private initializeAchievements(): void {
    const achievementList: Achievement[] = [
      {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Kill your first creature',
        icon: '⚔️',
        unlocked: false,
      },
      {
        id: 'hunter',
        name: 'Hunter',
        description: 'Kill 10 creatures',
        icon: '🏹',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
      },
      {
        id: 'monster_slayer',
        name: 'Monster Slayer',
        description: 'Kill 50 creatures',
        icon: '🗡️',
        unlocked: false,
        progress: 0,
        maxProgress: 50,
      },
      {
        id: 'first_rescue',
        name: 'Guardian Angel',
        description: 'Rescue your first child',
        icon: '👼',
        unlocked: false,
      },
      {
        id: 'rescuer',
        name: 'Rescuer',
        description: 'Rescue all 4 children',
        icon: '🛡️',
        unlocked: false,
        progress: 0,
        maxProgress: 4,
      },
      {
        id: 'survivor_week',
        name: 'Week Survivor',
        description: 'Survive 7 nights',
        icon: '📅',
        unlocked: false,
        progress: 0,
        maxProgress: 7,
      },
      {
        id: 'survivor_month',
        name: 'Month Survivor',
        description: 'Survive 30 nights',
        icon: '📆',
        unlocked: false,
        progress: 0,
        maxProgress: 30,
      },
      {
        id: 'craftsman',
        name: 'Craftsman',
        description: 'Craft 10 items',
        icon: '🔨',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
      },
      {
        id: 'gatherer',
        name: 'Gatherer',
        description: 'Collect 100 resources',
        icon: '📦',
        unlocked: false,
        progress: 0,
        maxProgress: 100,
      },
      {
        id: 'light_keeper',
        name: 'Light Keeper',
        description: 'Place a campfire',
        icon: '🔥',
        unlocked: false,
      },
      {
        id: 'untouchable',
        name: 'Untouchable',
        description: 'Survive 3 nights without taking damage',
        icon: '🛡️',
        unlocked: false,
        progress: 0,
        maxProgress: 3,
      },
      {
        id: 'arsenal',
        name: 'Arsenal',
        description: 'Craft all weapon types',
        icon: '⚔️',
        unlocked: false,
        progress: 0,
        maxProgress: 5,
      },
    ];

    for (const achievement of achievementList) {
      this.achievements.set(achievement.id, achievement);
    }
  }

  public checkProgress(id: string, value: number): Achievement | null {
    const achievement = this.achievements.get(id);
    if (!achievement || achievement.unlocked) return null;

    if (achievement.maxProgress) {
      achievement.progress = value;
      if (achievement.progress >= achievement.maxProgress) {
        return this.unlock(id);
      }
    }

    return null;
  }

  public unlock(id: string): Achievement | null {
    const achievement = this.achievements.get(id);
    if (!achievement || achievement.unlocked) return null;

    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();
    this.unlockedAchievements.add(id);

    return achievement;
  }

  public getAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  public getUnlockedCount(): number {
    return this.unlockedAchievements.size;
  }

  public getTotalCount(): number {
    return this.achievements.size;
  }

  public getProgress(): number {
    return (this.getUnlockedCount() / this.getTotalCount()) * 100;
  }
}
