export type CharacterState = {
  x: number;
  y: number;
  health: number;
  facing: 'left' | 'right';
  state: 'idle' | 'walking' | 'jumping' | 'crouching' | 'attacking' | 'blocking';
};

export abstract class Fighter {
  protected x: number = 0;
  protected y: number = 0;
  protected health: number = 100;
  protected facing: 'left' | 'right' = 'right';
  protected state: CharacterState['state'] = 'idle';
  
  // Base stats
  protected walkSpeed: number = 5;
  protected jumpForce: number = 20;
  protected gravity: number = 0.8;
  protected groundY: number = 600; // Will be adjusted based on stage

  // Hit boxes
  protected hurtBox: { x: number; y: number; width: number; height: number } = {
    x: 0, y: 0, width: 60, height: 150
  };

  constructor(startX: number, startY: number, facing: 'left' | 'right') {
    this.x = startX;
    this.y = startY;
    this.facing = facing;
  }

  public update(deltaTime: number) {
    this.updatePhysics(deltaTime);
    this.updateState();
  }

  protected updatePhysics(deltaTime: number) {
    // Basic physics update
    if (this.y < this.groundY) {
      this.y += this.gravity * deltaTime;
    }
  }

  protected updateState() {
    // Will be implemented: Update character state based on inputs and current conditions
  }

  public getState(): CharacterState {
    return {
      x: this.x,
      y: this.y,
      health: this.health,
      facing: this.facing,
      state: this.state
    };
  }

  // Abstract methods to be implemented by specific characters
  abstract punch(): void;
  abstract kick(): void;
  abstract special(): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
}

// Example of a specific character implementation (will be expanded)
export class Ryu extends Fighter {
  constructor(startX: number, startY: number, facing: 'left' | 'right') {
    super(startX, startY, facing);
  }

  punch() {
    if (this.state !== 'attacking') {
      this.state = 'attacking';
      // Will implement punch animation and hitbox
    }
  }

  kick() {
    if (this.state !== 'attacking') {
      this.state = 'attacking';
      // Will implement kick animation and hitbox
    }
  }

  special() {
    if (this.state !== 'attacking') {
      this.state = 'attacking';
      // Will implement Hadoken
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    // Temporary rendering for testing
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.x, this.y - this.hurtBox.height, this.hurtBox.width, this.hurtBox.height);
  }
}
