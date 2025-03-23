import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GameState } from '@/types/game';
import { ErrorBoundary } from 'react-error-boundary';

function TestScene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
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
        <div style={{ width: '100%', height: '100%' }}>
          <Canvas
            dpr={[1, 2]}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: 'default',
              failIfMajorPerformanceCaveat: false
            }}
            camera={{
              fov: 75,
              position: [0, 0, 5]
            }}
            style={{
              background: '#000'
            }}
          >
            <TestScene />
            <OrbitControls 
              enableZoom={false}
              enablePan={false}
            />
          </Canvas>
        </div>
      </ErrorBoundary>

      <div className="absolute bottom-4 left-4 bg-black/50 p-4 rounded backdrop-blur-sm">
        <p className="text-primary text-lg font-bold pixel-font">Score: {gameState.score}</p>
        <p className="text-muted-foreground pixel-font">Level: {gameState.level}</p>
      </div>
    </div>
  );
}