import { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { GameState, TetrisPiece } from '@/types/game';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 1; // Using unit size for THREE.js

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
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshPhysicalMaterial 
        color={color}
        metalness={0.8}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.4}
        toneMapped={false}
      />
    </mesh>
  );
}

function GameBoard({ board }: { board: number[][] }) {
  // Create board mesh with slightly darker material for contrast
  return (
    <group position={[-BOARD_WIDTH/2, -BOARD_HEIGHT/2, 0]} rotation={[0.5, 0, 0]}>
      {/* Board background */}
      <mesh position={[BOARD_WIDTH/2, BOARD_HEIGHT/2, -0.5]} receiveShadow>
        <planeGeometry args={[BOARD_WIDTH + 1, BOARD_HEIGHT + 1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Active cells */}
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

      {/* Grid lines */}
      {Array.from({ length: BOARD_WIDTH + 1 }).map((_, i) => (
        <line
          key={`vertical-${i}`}
          position={[i, BOARD_HEIGHT/2, 0]}
          geometry={new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -BOARD_HEIGHT/2, 0),
            new THREE.Vector3(0, BOARD_HEIGHT/2, 0)
          ])}
        >
          <lineBasicMaterial color="#333333" linewidth={1} />
        </line>
      ))}
      {Array.from({ length: BOARD_HEIGHT + 1 }).map((_, i) => (
        <line
          key={`horizontal-${i}`}
          position={[BOARD_WIDTH/2, i, 0]}
          geometry={new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-BOARD_WIDTH/2, 0, 0),
            new THREE.Vector3(BOARD_WIDTH/2, 0, 0)
          ])}
        >
          <lineBasicMaterial color="#333333" linewidth={1} />
        </line>
      ))}
    </group>
  );
}

function CurrentPiece({ piece }: { piece: TetrisPiece }) {
  return (
    <group position={[-BOARD_WIDTH/2 + piece.x, -BOARD_HEIGHT/2 + piece.y, 0]}>
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
    <div className="w-full h-[600px] relative overflow-hidden rounded-lg">
      <Canvas
        shadows
        camera={{ position: [0, 0, 20], fov: 50 }}
        className="bg-background"
      >
        {/* Camera & Controls */}
        <PerspectiveCamera makeDefault position={[0, -8, 20]} />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.5}
          minPolarAngle={Math.PI / 3}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.6} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#ff61dc" />

        {/* Scene */}
        <GameBoard board={gameState.board} />
        {currentPiece && <CurrentPiece piece={currentPiece} />}

        {/* Environment */}
        <fog attach="fog" args={['#000000', 20, 30]} />
      </Canvas>

      {/* Overlay UI */}
      <div className="absolute bottom-4 left-4 bg-black/50 p-4 rounded backdrop-blur-sm">
        <p className="text-primary text-lg font-bold pixel-font">Score: {gameState.score}</p>
        <p className="text-muted-foreground pixel-font">Level: {gameState.level}</p>
      </div>
    </div>
  );
}