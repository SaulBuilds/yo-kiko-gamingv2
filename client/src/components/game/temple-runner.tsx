```tsx
import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Track segment for the infinite runner
function TrackSegment({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  return (
    <mesh position={new THREE.Vector3(...position)} rotation={new THREE.Euler(...rotation)}>
      <boxGeometry args={[10, 0.5, 10]} />
      <meshStandardMaterial color="#666" />
    </mesh>
  );
}

// Collectible item
function Collectible({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={ref} position={new THREE.Vector3(...position)}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="gold" />
    </mesh>
  );
}

// Player character (temporary box until we have the model)
function Player() {
  const ref = useRef<THREE.Group>();
  const [position, setPosition] = useState([0, 1, 0]);
  const [isJumping, setIsJumping] = useState(false);
  const [isDucking, setIsDucking] = useState(false);
  const speed = useRef(0.1);
  const score = useRef(0);

  useFrame((state, delta) => {
    if (ref.current) {
      // Basic forward movement
      ref.current.position.z -= speed.current;
      
      // Gradually increase speed
      speed.current += delta * 0.001;
      
      // Jump animation
      if (isJumping) {
        ref.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 5) * 2;
        if (state.clock.elapsedTime % 1 < 0.1) setIsJumping(false);
      }
      
      // Duck animation
      if (isDucking) {
        ref.current.scale.y = 0.5;
      } else {
        ref.current.scale.y = 1;
      }
    }
  });

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.code) {
        case 'Space':
          setIsJumping(true);
          break;
        case 'ArrowDown':
          setIsDucking(true);
          break;
        case 'ArrowLeft':
          if (position[0] > -1) setPosition([position[0] - 1, position[1], position[2]]);
          break;
        case 'ArrowRight':
          if (position[0] < 1) setPosition([position[0] + 1, position[1], position[2]]);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        setIsDucking(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [position]);

  return (
    <group ref={ref} position={new THREE.Vector3(...position)}>
      <mesh>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="brown" />
      </mesh>
    </group>
  );
}

// Main game component
export function TempleRunner() {
  return (
    <div className="w-full h-screen">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Game elements */}
        <Player />
        <TrackSegment position={[0, 0, 0]} rotation={[0, 0, 0]} />
        <Collectible position={[0, 1, -5]} />
        
        {/* Environment */}
        <gridHelper args={[100, 100]} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
```
