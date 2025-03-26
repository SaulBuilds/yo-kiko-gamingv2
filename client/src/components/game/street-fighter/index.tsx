import { useEffect, useRef, useState } from 'react';
import { 
  Engine, 
  Scene, 
  Vector3, 
  Color3, 
  MeshBuilder, 
  StandardMaterial,
  FreeCamera,
  TransformNode,
  HemisphericLight,
  DirectionalLight
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
  verticalVelocity?: number; // Added for jump physics
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

// Assuming InputHandler class is defined elsewhere
class InputHandler {
  private pressedKeys: { [key: string]: boolean } = {};

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    this.pressedKeys[event.code] = true;
  };

  handleKeyUp = (event: KeyboardEvent) => {
    this.pressedKeys[event.code] = false;
  };


  checkForSpecialMove(moveInput: string[]): boolean {
    return moveInput.every(key => this.pressedKeys[key]);
  }

  cleanup() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}


export function StreetFighter({ matchId, isPractice = true, onGameOver, character }: StreetFighterProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const inputHandler = useRef(new InputHandler());

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

    // Set initial rotations to face each other
    player1.rotation.y = -Math.PI / 2;
    player2.rotation.y = Math.PI / 2;

    // Create stage floor
    const floor = MeshBuilder.CreateGround("floor", {
      width: 20,
      height: 10
    }, scene);
    const floorMaterial = new StandardMaterial("floorMat", scene);
    floorMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
    floor.material = floorMaterial;

    // Setup camera
    const camera = new FreeCamera("camera", new Vector3(0, 3, -10), scene);
    camera.setTarget(new Vector3(0, 2, 0));

    // Add hemispheric light for ambient lighting
    const hemisphericLight = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    hemisphericLight.intensity = 0.7;

    // Add directional light for shadows
    const directionalLight = new DirectionalLight("dir-light", new Vector3(-1, -2, -1), scene);
    directionalLight.intensity = 0.5;

    // Setup keyboard controls
    scene.onKeyboardObservable.add((kbInfo) => {
      if (gameState.isGameOver) return;

      const STAGE_BOUNDS = {
        left: -8,
        right: 8
      };

      switch (kbInfo.type) {
        case 1: // KeyDown
          // Check for special moves first
          character.specialMoves.forEach(move => {
            if (inputHandler.current.checkForSpecialMove(move.input)) {
              // Execute special move
              setGameState(prev => ({
                ...prev,
                player1: {
                  ...prev.player1,
                  currentMove: {
                    name: move.name,
                    damage: move.damage,
                    frames: 10,
                    input: move.input,
                    isSpecial: true
                  }
                }
              }));

              // Apply damage if in range
              const distance = Math.abs(player1.position.x - player2.position.x);
              if (distance < 3 && !gameState.player2.isBlocking) {
                setGameState(prev => ({
                  ...prev,
                  player2: {
                    ...prev.player2,
                    health: Math.max(0, prev.player2.health - move.damage)
                  }
                }));
                player2.position.x += 1.2; // Bigger knockback for special moves
              }
            }
          });

          // Regular moves handling
          switch (kbInfo.event.code) {
            case "ArrowLeft":
              const newPosLeft = player1.position.x - character.walkSpeed * 0.05;
              if (newPosLeft > STAGE_BOUNDS.left) {
                player1.position.x = newPosLeft;
              }
              break;
            case "ArrowRight":
              const newPosRight = player1.position.x + character.walkSpeed * 0.05;
              if (newPosRight < STAGE_BOUNDS.right) {
                player1.position.x = newPosRight;
              }
              break;
            case "ArrowUp":
              if (!gameState.player1.isJumping) {
                setGameState(prev => ({
                  ...prev,
                  player1: { 
                    ...prev.player1, 
                    isJumping: true,
                    verticalVelocity: character.jumpForce * 0.2 
                  }
                }));
              }
              break;
            case "ArrowDown":
              if (!gameState.player1.isCrouching) {
                setGameState(prev => ({
                  ...prev,
                  player1: { ...prev.player1, isCrouching: true }
                }));
                player1.scaling.y = 0.7;
              }
              break;
            case "KeyX":
              const rightArm = player1.getChildMeshes().find(mesh => mesh.name === "rightArm");
              if (rightArm) {
                rightArm.rotation.z = Math.PI / 2;

                const distance = Math.abs(player1.position.x - player2.position.x);
                if (distance < 1.5 && !gameState.player2.isBlocking) {
                  setGameState(prev => ({
                    ...prev,
                    player2: {
                      ...prev.player2,
                      health: Math.max(0, prev.player2.health - 10) 
                    }
                  }));
                  player2.position.x += 0.5;
                }

                setTimeout(() => {
                  rightArm.rotation.z = 0;
                }, 200);
              }
              break;
            case "KeyC":
              const rightLeg = player1.getChildMeshes().find(mesh => mesh.name === "rightLeg");
              if (rightLeg) {
                rightLeg.rotation.z = -Math.PI / 2;

                const distance = Math.abs(player1.position.x - player2.position.x);
                if (distance < 2 && !gameState.player2.isBlocking) {
                  setGameState(prev => ({
                    ...prev,
                    player2: {
                      ...prev.player2,
                      health: Math.max(0, prev.player2.health - 15) 
                    }
                  }));
                  player2.position.x += 0.8;
                }

                setTimeout(() => {
                  rightLeg.rotation.z = 0;
                }, 200);
              }
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
              player1.scaling.y = 1;
              break;
          }
          break;
      }
    });

    // Game loop
    const GRAVITY = 0.8;
    const GROUND_Y = 1;
    const STAGE_BOUNDS = {
      left: -8,
      right: 8
    };

    scene.registerBeforeRender(() => {
      if (!gameState.isGameOver) {
        setGameState(prev => ({
          ...prev,
          roundTime: Math.max(0, prev.roundTime - scene.getEngine().getDeltaTime() / 1000)
        }));

        // Enforce screen boundaries for both players
        if (player1.position.x < STAGE_BOUNDS.left) player1.position.x = STAGE_BOUNDS.left;
        if (player1.position.x > STAGE_BOUNDS.right) player1.position.x = STAGE_BOUNDS.right;
        if (player2.position.x < STAGE_BOUNDS.left) player2.position.x = STAGE_BOUNDS.left;
        if (player2.position.x > STAGE_BOUNDS.right) player2.position.x = STAGE_BOUNDS.right;

        // Handle jumping physics
        if (gameState.player1.isJumping) {
          const newVelocity = (gameState.player1.verticalVelocity || 0) - GRAVITY * scene.getEngine().getDeltaTime();
          player1.position.y += newVelocity;

          if (player1.position.y <= GROUND_Y) {
            player1.position.y = GROUND_Y;
            setGameState(prev => ({
              ...prev,
              player1: { 
                ...prev.player1, 
                isJumping: false,
                verticalVelocity: 0
              }
            }));
          } else {
            setGameState(prev => ({
              ...prev,
              player1: {
                ...prev.player1,
                verticalVelocity: newVelocity
              }
            }));
          }
        }

        // AI Opponent behavior
        if (isPractice) {
          const distanceToPlayer = player2.position.x - player1.position.x;
          const AI_AGGRESSION = 0.75; 
          const AI_REACTION_TIME = 0.02; 

          if (Math.abs(distanceToPlayer) > 3) {
            // Move towards player with proper speed
            const moveDirection = Math.sign(distanceToPlayer) * -1;
            const newPos = player2.position.x + moveDirection * character.walkSpeed * 0.03;
            if (newPos > STAGE_BOUNDS.left && newPos < STAGE_BOUNDS.right) {
              player2.position.x = newPos;
            }
          } else if (Math.random() < AI_REACTION_TIME) {
            const action = Math.random();
            if (action < AI_AGGRESSION) {
              if (action < AI_AGGRESSION * 0.6) {
                // Punch
                const rightArm = player2.getChildMeshes().find(mesh => mesh.name === "rightArm");
                if (rightArm) {
                  rightArm.rotation.z = -Math.PI / 2;

                  if (Math.abs(distanceToPlayer) < 1.5 && !gameState.player1.isBlocking) {
                    setGameState(prev => ({
                      ...prev,
                      player1: {
                        ...prev.player1,
                        health: Math.max(0, prev.player1.health - 10)
                      }
                    }));
                    if (player1.position.x > STAGE_BOUNDS.left) {
                      player1.position.x -= 0.5;
                    }
                  }

                  setTimeout(() => {
                    rightArm.rotation.z = 0;
                  }, 200);
                }
              } else {
                // Kick
                const rightLeg = player2.getChildMeshes().find(mesh => mesh.name === "rightLeg");
                if (rightLeg) {
                  rightLeg.rotation.z = Math.PI / 2;

                  if (Math.abs(distanceToPlayer) < 2 && !gameState.player1.isBlocking) {
                    setGameState(prev => ({
                      ...prev,
                      player1: {
                        ...prev.player1,
                        health: Math.max(0, prev.player1.health - 15)
                      }
                    }));
                    if (player1.position.x > STAGE_BOUNDS.left) {
                      player1.position.x -= 0.8;
                    }
                  }

                  setTimeout(() => {
                    rightLeg.rotation.z = 0;
                  }, 200);
                }
              }
            }
          }
        }

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
      inputHandler.current.cleanup();
      scene.dispose();
      engine.dispose();
    };
  }, [character]); 

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
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between text-white pixel-font">
        <div className="health-bar">
          <div>{character.name}: {gameState.player1.health}%</div>
        </div>
        <div className="timer">{Math.ceil(gameState.roundTime)}</div>
        <div className="health-bar">
          <div>P2: {gameState.player2.health}%</div>
        </div>
      </div>

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

      {gameState.isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-background p-6 rounded-lg text-center space-y-4">
            <h2 className="text-2xl font-bold pixel-font">Game Over!</h2>
            <p>Winner: {gameState.winner === 'player1' ? character.name : 'Player 2'}</p>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}