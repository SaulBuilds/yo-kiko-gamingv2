import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Ground plane component
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#4a9" />
    </mesh>
  );
}

// Player character
function Player() {
  const ref = useRef<THREE.Group>(null);

  return (
    <group ref={ref} position={[0, 1, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="brown" />
      </mesh>
    </group>
  );
}

// Export the main game component
export function TempleRunner() {
  return (
    <div className="w-full h-screen">
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 75 }}>
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* Scene elements */}
        <Ground />
        <Player />

        {/* Controls */}
        <OrbitControls />

        {/* Helpers */}
        <gridHelper args={[100, 100]} />
        <axesHelper args={[5]} />
      </Canvas>
    </div>
  );
}