import { useState, useRef, useEffect } from 'react';
import {
  Engine,
  Scene,
  Color3,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  HemisphericLight,
  FollowCamera,
  TransformNode,
  Animation,
  Mesh,
  ActionManager,
  ExecuteCodeAction,
  Matrix,
  Path3D,
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
}

interface TrackSegment {
  mesh: Mesh;
  coins: Mesh[];
  obstacles: Mesh[];
  position: number;
  curve?: Path3D;
}

const LANE_WIDTH = 2;
const SEGMENT_LENGTH = 30;
const COIN_HEIGHT = 1;
const COIN_SPACING = 5;
const NUM_SEGMENTS = 4;
const INITIAL_SPEED = 10;
const SPEED_INCREMENT = 0.5;
const SPEED_INTERVAL = 1000; // Increase speed every 1000 points

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

  // Create obstacles for a segment
  const createObstacles = (scene: Scene, position: number, curve?: Path3D) => {
    const obstacles: Mesh[] = [];
    const numObstacles = Math.floor(Math.random() * 3) + 1; // 1-3 obstacles per segment

    for (let i = 0; i < numObstacles; i++) {
      const obstacleType = Math.random() > 0.5 ? 'barrier' : 'gap';
      const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      const zOffset = (Math.random() * (SEGMENT_LENGTH - 5)) + position + 2;

      if (obstacleType === 'barrier') {
        const barrier = MeshBuilder.CreateBox("barrier", {
          height: 2,
          width: LANE_WIDTH * 0.8,
          depth: 0.5
        }, scene);
        const barrierMaterial = new StandardMaterial("barrierMat", scene);
        barrierMaterial.diffuseColor = new Color3(0.8, 0.2, 0.2);
        barrier.material = barrierMaterial;

        // Position on curve if available
        if (curve) {
          const curvePoint = curve.getPointAt((zOffset - position) / SEGMENT_LENGTH);
          const tangent = curve.getTangentAt((zOffset - position) / SEGMENT_LENGTH);
          barrier.position = curvePoint.add(new Vector3(lane * LANE_WIDTH, 1, 0));
          barrier.rotation.y = Math.atan2(tangent.x, tangent.z);
        } else {
          barrier.position = new Vector3(lane * LANE_WIDTH, 1, zOffset);
        }

        obstacles.push(barrier);
      } else {
        // Create a gap in the track
        const gap = MeshBuilder.CreateBox("gap", {
          height: 0.1,
          width: LANE_WIDTH * 0.8,
          depth: 2
        }, scene);
        const gapMaterial = new StandardMaterial("gapMat", scene);
        gapMaterial.diffuseColor = new Color3(0, 0, 0);
        gapMaterial.alpha = 0.5;
        gap.material = gapMaterial;

        if (curve) {
          const curvePoint = curve.getPointAt((zOffset - position) / SEGMENT_LENGTH);
          const tangent = curve.getTangentAt((zOffset - position) / SEGMENT_LENGTH);
          gap.position = curvePoint.add(new Vector3(lane * LANE_WIDTH, 0, 0));
          gap.rotation.y = Math.atan2(tangent.x, tangent.z);
        } else {
          gap.position = new Vector3(lane * LANE_WIDTH, 0, zOffset);
        }

        obstacles.push(gap);
      }
    }

    return obstacles;
  };

  // Create a track segment with optional curve
  const createTrackSegment = (scene: Scene, position: number, shouldCurve: boolean = false) => {
    let curve: Path3D | undefined;
    let trackPoints: Vector3[];

    if (shouldCurve) {
      // Create a curved path
      const curvePoints = [];
      const numPoints = 20;
      const curveRadius = SEGMENT_LENGTH / 2;
      const turnAngle = Math.PI / 2; // 90-degree turn

      for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1);
        const angle = t * turnAngle;
        const x = curveRadius * Math.sin(angle);
        const z = position + t * SEGMENT_LENGTH;
        curvePoints.push(new Vector3(x, 0, z));
      }

      curve = new Path3D(curvePoints);
      trackPoints = curvePoints;
    } else {
      // Straight track
      trackPoints = [
        new Vector3(0, 0, position),
        new Vector3(0, 0, position + SEGMENT_LENGTH)
      ];
    }

    // Create track mesh
    const track = MeshBuilder.CreateRibbon("track", {
      pathArray: [
        trackPoints.map(p => p.add(new Vector3(-LANE_WIDTH * 1.5, 0, 0))),
        trackPoints.map(p => p.add(new Vector3(LANE_WIDTH * 1.5, 0, 0)))
      ],
      closePath: false
    }, scene);

    const material = new StandardMaterial("trackMat", scene);
    material.diffuseColor = new Color3(0.4, 0.4, 0.4);
    track.material = material;
    track.position.y = -0.25;

    // Create coins and obstacles
    const coins: Mesh[] = [];
    const obstacles = createObstacles(scene, position, curve);

    // Add coins along the track
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

        if (curve) {
          const curvePoint = curve.getPointAt(z / SEGMENT_LENGTH);
          const tangent = curve.getTangentAt(z / SEGMENT_LENGTH);
          coin.position = curvePoint.add(new Vector3(lane * LANE_WIDTH, COIN_HEIGHT, 0));
          coin.rotation = new Vector3(Math.PI / 2, Math.atan2(tangent.x, tangent.z), 0);
        } else {
          coin.position = new Vector3(lane * LANE_WIDTH, COIN_HEIGHT, position + z);
          coin.rotation.x = Math.PI / 2;
        }

        coins.push(coin);
      }
    }

    return { mesh: track, coins, obstacles, position, curve };
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
      const shouldCurve = Math.random() < 0.3; // 30% chance of curved segment
      const segment = createTrackSegment(scene, i * SEGMENT_LENGTH, shouldCurve);
      trackSegmentsRef.current.push(segment);
    }

    // Input handling
    scene.actionManager = new ActionManager(scene);

    // Jump control
    scene.actionManager.registerAction(
      new ExecuteCodeAction(
        { trigger: ActionManager.OnKeyDownTrigger, parameter: "Space" },
        () => {
          if (!isJumpingRef.current && !isSlidingRef.current) {
            isJumpingRef.current = true;
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

    // Movement controls
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
        const deltaTime = scene.getEngine().getDeltaTime() / 1000;
        playerRef.current.position.z += gameState.speed * deltaTime;

        // Check for speed increase
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
          score: prev.score + prev.speed * deltaTime
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

          // Obstacle collisions
          segment.obstacles.forEach(obstacle => {
            const distance = Vector3.Distance(
              playerRef.current!.position,
              obstacle.position
            );
            if (distance < 1.5 && !isJumpingRef.current) {
              handleGameOver();
            }
          });
        });

        // Recycle track segments
        const playerZ = playerRef.current.position.z;
        trackSegmentsRef.current.forEach((segment, index) => {
          if (playerZ - segment.position > SEGMENT_LENGTH) {
            // Dispose old segment
            segment.mesh.dispose();
            segment.coins.forEach(coin => coin.dispose());
            segment.obstacles.forEach(obstacle => obstacle.dispose());

            // Create new segment
            const newPosition = segment.position + NUM_SEGMENTS * SEGMENT_LENGTH;
            const shouldCurve = Math.random() < 0.3;
            const newSegment = createTrackSegment(scene, newPosition, shouldCurve);
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