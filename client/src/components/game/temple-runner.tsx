import { useState, useRef, useEffect } from 'react';
import {
  Engine,
  Scene,
  Color3,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  HemisphericLight,
  FreeCamera,
  FollowCamera,
  TransformNode,
  Animation,
  Mesh,
  ActionManager,
  ExecuteCodeAction
} from '@babylonjs/core';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TempleRunnerProps {
  matchId?: string;
  isPractice?: boolean;
  onGameOver?: (score: number) => void;
}

interface GameState {
  score: number;
  isGameOver: boolean;
  distance: number;
  speed: number;
  coins: number;
}

interface TrackSegment {
  mesh: Mesh;
  coins: Mesh[];
  position: number;
}

const LANE_WIDTH = 2;
const SEGMENT_LENGTH = 20;
const COIN_HEIGHT = 1;
const COIN_SPACING = 5;
const NUM_SEGMENTS = 3;

export function TempleRunner({ matchId, isPractice = true, onGameOver }: TempleRunnerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const playerRef = useRef<TransformNode | null>(null);
  const trackSegmentsRef = useRef<TrackSegment[]>([]);
  const isJumpingRef = useRef(false);
  const isSlidingRef = useRef(false);
  const currentLaneRef = useRef(1); // 0=left, 1=center, 2=right

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    isGameOver: false,
    distance: 0,
    speed: 10,
    coins: 0
  });

  // Create a track segment
  const createTrackSegment = (scene: Scene, position: number) => {
    // Create track base
    const segment = MeshBuilder.CreateBox("track", {
      width: LANE_WIDTH * 3,
      height: 0.5,
      depth: SEGMENT_LENGTH
    }, scene);

    const material = new StandardMaterial("trackMat", scene);
    material.diffuseColor = new Color3(0.4, 0.4, 0.4);
    segment.material = material;
    segment.position = new Vector3(0, -0.25, position);

    // Create coins randomly on the track
    const coins: Mesh[] = [];
    for (let z = 0; z < SEGMENT_LENGTH; z += COIN_SPACING) {
      if (Math.random() < 0.3) { // 30% chance to spawn coin
        const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const coin = MeshBuilder.CreateCylinder("coin", {
          height: 0.2,
          diameter: 0.5
        }, scene);
        const coinMaterial = new StandardMaterial("coinMat", scene);
        coinMaterial.diffuseColor = new Color3(1, 0.8, 0);
        coin.material = coinMaterial;
        coin.position = new Vector3(
          lane * LANE_WIDTH,
          COIN_HEIGHT,
          position + z
        );
        coin.rotation.x = Math.PI / 2;
        coins.push(coin);
      }
    }

    return { mesh: segment, coins, position };
  };

  // Initialize Babylon.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create engine and scene
    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    engineRef.current = engine;
    sceneRef.current = scene;

    // Setup scene
    scene.clearColor = new Color3(0.5, 0.8, 0.9); // Sky blue background

    // Create lights
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Create player
    const player = new TransformNode("player", scene);
    const playerMesh = MeshBuilder.CreateBox("playerMesh", {
      height: 2,
      width: 1,
      depth: 1
    }, scene);
    playerMesh.parent = player;
    playerMesh.position.y = 1;
    const playerMaterial = new StandardMaterial("playerMat", scene);
    playerMaterial.diffuseColor = new Color3(0.4, 0.2, 0);
    playerMesh.material = playerMaterial;
    playerRef.current = player;

    // Create camera
    const camera = new FollowCamera("camera", new Vector3(0, 5, -10), scene);
    camera.lockedTarget = player;
    camera.radius = 15; // Distance from target
    camera.heightOffset = 5; // Height above target
    camera.rotationOffset = 180; // Rotation around target

    // Initialize track segments
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const segment = createTrackSegment(scene, i * SEGMENT_LENGTH);
      trackSegmentsRef.current.push(segment);
    }

    // Input handling
    scene.actionManager = new ActionManager(scene);

    scene.actionManager.registerAction(
      new ExecuteCodeAction(
        { trigger: ActionManager.OnKeyDownTrigger, parameter: "Space" },
        () => {
          if (!isJumpingRef.current && !isSlidingRef.current) {
            isJumpingRef.current = true;
            // Jump animation
            Animation.CreateAndStartAnimation(
              "jump",
              playerRef.current!,
              "position.y",
              60,
              20,
              1,
              3,
              Animation.ANIMATIONLOOPMODE_CONSTANT,
              null,
              () => { isJumpingRef.current = false; }
            );
          }
        }
      )
    );

    // Arrow key controls for lane changing
    const handleKeyDown = (evt: KeyboardEvent) => {
      if (gameState.isGameOver) return;

      switch (evt.key) {
        case "ArrowLeft":
          if (currentLaneRef.current > 0) {
            currentLaneRef.current--;
            const targetX = (currentLaneRef.current - 1) * LANE_WIDTH;
            Animation.CreateAndStartAnimation(
              "moveLeft",
              playerRef.current!,
              "position.x",
              60,
              10,
              playerRef.current!.position.x,
              targetX,
              Animation.ANIMATIONLOOPMODE_CONSTANT
            );
          }
          break;
        case "ArrowRight":
          if (currentLaneRef.current < 2) {
            currentLaneRef.current++;
            const targetX = (currentLaneRef.current - 1) * LANE_WIDTH;
            Animation.CreateAndStartAnimation(
              "moveRight",
              playerRef.current!,
              "position.x",
              60,
              10,
              playerRef.current!.position.x,
              targetX,
              Animation.ANIMATIONLOOPMODE_CONSTANT
            );
          }
          break;
        case "ArrowDown":
          if (!isSlidingRef.current && !isJumpingRef.current) {
            isSlidingRef.current = true;
            // Slide animation
            Animation.CreateAndStartAnimation(
              "slide",
              playerMesh,
              "scaling.y",
              60,
              20,
              1,
              0.5,
              Animation.ANIMATIONLOOPMODE_CONSTANT,
              null,
              () => {
                Animation.CreateAndStartAnimation(
                  "slideReturn",
                  playerMesh,
                  "scaling.y",
                  60,
                  10,
                  0.5,
                  1,
                  Animation.ANIMATIONLOOPMODE_CONSTANT,
                  null,
                  () => { isSlidingRef.current = false; }
                );
              }
            );
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Game loop
    scene.registerBeforeRender(() => {
      if (!gameState.isGameOver && playerRef.current) {
        // Move player forward
        playerRef.current.position.z += gameState.speed * scene.getEngine().getDeltaTime() / 1000;

        // Update score and speed
        setGameState(prev => ({
          ...prev,
          distance: playerRef.current!.position.z,
          speed: prev.speed + 0.001,
          score: prev.score + prev.speed * 0.016
        }));

        // Check coin collisions
        trackSegmentsRef.current.forEach(segment => {
          segment.coins = segment.coins.filter(coin => {
            const distance = Vector3.Distance(
              playerRef.current!.position,
              coin.position
            );
            if (distance < 1.5) {
              setGameState(prev => ({
                ...prev,
                coins: prev.coins + 1,
                score: prev.score + 100
              }));
              coin.dispose();
              return false;
            }
            return true;
          });
        });

        // Recycle track segments
        const playerZ = playerRef.current.position.z;
        trackSegmentsRef.current.forEach((segment, index) => {
          if (playerZ - segment.position > SEGMENT_LENGTH) {
            // Move segment to front
            const newPosition = segment.position + NUM_SEGMENTS * SEGMENT_LENGTH;
            segment.mesh.position.z = newPosition;
            segment.position = newPosition;

            // Remove old coins and create new ones
            segment.coins.forEach(coin => coin.dispose());
            segment.coins = [];

            // Add new coins
            for (let z = 0; z < SEGMENT_LENGTH; z += COIN_SPACING) {
              if (Math.random() < 0.3) {
                const lane = Math.floor(Math.random() * 3) - 1;
                const coin = MeshBuilder.CreateCylinder("coin", {
                  height: 0.2,
                  diameter: 0.5
                }, scene);
                const coinMaterial = new StandardMaterial("coinMat", scene);
                coinMaterial.diffuseColor = new Color3(1, 0.8, 0);
                coin.material = coinMaterial;
                coin.position = new Vector3(
                  lane * LANE_WIDTH,
                  COIN_HEIGHT,
                  newPosition + z
                );
                coin.rotation.x = Math.PI / 2;
                segment.coins.push(coin);
              }
            }
          }
        });
      }
    });

    // Start the render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      engine.resize();
    });

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      scene.dispose();
      engine.dispose();
    };
  }, []);

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

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}