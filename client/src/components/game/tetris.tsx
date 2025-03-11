import { useEffect, useState, useCallback } from 'react';
import { TetrisPiece, GameState } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;

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
}

export function Tetris({ initialState, onStateChange, onGameOver }: TetrisProps) {
  const { toast } = useToast();
  const [board, setBoard] = useState(initialState.board.map(row => row.map(cell => ({ value: cell, color: null }))));
  const [currentPiece, setCurrentPiece] = useState<TetrisPiece | null>(null);
  const [score, setScore] = useState(initialState.score);
  const [level, setLevel] = useState(initialState.level);
  const [gameOver, setGameOver] = useState(false);
  const [clearedLines, setClearedLines] = useState<number[]>([]);

  const createNewPiece = useCallback(() => {
    const pieces = Object.keys(TETROMINOS) as Array<keyof typeof TETROMINOS>;
    const tetromino = TETROMINOS[pieces[Math.floor(Math.random() * pieces.length)]];
    const newPiece = {
      shape: tetromino.shape,
      color: tetromino.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
      y: 0
    };

    // Check if the new piece can be placed
    if (!isValidMove(newPiece, newPiece.x, newPiece.y)) {
      setGameOver(true);
      onGameOver();
      toast({
        title: "Game Over!",
        description: `Final Score: ${score}`,
        duration: 5000,
      });
      return null;
    }

    return newPiece;
  }, [isValidMove, onGameOver, score, toast]);

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
    let hitTop = false;

    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = currentPiece.y + y;
          if (boardY <= 0) {
            hitTop = true;
          }
          newBoard[boardY][currentPiece.x + x] = { 
            value: 1, 
            color: currentPiece.color 
          };
        }
      });
    });

    if (hitTop) {
      setGameOver(true);
      onGameOver();
      toast({
        title: "Game Over!",
        description: `Final Score: ${score}`,
        duration: 5000,
      });
      return;
    }

    // Check for completed lines
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

        const points = [0, 100, 300, 500, 800][completedLines];
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

    setCurrentPiece(null);
  }, [board, currentPiece, level, onGameOver, score, toast]);

  const moveDown = useCallback(() => {
    if (!currentPiece || gameOver) return;

    if (isValidMove(currentPiece, currentPiece.x, currentPiece.y + 1)) {
      setCurrentPiece({
        ...currentPiece,
        y: currentPiece.y + 1
      });
    } else {
      mergePieceWithBoard();
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

    if (isValidMove(newPiece, currentPiece.x, currentPiece.y)) {
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, gameOver, isValidMove]);

  // Handle keyboard controls
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
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, moveDown, moveHorizontally, rotatePiece]);

  // Game loop
  useEffect(() => {
    if (gameOver) return;

    if (!currentPiece) {
      setCurrentPiece(createNewPiece());
      return;
    }

    const interval = setInterval(() => {
      moveDown();
    }, Math.max(100, 1000 - (level * 100))); // Speed increases with level

    return () => clearInterval(interval);
  }, [currentPiece, gameOver, level, moveDown, createNewPiece]);

  // Update parent component with game state
  useEffect(() => {
    onStateChange({ 
      board: board.map(row => row.map(cell => cell.value)), 
      score, 
      level 
    });
  }, [board, score, level, onStateChange]);

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative grid grid-cols-10 gap-px bg-primary/20 p-2 rounded-lg shadow-lg overflow-hidden"
        style={{
          width: `${BOARD_WIDTH * CELL_SIZE}px`,
          height: `${BOARD_HEIGHT * CELL_SIZE}px`,
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

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="text-center bg-background/90 p-6 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold pixel-font text-primary mb-2">Game Over!</h2>
                <p className="text-xl pixel-font">Final Score: {score}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        className="mt-8 text-center bg-card p-4 rounded-lg shadow-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <p className="text-primary text-2xl font-bold pixel-font mb-2">Score: {score}</p>
        <p className="text-muted-foreground pixel-font">Level: {level}</p>
      </motion.div>
    </div>
  );
}