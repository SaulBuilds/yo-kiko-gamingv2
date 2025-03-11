import { useEffect, useState, useCallback } from 'react';
import { TetrisPiece, GameState } from '@/types/game';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

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
  onStateChange: (state: GameState) => void;
  onGameOver: () => void;
}

export function Tetris({ onStateChange, onGameOver }: TetrisProps) {
  const createEmptyBoard = () => Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));

  const [board, setBoard] = useState<number[][]>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<TetrisPiece | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);

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
            (newY >= 0 && board[newY][newX])
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
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = currentPiece.y + y;
          if (boardY < 0) {
            setGameOver(true);
            onGameOver();
            return;
          }
          newBoard[boardY][currentPiece.x + x] = value;
        }
      });
    });

    // Check for completed lines
    let completedLines = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell)) {
        completedLines++;
        newBoard.splice(y, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
      }
    }

    // Update score
    if (completedLines > 0) {
      const points = [0, 100, 300, 500, 800][completedLines];
      setScore(prev => {
        const newScore = prev + points * level;
        if (newScore > level * 1000) {
          setLevel(l => l + 1);
        }
        return newScore;
      });
    }

    setBoard(newBoard);
    setCurrentPiece(null);
  }, [board, currentPiece, level, onGameOver]);

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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
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
  }, [moveDown, moveHorizontally, rotatePiece]);

  useEffect(() => {
    if (gameOver) return;

    if (!currentPiece) {
      setCurrentPiece(createNewPiece());
      return;
    }

    const interval = setInterval(() => {
      moveDown();
    }, Math.max(100, 1000 - (level * 100)));

    return () => clearInterval(interval);
  }, [currentPiece, gameOver, level, moveDown, createNewPiece]);

  useEffect(() => {
    onStateChange({ board, score, level });
  }, [board, score, level, onStateChange]);

  return (
    <div className="flex flex-col items-center bg-card p-4 rounded-lg">
      <div className="grid grid-cols-10 gap-px bg-primary/20 p-2 rounded h-[400px]"> {/* Added height for visibility */}
        {board.map((row, y) => (
          row.map((cell, x) => {
            let backgroundColor = cell ? TETROMINOS.I.color : 'transparent';

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
              <div
                key={`${y}-${x}`}
                className="w-6 h-6 border border-primary/10"
                style={{ backgroundColor }}
              />
            );
          })
        ))}
      </div>
      <div className="mt-4 text-center">
        <p className="text-primary">Score: {score}</p>
        <p className="text-muted-foreground">Level: {level}</p>
      </div>
    </div>
  );
}