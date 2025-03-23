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
  ExecuteCodeAction,
  Space
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
  direction: 'forward' | 'right' | 'left';
  rightClickCount: number;
  lastRightClickTime: number;
}

interface TrackSegment {
  mesh: Mesh;
  coins: Mesh[];
  obstacles: Mesh[];
  position: number;
  direction: 'forward' | 'right' | 'left';
}

const LANE_WIDTH = 2;
const SEGMENT_LENGTH = 30;
const COIN_HEIGHT = 1;
const COIN_SPACING = 5;
const NUM_SEGMENTS = 4;
const INITIAL_SPEED = 15;
const SPEED_INCREMENT = 1;
const SPEED_INTERVAL = 200; // Increase speed more aggressively
const TURN_TIMEOUT = 300;
const JUMP_HEIGHT = 3;
const JUMP_DURATION = 15;

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
    coins: 0,
    direction: 'forward',
    rightClickCount: 0,
    lastRightClickTime: 0
  });

  // Create obstacles for a segment
  const createObstacles = (scene: Scene, position: number, direction: 'forward' | 'right' | 'left') => {
    const obstacles: Mesh[] = [];
    const numObstacles = Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < numObstacles; i++) {
      const lane = Math.floor(Math.random() * 3) - 1;
      const zOffset = (Math.random() * (SEGMENT_LENGTH - 10)) + position + 5; // Adjusted position

      const barrier = MeshBuilder.CreateBox("barrier", {
        height: 2,
        width: LANE_WIDTH * 0.8,
        depth: 0.5
      }, scene);
      const barrierMaterial = new StandardMaterial("barrierMat", scene);
      barrierMaterial.diffuseColor = new Color3(0.8, 0.2, 0.2);
      barrier.material = barrierMaterial;

      if (direction === 'forward') {
        barrier.position = new Vector3(lane * LANE_WIDTH, 1, zOffset);
      } else if (direction === 'right') {
        barrier.position = new Vector3(zOffset, 1, lane * LANE_WIDTH);
        barrier.rotation.y = Math.PI / 2;
      } else {
        barrier.position = new Vector3(-zOffset, 1, lane * LANE_WIDTH);
        barrier.rotation.y = -Math.PI / 2;
      }

      obstacles.push(barrier);
    }

    return obstacles;
  };

  // Create a track segment
  const createTrackSegment = (scene: Scene, position: number, direction: 'forward' | 'right' | 'left') => {
    // Create track base with slight overlap to prevent gaps
    const segment = MeshBuilder.CreateBox("track", {
      width: direction === 'forward' ? LANE_WIDTH * 3 : SEGMENT_LENGTH + 1, // Added overlap
      height: 0.5,
      depth: direction === 'forward' ? SEGMENT_LENGTH + 1 : LANE_WIDTH * 3 // Added overlap
    }, scene);

    const material = new StandardMaterial("trackMat", scene);
    material.diffuseColor = new Color3(0.4, 0.4, 0.4);
    segment.material = material;

    // Position with adjusted overlap
    if (direction === 'forward') {
      segment.position = new Vector3(0, -0.25, position + 0.5);
    } else if (direction === 'right') {
      segment.position = new Vector3(position + 0.5, -0.25, 0);
    } else {
      segment.position = new Vector3(-(position + 0.5), -0.25, 0);
    }

    // Create coins and obstacles
    const coins: Mesh[] = [];
    const obstacles = createObstacles(scene, position, direction);

    // Add coins with adjusted positions
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

        if (direction === 'forward') {
          coin.position = new Vector3(lane * LANE_WIDTH, COIN_HEIGHT, position + z);
        } else if (direction === 'right') {
          coin.position = new Vector3(position + z, COIN_HEIGHT, lane * LANE_WIDTH);
        } else {
          coin.position = new Vector3(-(position + z), COIN_HEIGHT, lane * LANE_WIDTH);
        }
        coin.rotation.x = Math.PI / 2;

        coins.push(coin);
      }
    }

    return { mesh: segment, coins, obstacles, position, direction };
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
      const segment = createTrackSegment(scene, i * SEGMENT_LENGTH, 'forward');
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
          const currentTime = Date.now();

          if (isRight) {
            // Handle triple-click turn mechanic
            if (currentTime - gameState.lastRightClickTime < TURN_TIMEOUT) {
              setGameState(prev => ({
                ...prev,
                rightClickCount: prev.rightClickCount + 1,
                lastRightClickTime: currentTime
              }));

              // If three clicks within timeout, perform turn
              if (gameState.rightClickCount >= 2) {
                setGameState(prev => ({
                  ...prev,
                  direction: 'right',
                  rightClickCount: 0
                }));

                // Rotate player and adjust position
                if (playerRef.current) {
                  playerRef.current.rotate(Vector3.Up(), Math.PI / 2, Space.WORLD);
                }
              }
            } else {
              // Reset click count if timeout exceeded
              setGameState(prev => ({
                ...prev,
                rightClickCount: 1,
                lastRightClickTime: currentTime
              }));
            }
          }

          // Regular lane change
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

        // Move player based on current direction
        if (gameState.direction === 'forward') {
          playerRef.current.position.z += gameState.speed * deltaTime;
        } else if (gameState.direction === 'right') {
          playerRef.current.position.x += gameState.speed * deltaTime;
        } else {
          playerRef.current.position.x -= gameState.speed * deltaTime;
        }

        // Aggressive speed increase
        if (gameState.score > lastSpeedIncreaseRef.current + SPEED_INTERVAL) {
          lastSpeedIncreaseRef.current = gameState.score;
          setGameState(prev => ({
            ...prev,
            speed: prev.speed + SPEED_INCREMENT
          }));
        }

        // Update score and distance
        setGameState(prev => ({
          ...prev,
          distance: playerRef.current!.position.z,
          score: prev.score + prev.speed * deltaTime * 2 // Doubled score gain
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
        const playerPos = playerRef.current.position;
        trackSegmentsRef.current.forEach((segment, index) => {
          const distance = Math.abs(
            gameState.direction === 'forward'
              ? playerPos.z - segment.position
              : playerPos.x - Math.abs(segment.position)
          );

          if (distance > SEGMENT_LENGTH * 1.5) {
            // Dispose old segment
            segment.mesh.dispose();
            segment.coins.forEach(coin => coin.dispose());
            segment.obstacles.forEach(obstacle => obstacle.dispose());

            // Create new segment
            const newPosition = segment.position + (NUM_SEGMENTS * SEGMENT_LENGTH);
            const newSegment = createTrackSegment(scene, newPosition, gameState.direction);
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