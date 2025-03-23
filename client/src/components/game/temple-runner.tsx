import { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TempleRunnerProps {
  matchId?: string;
  isPractice?: boolean;
  onGameOver?: (score: number) => void;
}

// Core game state interface
interface GameState {
  score: number;
  isGameOver: boolean;
  distance: number;
  speed: number;
  coins: number;
}

// Game scene setup
function Scene() {
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
      />

      {/* Environment */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4a9" />
      </mesh>

      {/* Player character placeholder */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="brown" />
      </mesh>

      {/* Development helpers */}
      <gridHelper args={[100, 100]} />
      <axesHelper args={[5]} />
    </>
  );
}

export function TempleRunner({ matchId, isPractice = true, onGameOver }: TempleRunnerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    isGameOver: false,
    distance: 0,
    speed: 5,
    coins: 0
  });

  // Game loop ref
  const gameLoopRef = useRef<number>();

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

  // Game loop
  useEffect(() => {
    let lastTime = 0;
    const animate = (time: number) => {
      if (lastTime !== 0) {
        const delta = time - lastTime;
        if (!gameState.isGameOver) {
          setGameState(prev => ({
            ...prev,
            distance: prev.distance + (prev.speed * delta) / 1000,
            speed: prev.speed + (delta / 1000) * 0.1,
            score: prev.score + (delta / 1000) * prev.speed
          }));
        }
      }
      lastTime = time;
      gameLoopRef.current = requestAnimationFrame(animate);
    };

    gameLoopRef.current = requestAnimationFrame(animate);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isGameOver]);

  // Handle game over
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

      {/* 3D Game Canvas */}
      <Canvas
        style={{ background: '#87ceeb' }}
        camera={{ position: [0, 5, 10], fov: 75 }}
      >
        <Scene />
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}