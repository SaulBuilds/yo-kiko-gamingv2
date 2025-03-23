import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
import { GameState, TetrisPiece } from '@/types/game';
import * as THREE from 'three';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const TETROMINOS = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: '#FF61DC'
  },
  J: {
    shape: [[1, 0, 0], [1, 1, 1]],
    color: '#1FCFF1'
  },
  L: {
    shape: [[0, 0, 1], [1, 1, 1]],
    color: '#7B61FF'
  },
  O: {
    shape: [[1, 1], [1, 1]],
    color: '#FFEB3B'
  },
  S: {
    shape: [[0, 1, 1], [1, 1, 0]],
    color: '#4CAF50'
  },
  T: {
    shape: [[0, 1, 0], [1, 1, 1]],
    color: '#9C27B0'
  },
  Z: {
    shape: [[1, 1, 0], [0, 1, 1]],
    color: '#FF4D4D'
  }
};

function Block({ position, color }: { position: [number, number, number], color: string }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial 
        color={color}
        metalness={0.6}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function GameBoard({ board }: { board: number[][] }) {
  return (
    <group position={[-BOARD_WIDTH / 2, -BOARD_HEIGHT / 2, 0]} rotation={[0.3, 0, 0]}>
      {board.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <Block
              key={`${x}-${y}`}
              position={[x, y, 0]}
              color={TETROMINOS.I.color}
            />
          ) : null
        )
      )}
    </group>
  );
}

function CurrentPiece({ piece }: { piece: TetrisPiece }) {
  return (
    <group position={[-BOARD_WIDTH / 2 + piece.x, -BOARD_HEIGHT / 2 + piece.y, 0]}>
      {piece.shape.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <Block
              key={`${x}-${y}`}
              position={[x, y, 0]}
              color={piece.color}
            />
          ) : null
        )
      )}
    </group>
  );
}

export function Tetris3D({ initialState, onStateChange, onGameOver }: {
  initialState: GameState;
  onStateChange: (state: GameState) => void;
  onGameOver: () => void;
}) {
  const [gameState, setGameState] = useState(initialState);
  const [currentPiece, setCurrentPiece] = useState<TetrisPiece | null>(null);

  return (
    <div className="w-full h-[600px] bg-card rounded-lg overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 20]} />
        <OrbitControls enableZoom={false} enablePan={false} />

        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff61dc" />

        <GameBoard board={gameState.board} />
        {currentPiece && <CurrentPiece piece={currentPiece} />}

        {/* Grid Helper */}
        <gridHelper 
          args={[BOARD_WIDTH, BOARD_WIDTH]} 
          position={[0, 0, -0.5]} 
          rotation={[0.3, 0, 0]}
        />
      </Canvas>

      <div className="absolute bottom-4 left-4 bg-black/50 p-4 rounded">
        <p className="text-primary text-lg font-bold">Score: {gameState.score}</p>
        <p className="text-muted-foreground">Level: {gameState.level}</p>
      </div>
    </div>
  );
}