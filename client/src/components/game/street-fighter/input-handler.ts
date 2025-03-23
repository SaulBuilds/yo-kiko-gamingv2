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
    'KeyX': 'punch',    // X key for punch
    'KeyC': 'kick',     // C key for kick
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

  private inputBuffer: string[] = [];
  private lastInputTime: number = 0;
  private readonly INPUT_BUFFER_TIMEOUT = 500; // Time window for combos in milliseconds

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
      this.addToInputBuffer(input);
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    const input = this.keyMap[event.code];
    if (input) {
      this.inputState[input] = false;
    }
  }

  private addToInputBuffer(input: keyof InputMap) {
    const currentTime = Date.now();

    // Clear buffer if too much time has passed
    if (currentTime - this.lastInputTime > this.INPUT_BUFFER_TIMEOUT) {
      this.inputBuffer = [];
    }

    this.inputBuffer.push(input);
    this.lastInputTime = currentTime;

    // Keep only last 10 inputs
    if (this.inputBuffer.length > 10) {
      this.inputBuffer.shift();
    }
  }

  public checkForSpecialMove(moveInputs: string[]): boolean {
    const bufferString = this.inputBuffer.join(',');
    const moveString = moveInputs.join(',');
    return bufferString.includes(moveString);
  }

  public getInputState(): InputMap {
    return { ...this.inputState };
  }

  public getInputBuffer(): string[] {
    return [...this.inputBuffer];
  }

  public cleanup() {
    window.removeEventListener('keydown', (e) => this.handleKeyDown(e));
    window.removeEventListener('keyup', (e) => this.handleKeyUp(e));
  }
}