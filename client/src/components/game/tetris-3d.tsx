import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GameState } from '@/types/game';
import { ErrorBoundary } from 'react-error-boundary';

// Base game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Basic board component to establish the play area
function Board() {
  return (
    <group>
      {/* Floor grid */}
      <gridHelper 
        args={[BOARD_WIDTH, BOARD_WIDTH, '#666666', '#222222']} 
        position={[0, -0.5, 0]} 
        rotation={[0, 0, 0]}
      />

      {/* Back wall */}
      <mesh position={[0, BOARD_HEIGHT/2 - 0.5, -0.5]} receiveShadow>
        <planeGeometry args={[BOARD_WIDTH, BOARD_HEIGHT]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          transparent 
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

// Main game scene setup
function Scene() {
  return (
    <Suspense fallback={null}>
      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <pointLight 
        position={[10, 10, 10]} 
        intensity={0.8} 
        castShadow
      />
      <pointLight 
        position={[-10, -10, -10]} 
        intensity={0.4} 
        color="#ff61dc"
      />

      {/* Test cube to verify scene is working */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff61dc" />
      </mesh>

      <Board />
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

export function Tetris3D({ 
  initialState,
  onStateChange,
  onGameOver
}: {
  initialState: GameState;
  onStateChange: (state: GameState) => void;
  onGameOver: () => void;
}) {
  return (
    <div className="w-full h-[600px]">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Canvas
          shadows
          camera={{ 
            position: [10, 15, 15],
            fov: 50 
          }}
          className="bg-gradient-to-b from-background to-background/50"
        >
          <Scene />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 4}
          />
        </Canvas>
      </ErrorBoundary>

      <div className="absolute bottom-4 left-4 bg-black/50 p-4 rounded backdrop-blur-sm">
        <p className="text-primary text-lg font-bold pixel-font">
          Score: {initialState.score}
        </p>
        <p className="text-muted-foreground pixel-font">
          Level: {initialState.level}
        </p>
      </div>
    </div>
  );
}