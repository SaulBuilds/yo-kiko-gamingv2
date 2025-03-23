import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GameState } from '@/types/game';
import { ErrorBoundary } from 'react-error-boundary';

function Box() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

function Scene() {
  return (
    <Suspense fallback={null}>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <Box />
    </Suspense>
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
  return (
    <div className="w-full h-[600px] bg-background">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="w-full h-full" style={{ touchAction: 'none' }}>
          <Canvas
            flat
            legacy={false}
            dpr={[1, 2]}
            camera={{
              fov: 75,
              near: 0.1,
              far: 1000,
              position: [0, 0, 5]
            }}
          >
            <Scene />
            <OrbitControls 
              enableZoom={false}
              enablePan={false}
            />
          </Canvas>
        </div>
      </ErrorBoundary>

      <div className="absolute bottom-4 left-4 bg-black/50 p-4 rounded backdrop-blur-sm">
        <p className="text-primary text-lg font-bold pixel-font">Score: {initialState.score}</p>
        <p className="text-muted-foreground pixel-font">Level: {initialState.level}</p>
      </div>
    </div>
  );
}