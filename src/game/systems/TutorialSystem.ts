export interface TutorialHint {
  id: string;
  text: string;
  condition: () => boolean;
  shown: boolean;
  priority: number;
}

export class TutorialSystem {
  private hints: TutorialHint[] = [];
  private shownHints: Set<string> = new Set();
  private currentHint: TutorialHint | null = null;
  private hintTimer: number = 0;
  private hintDuration: number = 5; // seconds

  constructor() {
    this.initializeHints();
  }

  private initializeHints(): void {
    // Hints will be checked in order of priority
    this.hints = [
      {
        id: 'welcome',
        text: 'Welcome to the forest! Use WASD to move around.',
        condition: () => true,
        shown: false,
        priority: 1,
      },
      {
        id: 'collect_resources',
        text: 'Press E near glowing items to collect resources!',
        condition: () => !this.shownHints.has('collect_resources'),
        shown: false,
        priority: 2,
      },
      {
        id: 'night_coming',
        text: 'Night is coming! Monsters will spawn in darkness.',
        condition: () => false, // Will be triggered by game state
        shown: false,
        priority: 3,
      },
      {
        id: 'flashlight',
        text: 'Press F to toggle your flashlight. It keeps monsters away!',
        condition: () => !this.shownHints.has('flashlight'),
        shown: false,
        priority: 4,
      },
      {
        id: 'crafting',
        text: 'Press C to open crafting menu and create weapons!',
        condition: () => !this.shownHints.has('crafting'),
        shown: false,
        priority: 5,
      },
      {
        id: 'campfire',
        text: 'Craft a campfire to create a safe zone!',
        condition: () => !this.shownHints.has('campfire'),
        shown: false,
        priority: 6,
      },
      {
        id: 'children',
        text: 'Find and rescue the 4 lost children marked with !',
        condition: () => !this.shownHints.has('children'),
        shown: false,
        priority: 7,
      },
      {
        id: 'sprint',
        text: 'Hold Shift to sprint when escaping danger!',
        condition: () => !this.shownHints.has('sprint'),
        shown: false,
        priority: 8,
      },
      {
        id: 'food',
        text: 'Press Q to consume food and restore health!',
        condition: () => !this.shownHints.has('food'),
        shown: false,
        priority: 9,
      },
      {
        id: 'dash',
        text: 'Press SPACE to dash and dodge attacks! (3s cooldown)',
        condition: () => !this.shownHints.has('dash'),
        shown: false,
        priority: 10,
      },
    ];
  }

  public update(deltaTime: number): void {
    if (this.currentHint) {
      this.hintTimer += deltaTime;
      if (this.hintTimer >= this.hintDuration) {
        this.currentHint = null;
        this.hintTimer = 0;
      }
    } else {
      // Check for next hint to show
      for (const hint of this.hints) {
        if (!hint.shown && hint.condition()) {
          this.showHint(hint);
          break;
        }
      }
    }
  }

  public showHint(hint: TutorialHint): void {
    this.currentHint = hint;
    this.hintTimer = 0;
    hint.shown = true;
    this.shownHints.add(hint.id);
  }

  public triggerHint(id: string): void {
    const hint = this.hints.find((h) => h.id === id);
    if (hint && !hint.shown) {
      this.showHint(hint);
    }
  }

  public getCurrentHint(): string | null {
    return this.currentHint ? this.currentHint.text : null;
  }

  public dismissCurrentHint(): void {
    this.currentHint = null;
    this.hintTimer = 0;
  }
}
