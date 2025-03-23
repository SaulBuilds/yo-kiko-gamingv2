import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GameState } from '@/types/game';
import { ErrorBoundary } from 'react-error-boundary';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

function TestScene() {
  return (
    <>
      <ambientLight />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </>
  );
}

function ErrorFallback({error}: {error: Error}) {
  return (
    <div className="text-center py-4">
      <p className="text-red-500">Error loading 3D scene: {error.message}</p>
    </div>
  );
}

export function Tetris3D({ initialState, onStateChange, onGameOver }: {
  initialState: GameState;
  onStateChange: (state: GameState) => void;
  onGameOver: () => void;
}) {
  const [gameState, setGameState] = useState(initialState);

  return (
    <div className="w-full h-[600px] relative bg-background">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Canvas>
          <TestScene />
          <OrbitControls />
        </Canvas>
      </ErrorBoundary>

      <div className="absolute bottom-4 left-4 bg-black/50 p-4 rounded backdrop-blur-sm">
        <p className="text-primary text-lg font-bold pixel-font">Score: {gameState.score}</p>
        <p className="text-muted-foreground pixel-font">Level: {gameState.level}</p>
      </div>
    </div>
  );
}