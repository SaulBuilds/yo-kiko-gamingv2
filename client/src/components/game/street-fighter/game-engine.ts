import { createContext, useRef, useEffect } from 'react';

export type GameState = {
  frameCount: number;
  deltaTime: number;
  fps: number;
};

export class StreetFighterEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private fps: number = 60;
  private deltaTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.setupCanvas();
  }

  private setupCanvas() {
    // Set canvas size to 16:9 aspect ratio
    this.canvas.width = 1280;
    this.canvas.height = 720;
    
    // Enable image smoothing for pixel art
    this.ctx.imageSmoothingEnabled = false;
  }

  public start() {
    this.gameLoop(performance.now());
  }

  private gameLoop(timestamp: number) {
    // Calculate delta time and FPS
    this.deltaTime = (timestamp - this.lastFrameTime) / 1000;
    this.fps = 1 / this.deltaTime;
    this.lastFrameTime = timestamp;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update game state
    this.update();
    
    // Render frame
    this.render();
    
    // Schedule next frame
    this.frameCount++;
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  private update() {
    // Will be implemented: Update game physics, character states, etc.
  }

  private render() {
    // Will be implemented: Render background, characters, UI, etc.
  }

  public getState(): GameState {
    return {
      frameCount: this.frameCount,
      deltaTime: this.deltaTime,
      fps: this.fps
    };
  }
}

// Create context for game engine
export const GameEngineContext = createContext<StreetFighterEngine | null>(null);
