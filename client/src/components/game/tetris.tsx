import { useState, useEffect, useCallback, useRef } from 'react';
import { TetrisPiece, GameState } from '@/types/game';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { ScoreAnimation } from './score-animation';
import { Button } from '@/components/ui/button';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 25;
const BASE_DROP_SPEED = 800;
const SWIPE_THRESHOLD = 30; // Reduced threshold for more responsive controls
const DOUBLE_TAP_DELAY = 300;

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

interface TetrisProps {
  initialState: GameState;
  onStateChange: (state: GameState) => void;
  onGameOver: () => void;
  onSaveScore?: (score: number) => void;
}

interface ScoreAnim {
  id: number;
  points: number;
  isTetris: boolean;
  position: { x: number; y: number };
}

interface TouchState {
  startX: number;
  startY: number;
  lastTapTime: number;
  isSwiping: boolean;
}

export function Tetris({ initialState, onStateChange, onGameOver, onSaveScore }: TetrisProps) {
  const { toast } = useToast();
  const [board, setBoard] = useState(initialState.board.map(row => row.map(cell => ({ value: cell, color: null }))));
  const [currentPiece, setCurrentPiece] = useState<TetrisPiece | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrisPiece | null>(null);
  const [score, setScore] = useState(initialState.score);
  const [level, setLevel] = useState(initialState.level);
  const [gameOver, setGameOver] = useState(false);
  const [clearedLines, setClearedLines] = useState<number[]>([]);
  const [scoreAnims, setScoreAnims] = useState<ScoreAnim[]>([]);
  const lastTapTime = useRef(0);
  const touchStartY = useRef(0);
  const lastTetris = useRef(false);
  const dropInterval = useRef<NodeJS.Timeout | null>(null);
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    lastTapTime: 0,
    isSwiping: false
  });

  const createNewPiece = useCallback(() => {
    const pieces = Object.keys(TETROMINOS) as Array<keyof typeof TETROMINOS>;
    const tetromino = TETROMINOS[pieces[Math.floor(Math.random() * pieces.length)]];
    return {
      shape: tetromino.shape,
      color: tetromino.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
      y: 0
    };
  }, []);

  const isValidMove = useCallback((piece: TetrisPiece, x: number, y: number) => {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX].value)
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, [board]);

  const mergePieceWithBoard = useCallback(() => {
    if (!currentPiece) return;

    const newBoard = board.map(row => [...row]);
    let pieceAtTop = false;

    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = currentPiece.y + y;
          if (boardY <= 0) {
            pieceAtTop = true;
          }
          if (boardY >= 0 && boardY < BOARD_HEIGHT) {
            newBoard[boardY][currentPiece.x + x] = {
              value: 1,
              color: currentPiece.color
            };
          }
        }
      });
    });

    if (pieceAtTop) {
      setGameOver(true);
      onGameOver();
      if (dropInterval.current) {
        clearInterval(dropInterval.current);
      }
      toast({
        title: "Game Over!",
        description: `Final Score: ${score}`,
        duration: 5000,
      });
      return;
    }

    let completedLines = 0;
    const linesToClear: number[] = [];

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell.value)) {
        completedLines++;
        linesToClear.push(y);
      }
    }

    if (linesToClear.length > 0) {
      setClearedLines(linesToClear);

      setTimeout(() => {
        const finalBoard = newBoard.filter((_, index) => !linesToClear.includes(index));
        const emptyRows = Array(linesToClear.length).fill(null).map(() =>
          Array(BOARD_WIDTH).fill({ value: 0, color: null })
        );
        setBoard([...emptyRows, ...finalBoard]);
        setClearedLines([]);

        let points;
        const isTetris = completedLines === 4;
        if (isTetris) {
          points = lastTetris.current ? 1200 : 800;
          lastTetris.current = true;
        } else {
          points = [0, 100, 300, 500][completedLines - 1] || 0;
          lastTetris.current = false;
        }

        const animY = (linesToClear[0] * CELL_SIZE) + (CELL_SIZE * 2);
        const animX = (BOARD_WIDTH * CELL_SIZE) / 2;

        setScoreAnims(prev => [
          ...prev,
          {
            id: Date.now(),
            points,
            isTetris,
            position: { x: animX, y: animY }
          }
        ]);

        if (isTetris) {
          toast({
            title: lastTetris.current ? "Back-to-Back Tetris!" : "Tetris!",
            description: `+${points} points!`,
            duration: 2000,
          });
        }

        setScore(prev => {
          const newScore = prev + points * level;
          if (newScore > level * 1000) {
            setLevel(l => l + 1);
          }
          return newScore;
        });
      }, 500);
    } else {
      setBoard(newBoard);
    }

    setCurrentPiece(nextPiece);
    setNextPiece(createNewPiece());
  }, [board, currentPiece, level, nextPiece, onGameOver, score, toast, createNewPiece]);

  const moveDown = useCallback(() => {
    if (!currentPiece || gameOver) return;

    if (isValidMove(currentPiece, currentPiece.x, currentPiece.y + 1)) {
      setCurrentPiece({
        ...currentPiece,
        y: currentPiece.y + 1
      });
      return true;
    } else {
      mergePieceWithBoard();
      return false;
    }
  }, [currentPiece, gameOver, isValidMove, mergePieceWithBoard]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver) return;

    let dropDistance = 0;
    while (isValidMove(currentPiece, currentPiece.x, currentPiece.y + dropDistance + 1)) {
      dropDistance++;
    }

    if (dropDistance > 0) {
      setScore(prev => prev + (dropDistance * 2));

      setCurrentPiece({
        ...currentPiece,
        y: currentPiece.y + dropDistance
      });

      setTimeout(mergePieceWithBoard, 0);
    }
  }, [currentPiece, gameOver, isValidMove, mergePieceWithBoard]);

  const moveHorizontally = useCallback((direction: number) => {
    if (!currentPiece || gameOver) return;

    if (isValidMove(currentPiece, currentPiece.x + direction, currentPiece.y)) {
      setCurrentPiece({
        ...currentPiece,
        x: currentPiece.x + direction
      });
    }
  }, [currentPiece, gameOver, isValidMove]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver) return;

    const rotated = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    );

    const newPiece = {
      ...currentPiece,
      shape: rotated
    };

    for (let offset of [0, -1, 1, -2, 2]) {
      if (isValidMove(newPiece, currentPiece.x + offset, currentPiece.y)) {
        setCurrentPiece({
          ...newPiece,
          x: currentPiece.x + offset
        });
        return;
      }
    }
  }, [currentPiece, gameOver, isValidMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); 
    const touch = e.touches[0];
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      lastTapTime: Date.now(),
      isSwiping: false
    };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); 
    if (!currentPiece || gameOver) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD || Math.abs(deltaY) > SWIPE_THRESHOLD) {
      touchState.current.isSwiping = true;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        moveHorizontally(deltaX > 0 ? 1 : -1);
        touchState.current.startX = touch.clientX; 
      } else if (deltaY > 0) {
        moveDown();
        touchState.current.startY = touch.clientY; 
      }
    }
  }, [currentPiece, gameOver, moveHorizontally, moveDown]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!currentPiece || gameOver) return;

    const timeDiff = Date.now() - touchState.current.lastTapTime;

    if (!touchState.current.isSwiping && timeDiff < DOUBLE_TAP_DELAY) {
      if (timeDiff < DOUBLE_TAP_DELAY) {
        hardDrop();
        toast({
          title: "Hard Drop!",
          duration: 1000,
        });
      } else {
        rotatePiece();
      }
    }

    touchState.current.lastTapTime = Date.now();
  }, [currentPiece, gameOver, hardDrop, rotatePiece, toast]);


  const preventDefault = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          moveHorizontally(-1);
          break;
        case 'ArrowRight':
          moveHorizontally(1);
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, moveDown, moveHorizontally, rotatePiece, hardDrop]);

  useEffect(() => {
    if (gameOver) {
      if (dropInterval.current) {
        clearInterval(dropInterval.current);
      }
      return;
    }

    if (!currentPiece) {
      if (!nextPiece) {
        setNextPiece(createNewPiece());
      }
      const newPiece = nextPiece;
      if (newPiece && isValidMove(newPiece, newPiece.x, newPiece.y)) {
        setCurrentPiece(newPiece);
        setNextPiece(createNewPiece());
      } else if (newPiece) {
        setGameOver(true);
        onGameOver();
      }
      return;
    }

    if (dropInterval.current) {
      clearInterval(dropInterval.current);
    }

    const dropSpeed = Math.max(50, BASE_DROP_SPEED - (level * 60));

    dropInterval.current = setInterval(() => {
      if (!isValidMove(currentPiece, currentPiece.x, currentPiece.y + 1)) {
        mergePieceWithBoard();
      } else {
        setCurrentPiece(prev => ({
          ...prev!,
          y: prev!.y + 1
        }));
      }
    }, dropSpeed);

    return () => {
      if (dropInterval.current) {
        clearInterval(dropInterval.current);
      }
    };
  }, [currentPiece, gameOver, level, isValidMove, createNewPiece, nextPiece, onGameOver]);

  useEffect(() => {
    onStateChange({
      board: board.map(row => row.map(cell => cell.value)),
      score,
      level
    });
  }, [board, score, level, onStateChange]);

  const NextPiecePreview = () => {
    if (!nextPiece) return null;

    const maxWidth = Math.max(...nextPiece.shape[0].map((_, i) =>
      nextPiece.shape.reduce((sum, row) => sum + (row[i] ? 1 : 0), 0)
    ));
    const maxHeight = nextPiece.shape.length;

    return (
      <div className="fixed right-4 top-20 bg-card/80 p-6 rounded-lg shadow-lg">
        <h3 className="text-sm text-primary font-bold mb-4">Next Piece</h3>
        <div
          className="grid gap-1 bg-primary/20 p-4 rounded"
          style={{
            gridTemplateColumns: `repeat(${maxWidth}, 1fr)`,
            gridTemplateRows: `repeat(${maxHeight}, 1fr)`
          }}
        >
          {nextPiece.shape.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`next-${y}-${x}`}
                className="w-8 h-8 border border-primary/10"
                style={{
                  backgroundColor: cell ? nextPiece.color : 'transparent'
                }}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col items-center max-h-[95vh] overflow-hidden touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="relative grid grid-cols-10 gap-px bg-primary/20 p-2 rounded-lg shadow-lg game-board mb-4"
        style={{
          width: `${BOARD_WIDTH * CELL_SIZE}px`,
          height: `${BOARD_HEIGHT * CELL_SIZE}px`,
          maxHeight: '95vh',
          touchAction: 'none',
          border: '2px solid rgba(var(--primary), 0.2)'
        }}
      >
        {board.map((row, y) => (
          row.map((cell, x) => {
            let backgroundColor = cell.value ? cell.color : 'transparent';

            if (currentPiece && !gameOver) {
              const pieceX = x - currentPiece.x;
              const pieceY = y - currentPiece.y;

              if (
                pieceY >= 0 &&
                pieceY < currentPiece.shape.length &&
                pieceX >= 0 &&
                pieceX < currentPiece.shape[pieceY].length &&
                currentPiece.shape[pieceY][pieceX]
              ) {
                backgroundColor = currentPiece.color;
              }
            }

            return (
              <motion.div
                key={`${y}-${x}`}
                className={`border border-primary/10 ${
                  clearedLines.includes(y) ? 'animate-pulse bg-white' : ''
                }`}
                style={{
                  width: `${CELL_SIZE}px`,
                  height: `${CELL_SIZE}px`,
                  backgroundColor
                }}
                animate={{
                  scale: clearedLines.includes(y) ? [1, 1.1, 1] : 1,
                  opacity: clearedLines.includes(y) ? [1, 0] : 1
                }}
                transition={{ duration: 0.5 }}
              />
            );
          })
        ))}

        {scoreAnims.map(anim => (
          <ScoreAnimation
            key={anim.id}
            points={anim.points}
            isTetris={anim.isTetris}
            position={anim.position}
            onComplete={() => {
              setScoreAnims(prev => prev.filter(a => a.id !== anim.id));
            }}
          />
        ))}

        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center bg-background/90 p-6 rounded-lg shadow-xl w-64">
              <h2 className="text-2xl font-bold pixel-font text-primary mb-4">Game Over!</h2>
              <p className="text-xl pixel-font mb-6">Final Score: {score}</p>
              <Button
                onClick={onGameOver}
                className="w-full pixel-font text-lg"
                variant="default"
              >
                Return to Dashboard
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <NextPiecePreview />

      <motion.div
        className="mt-4 text-center bg-card p-4 rounded-lg shadow-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <p className="text-primary text-xl font-bold pixel-font mb-2">Score: {score}</p>
        <p className="text-muted-foreground pixel-font">Level: {level}</p>
      </motion.div>
    </div>
  );
}