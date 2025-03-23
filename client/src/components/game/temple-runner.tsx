import { useState, useRef, useEffect } from 'react';
import {
  Engine,
  Scene,
  Vector3,
  Color3,
  MeshBuilder,
  StandardMaterial,
  HemisphericLight,
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
  obstacles: Mesh[];
  position: number;
}

const LANE_WIDTH = 2;
const SEGMENT_LENGTH = 30;
const COIN_HEIGHT = 1;
const COIN_SPACING = 5;
const NUM_SEGMENTS = 4;
const INITIAL_SPEED = 15;
const MAX_SPEED = 100; // Maximum speed in m/s
const SPEED_INCREMENT = 5; // Increase by 5 m/s
const SPEED_INCREASE_DISTANCE = 100; // Increase speed every 100 meters
const JUMP_HEIGHT = 3;
const JUMP_DURATION = 15;

// Obstacle configuration based on speed
const getObstacleCount = (speed: number): number => {
  if (speed >= 90) return 4;
  if (speed >= 70) return 3;
  if (speed >= 50) return 2;
  return 1;
};

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
  const lastSpeedIncreaseRef = useRef(0);

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    isGameOver: false,
    distance: 0,
    speed: INITIAL_SPEED,
    coins: 0
  });

  // Create obstacles for a segment with dynamic count
  const createObstacles = (scene: Scene, position: number) => {
    const obstacles: Mesh[] = [];
    const numObstacles = getObstacleCount(gameState.speed);

    for (let i = 0; i < numObstacles; i++) {
      const lane = Math.floor(Math.random() * 3) - 1;
      const zOffset = (Math.random() * (SEGMENT_LENGTH - 10)) + position + 5;

      const barrier = MeshBuilder.CreateBox("barrier", {
        height: 2,
        width: LANE_WIDTH * 0.8,
        depth: 0.5
      }, scene);
      const barrierMaterial = new StandardMaterial("barrierMat", scene);
      barrierMaterial.diffuseColor = new Color3(0.8, 0.2, 0.2);
      barrier.material = barrierMaterial;
      barrier.position = new Vector3(lane * LANE_WIDTH, 1, zOffset);

      obstacles.push(barrier);
    }

    return obstacles;
  };

  // Create a track segment with precise measurements for perfect alignment
  const createTrackSegment = (scene: Scene, position: number) => {
    // Create track base with careful overlap
    const segment = MeshBuilder.CreateBox("track", {
      width: LANE_WIDTH * 3,
      height: 0.5,
      depth: SEGMENT_LENGTH + 0.1 // Tiny overlap to prevent seams
    }, scene);

    const material = new StandardMaterial("trackMat", scene);
    material.diffuseColor = new Color3(0.4, 0.4, 0.4);
    segment.material = material;
    segment.position = new Vector3(0, -0.25, position);

    // Create coins and obstacles
    const obstacles = createObstacles(scene, position);
    const coins: Mesh[] = [];

    for (let z = 5; z < SEGMENT_LENGTH - 5; z += COIN_SPACING) {
      if (Math.random() < 0.3) {
        const lane = Math.floor(Math.random() * 3) - 1;
        const coin = MeshBuilder.CreateCylinder("coin", {
          height: 0.2,
          diameter: 0.5
        }, scene);
        const coinMaterial = new StandardMaterial("coinMat", scene);
        coinMaterial.diffuseColor = new Color3(1, 0.8, 0);
        coin.material = coinMaterial;
        coin.position = new Vector3(lane * LANE_WIDTH, COIN_HEIGHT, position + z);
        coin.rotation.x = Math.PI / 2;
        coins.push(coin);
      }
    }

    return { mesh: segment, coins, obstacles, position };
  };

  // Cleanup function for track segments
  const cleanupSegment = (segment: TrackSegment) => {
    segment.mesh.dispose();
    segment.coins.forEach(coin => coin.dispose());
    segment.obstacles.forEach(obstacle => obstacle.dispose());
  };

  // Initialize Babylon.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    engineRef.current = engine;
    sceneRef.current = scene;

    scene.clearColor = new Color3(0.5, 0.8, 0.9);

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
    camera.radius = 15;
    camera.heightOffset = 5;
    camera.rotationOffset = 180;

    // Initialize track segments
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const segment = createTrackSegment(scene, i * SEGMENT_LENGTH);
      trackSegmentsRef.current.push(segment);
    }

    // Input handling
    scene.actionManager = new ActionManager(scene);

    // Jump control (Up Arrow)
    scene.actionManager.registerAction(
      new ExecuteCodeAction(
        { trigger: ActionManager.OnKeyDownTrigger, parameter: "ArrowUp" },
        () => {
          if (!isJumpingRef.current && !isSlidingRef.current) {
            isJumpingRef.current = true;
            Animation.CreateAndStartAnimation(
              "jump",
              playerRef.current!,
              "position.y",
              60,
              JUMP_DURATION,
              1,
              JUMP_HEIGHT,
              Animation.ANIMATIONLOOPMODE_CONSTANT,
              undefined,
              () => {
                Animation.CreateAndStartAnimation(
                  "land",
                  playerRef.current!,
                  "position.y",
                  60,
                  JUMP_DURATION,
                  JUMP_HEIGHT,
                  1,
                  Animation.ANIMATIONLOOPMODE_CONSTANT,
                  undefined,
                  () => { isJumpingRef.current = false; }
                );
              }
            );
          }
        }
      )
    );

    // Movement controls
    const handleKeyDown = (evt: KeyboardEvent) => {
      if (gameState.isGameOver) return;

      switch (evt.key) {
        case "ArrowLeft":
        case "ArrowRight":
          const isRight = evt.key === "ArrowRight";
          const newLane = isRight ?
            Math.min(currentLaneRef.current + 1, 2) :
            Math.max(currentLaneRef.current - 1, 0);

          if (newLane !== currentLaneRef.current) {
            currentLaneRef.current = newLane;
            const targetX = (currentLaneRef.current - 1) * LANE_WIDTH;
            Animation.CreateAndStartAnimation(
              isRight ? "moveRight" : "moveLeft",
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
            Animation.CreateAndStartAnimation(
              "slide",
              playerMesh,
              "scaling.y",
              60,
              20,
              1,
              0.5,
              Animation.ANIMATIONLOOPMODE_CONSTANT,
              undefined,
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
                  undefined,
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
        const deltaTime = scene.getEngine().getDeltaTime() / 1000;

        // Move player forward
        playerRef.current.position.z += gameState.speed * deltaTime;

        // Update distance and check for speed increase
        const currentDistance = playerRef.current.position.z;
        const lastSpeedIncreaseDistance = Math.floor(lastSpeedIncreaseRef.current / SPEED_INCREASE_DISTANCE) * SPEED_INCREASE_DISTANCE;

        if (currentDistance > lastSpeedIncreaseDistance + SPEED_INCREASE_DISTANCE && gameState.speed < MAX_SPEED) {
          lastSpeedIncreaseRef.current = currentDistance;
          setGameState(prev => ({
            ...prev,
            speed: Math.min(prev.speed + SPEED_INCREMENT, MAX_SPEED)
          }));

          // Notify player of speed increase
          toast({
            title: "Speed Increased!",
            description: `Current speed: ${Math.floor(gameState.speed)}m/s`,
          });
        }

        // Update game state
        setGameState(prev => ({
          ...prev,
          distance: currentDistance,
          score: prev.score + prev.speed * deltaTime * 2
        }));

        // Check collisions
        trackSegmentsRef.current.forEach(segment => {
          // Coin collisions
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

          // Obstacle collisions with sliding check
          segment.obstacles.forEach(obstacle => {
            const distance = Vector3.Distance(
              playerRef.current!.position,
              obstacle.position
            );
            if (distance < 1.5 && !isJumpingRef.current) {
              if (isSlidingRef.current) {
                // Check if the obstacle is high enough to require jumping
                const heightDiff = Math.abs(playerRef.current!.position.y - obstacle.position.y);
                if (heightDiff > 0.5) { // If the obstacle is too high even when sliding
                  handleGameOver();
                }
              } else {
                handleGameOver();
              }
            }
          });
        });

        // Recycle track segments
        trackSegmentsRef.current.forEach((segment, index) => {
          if (playerRef.current!.position.z - segment.position > SEGMENT_LENGTH * 1.5) {
            cleanupSegment(segment);
            const newPosition = segment.position + (NUM_SEGMENTS * SEGMENT_LENGTH);
            const newSegment = createTrackSegment(scene, newPosition);
            trackSegmentsRef.current[index] = newSegment;
          }
        });
      }
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener('resize', () => {
      engine.resize();
    });

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