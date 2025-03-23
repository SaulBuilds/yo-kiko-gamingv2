export type InputMap = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  punch: boolean;
  kick: boolean;
  special: boolean;
};

export class InputHandler {
  private keyMap: Record<string, keyof InputMap> = {
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'KeyA': 'punch',    // A key for punch
    'KeyS': 'kick',     // S key for kick
    'KeyD': 'special',  // D key for special
  };

  private inputState: InputMap = {
    up: false,
    down: false,
    left: false,
    right: false,
    punch: false,
    kick: false,
    special: false,
  };

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  private handleKeyDown(event: KeyboardEvent) {
    const input = this.keyMap[event.code];
    if (input) {
      this.inputState[input] = true;
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    const input = this.keyMap[event.code];
    if (input) {
      this.inputState[input] = false;
    }
  }

  public getInputState(): InputMap {
    return { ...this.inputState };
  }

  public cleanup() {
    window.removeEventListener('keydown', (e) => this.handleKeyDown(e));
    window.removeEventListener('keyup', (e) => this.handleKeyUp(e));
  }
}
