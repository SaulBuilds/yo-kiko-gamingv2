import { Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GameState } from '@/types/game';

// Game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BOARD_DEPTH = 1; // For 3D effect
const COLORS = {
  I: '#FF61DC',
  J: '#1FCFF1',
  L: '#7B61FF',
  O: '#FFEB3B',
  S: '#4CAF50',
  T: '#9C27B0',
  Z: '#FF4D4D'
};

// 3D Block Component
function Block({ position, color }: { position: [number, number, number], color: string }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshPhongMaterial 
        color={color} 
        shininess={50}
        specular="#ffffff"
      />
    </mesh>
  );
}

// Game Board Component
function GameBoard({ board }: { board: number[][] }) {
  return (
    <group rotation={[0.5, 0, 0]}>
      {/* Background board */}
      <mesh position={[BOARD_WIDTH/2 - 0.5, BOARD_HEIGHT/2 - 0.5, -0.5]} receiveShadow>
        <boxGeometry args={[BOARD_WIDTH, BOARD_HEIGHT, 0.2]} />
        <meshPhongMaterial color="#1a1a1a" opacity={0.8} transparent />
      </mesh>

      {/* Active blocks */}
      {board.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <Block
              key={`${x}-${y}`}
              position={[x, y, 0]}
              color={COLORS.I}
            />
          ) : null
        )
      )}
    </group>
  );
}

// Main Scene Component
function Scene({ gameState }: { gameState: GameState }) {
  return (
    <Suspense fallback={null}>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#ff61dc" />

      {/* Game Elements */}
      <GameBoard board={gameState.board} />
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

// Main Component
export function Tetris3D({ 
  initialState,
  onStateChange,
  onGameOver
}: {
  initialState: GameState;
  onStateChange: (state: GameState) => void;
  onGameOver: () => void;
}) {
  const [gameState, setGameState] = useState(initialState);

  // Game update handler
  const updateGameState = useCallback((newState: GameState) => {
    setGameState(newState);
    onStateChange(newState);
  }, [onStateChange]);

  return (
    <div className="w-full h-[600px] bg-background">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="w-full h-full relative">
          <Canvas
            camera={{ 
              position: [0, 0, 20],
              fov: 50
            }}
          >
            <Scene gameState={gameState} />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              maxPolarAngle={Math.PI / 2.5}
              minPolarAngle={Math.PI / 3}
            />
          </Canvas>

          {/* Score Overlay */}
          <div className="absolute bottom-4 left-4 bg-black/50 p-4 rounded backdrop-blur-sm">
            <p className="text-primary text-lg font-bold pixel-font">
              Score: {gameState.score}
            </p>
            <p className="text-muted-foreground pixel-font">
              Level: {gameState.level}
            </p>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}