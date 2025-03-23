import { useEffect, useRef, useState } from 'react';
import { 
  Engine, 
  Scene, 
  Vector3, 
  Color3, 
  MeshBuilder, 
  StandardMaterial,
  FreeCamera,
  TransformNode
} from '@babylonjs/core';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { type CharacterStats } from './character-data';

// Character move definitions
export interface Move {
  name: string;
  damage: number;
  frames: number;
  input: string[];
  isSpecial: boolean;
}

// Character state interface
interface CharacterState {
  health: number;
  position: { x: number; y: number };
  isBlocking: boolean;
  currentMove?: Move;
  isJumping: boolean;
  isCrouching: boolean;
}

// Game state interface
interface GameState {
  player1: CharacterState;
  player2: CharacterState;
  isGameOver: boolean;
  winner?: 'player1' | 'player2';
  roundTime: number;
}

interface StreetFighterProps {
  matchId?: string;
  isPractice?: boolean;
  onGameOver?: (score: number) => void;
  character: CharacterStats;
}

function createCharacterMesh(scene: Scene, position: Vector3, color: Color3) {
  const character = new TransformNode("character", scene);
  character.position = position;

  // Create torso
  const torso = MeshBuilder.CreateBox("torso", {
    height: 1.2,
    width: 0.6,
    depth: 0.4
  }, scene);
  torso.parent = character;
  torso.position.y = 0.6;

  // Create head
  const head = MeshBuilder.CreateSphere("head", {
    diameter: 0.4
  }, scene);
  head.parent = character;
  head.position.y = 1.5;

  // Create arms
  const rightArm = MeshBuilder.CreateBox("rightArm", {
    height: 0.8,
    width: 0.2,
    depth: 0.2
  }, scene);
  rightArm.parent = character;
  rightArm.position = new Vector3(0.4, 0.8, 0);

  const leftArm = MeshBuilder.CreateBox("leftArm", {
    height: 0.8,
    width: 0.2,
    depth: 0.2
  }, scene);
  leftArm.parent = character;
  leftArm.position = new Vector3(-0.4, 0.8, 0);

  // Create legs
  const rightLeg = MeshBuilder.CreateBox("rightLeg", {
    height: 1,
    width: 0.25,
    depth: 0.25
  }, scene);
  rightLeg.parent = character;
  rightLeg.position = new Vector3(0.2, 0, 0);

  const leftLeg = MeshBuilder.CreateBox("leftLeg", {
    height: 1,
    width: 0.25,
    depth: 0.25
  }, scene);
  leftLeg.parent = character;
  leftLeg.position = new Vector3(-0.2, 0, 0);

  // Apply material
  const material = new StandardMaterial("characterMaterial", scene);
  material.diffuseColor = color;

  [torso, head, rightArm, leftArm, rightLeg, leftLeg].forEach(mesh => {
    mesh.material = material;
  });

  return character;
}

export function StreetFighter({ matchId, isPractice = true, onGameOver, character }: StreetFighterProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    player1: {
      health: character.health,
      position: { x: -5, y: 0 },
      isBlocking: false,
      isJumping: false,
      isCrouching: false
    },
    player2: {
      health: 100,
      position: { x: 5, y: 0 },
      isBlocking: false,
      isJumping: false,
      isCrouching: false
    },
    isGameOver: false,
    roundTime: 99
  });

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
        description: `Match complete!`,
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

  // Initialize game scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    engineRef.current = engine;
    sceneRef.current = scene;

    scene.clearColor = new Color3(0.2, 0.2, 0.3);

    // Create character models
    const player1 = createCharacterMesh(
      scene,
      new Vector3(-5, 1, 0),
      new Color3(0.8, 0.2, 0.2)
    );

    const player2 = createCharacterMesh(
      scene,
      new Vector3(5, 1, 0),
      new Color3(0.2, 0.2, 0.8)
    );

    // Create stage floor
    const floor = MeshBuilder.CreateGround("floor", {
      width: 20,
      height: 10
    }, scene);
    const floorMaterial = new StandardMaterial("floorMat", scene);
    floorMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
    floor.material = floorMaterial;

    // Setup camera
    const camera = new FreeCamera("camera", new Vector3(0, 5, -15), scene);
    camera.setTarget(Vector3.Zero());

    // Setup keyboard controls
    scene.onKeyboardObservable.add((kbInfo) => {
      if (gameState.isGameOver) return;

      switch (kbInfo.type) {
        case 1: // KeyDown
          switch (kbInfo.event.code) {
            case "ArrowLeft":
              player1.position.x -= 0.1;
              break;
            case "ArrowRight":
              player1.position.x += 0.1;
              break;
            case "ArrowUp":
              if (!gameState.player1.isJumping) {
                setGameState(prev => ({
                  ...prev,
                  player1: { ...prev.player1, isJumping: true }
                }));
              }
              break;
            case "ArrowDown":
              setGameState(prev => ({
                ...prev,
                player1: { ...prev.player1, isCrouching: true }
              }));
              break;
            case "KeyX":
              // Punch
              console.log("Punch!");
              break;
            case "KeyC":
              // Kick
              console.log("Kick!");
              break;
          }
          break;
        case 2: // KeyUp
          switch (kbInfo.event.code) {
            case "ArrowDown":
              setGameState(prev => ({
                ...prev,
                player1: { ...prev.player1, isCrouching: false }
              }));
              break;
          }
          break;
      }
    });

    // Game loop
    scene.registerBeforeRender(() => {
      if (!gameState.isGameOver) {
        // Update game state
        setGameState(prev => ({
          ...prev,
          roundTime: Math.max(0, prev.roundTime - scene.getEngine().getDeltaTime() / 1000)
        }));

        // Handle jumping
        if (gameState.player1.isJumping) {
          player1.position.y += 0.2;
          if (player1.position.y > 3) {
            setGameState(prev => ({
              ...prev,
              player1: { ...prev.player1, isJumping: false }
            }));
          }
        } else if (player1.position.y > 1) {
          player1.position.y -= 0.2;
        }

        // Check win condition
        if (gameState.roundTime <= 0 || gameState.player1.health <= 0 || gameState.player2.health <= 0) {
          handleGameOver();
        }
      }
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener('resize', () => {
      engine.resize();
    });

    return () => {
      scene.dispose();
      engine.dispose();
    };
  }, [character]); // Add character as dependency to reinitialize when character changes

  const handleGameOver = async () => {
    setGameState(prev => ({ ...prev, isGameOver: true }));
    if (onGameOver) {
      const score = gameState.player1.health - gameState.player2.health;
      onGameOver(score);
    }
    await updateXpMutation.mutateAsync(gameState.player1.health);
  };

  return (
    <div className="w-full h-screen relative bg-black">
      {/* Game UI Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between text-white pixel-font">
        <div className="health-bar">
          <div>{character.name}: {gameState.player1.health}%</div>
        </div>
        <div className="timer">{Math.ceil(gameState.roundTime)}</div>
        <div className="health-bar">
          <div>P2: {gameState.player2.health}%</div>
        </div>
      </div>

      {/* Controls Guide */}
      <div className="absolute bottom-4 left-4 z-10 text-white pixel-font text-sm">
        <div>Controls:</div>
        <div>← → : Move</div>
        <div>↑ : Jump</div>
        <div>↓ : Crouch</div>
        <div>X : Punch</div>
        <div>C : Kick</div>
        {character.specialMoves.map((move) => (
          <div key={move.name}>
            {move.input.join(" + ")}: {move.name}
          </div>
        ))}
      </div>

      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-background p-6 rounded-lg text-center space-y-4">
            <h2 className="text-2xl font-bold pixel-font">Game Over!</h2>
            <p>Winner: {gameState.winner === 'player1' ? character.name : 'Player 2'}</p>
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