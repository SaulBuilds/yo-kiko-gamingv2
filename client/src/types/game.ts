export interface GameState {
  board: number[][];
  score: number;
  level: number;
}

export interface GameMatch {
  id: number;
  player1Id: number;
  player2Id: number | null;
  betAmount: string;
  status: 'waiting' | 'in_progress' | 'completed';
  winnerId: number | null;
  startTime: string | null;
  endTime: string | null;
  gameType: string;
}

export interface TetrisPiece {
  shape: number[][];
  x: number;
  y: number;
  color: string;
}
