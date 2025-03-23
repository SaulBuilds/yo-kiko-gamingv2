import { useState, useRef, useEffect } from 'react';
import {
  Engine,
  Scene,
  Color3,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  HemisphericLight,
  FreeCamera
} from '@babylonjs/core';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TempleRunnerProps {
  matchId?: string;
  isPractice?: boolean;
  onGameOver?: (score: number) => void;
}

interface GameState {
  score: number;
  isGameOver: boolean;
  distance: number;
  speed: number;
  coins: number;
}

export function TempleRunner({ matchId, isPractice = true, onGameOver }: TempleRunnerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    isGameOver: false,
    distance: 0,
    speed: 5,
    coins: 0
  });

  // Initialize Babylon.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create engine and scene
    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    engineRef.current = engine;
    sceneRef.current = scene;

    // Setup scene
    scene.clearColor = new Color3(0.5, 0.8, 0.9); // Sky blue background

    // Camera
    const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());

    // Light
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Ground
    const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
    const groundMaterial = new StandardMaterial("groundMat", scene);
    groundMaterial.diffuseColor = new Color3(0.3, 0.6, 0.3);
    ground.material = groundMaterial;

    // Player
    const player = MeshBuilder.CreateBox("player", { height: 2, width: 1, depth: 1 }, scene);
    player.position.y = 1;
    const playerMaterial = new StandardMaterial("playerMat", scene);
    playerMaterial.diffuseColor = new Color3(0.4, 0.2, 0);
    player.material = playerMaterial;

    // Game loop
    scene.registerBeforeRender(() => {
      if (!gameState.isGameOver) {
        setGameState(prev => ({
          ...prev,
          distance: prev.distance + (prev.speed * 0.016),
          speed: prev.speed + 0.001,
          score: prev.score + prev.speed * 0.016
        }));
      }
    });

    // Start the render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      engine.resize();
    });

    // Cleanup
    return () => {
      scene.dispose();
      engine.dispose();
    };
  }, []);

  // Update XP mutation
  const updateXpMutation = useMutation({
    mutationFn: async (score: number) => {
      const res = await apiRequest("POST", "/api/user/xp", {
        xp: Math.floor(score / 10),
        isPractice
      });
      if (!res.ok) throw new Error("Failed to update XP");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Score Saved!",
        description: `You earned ${Math.floor(gameState.score / 10)} XP!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGameOver = async () => {
    setGameState(prev => ({ ...prev, isGameOver: true }));
    if (onGameOver) {
      onGameOver(gameState.score);
    }
    if (!isPractice && matchId) {
      try {
        await apiRequest("POST", `/api/matches/${matchId}/finish`, {
          score: gameState.score
        });
      } catch (error) {
        console.error("Failed to save match score:", error);
      }
    }
    await updateXpMutation.mutateAsync(gameState.score);
  };

  return (
    <div className="w-full h-screen relative bg-black">
      {/* Game UI Overlay */}
      <div className="absolute top-4 left-4 z-10 text-white pixel-font">
        <div>Score: {Math.floor(gameState.score)}</div>
        <div>Distance: {Math.floor(gameState.distance)}m</div>
        <div>Speed: {Math.floor(gameState.speed)}m/s</div>
        <div>Coins: {gameState.coins}</div>
      </div>

      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-background p-6 rounded-lg text-center space-y-4">
            <h2 className="text-2xl font-bold pixel-font">Game Over!</h2>
            <p>Final Score: {Math.floor(gameState.score)}</p>
            <p>Distance: {Math.floor(gameState.distance)}m</p>
            <p>Coins: {gameState.coins}</p>
          </div>
        </div>
      )}

      {/* Babylon.js Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}