import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { GameBoard } from "@/components/game/game-board";
import { Chat } from "@/components/game/chat";
import { Spectator } from "@/components/game/spectator";
import { useAuth } from "@/hooks/use-auth";
import { GameState } from "@/types/game";

export default function GamePage() {
  const [match] = useRoute("/game/:id");
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [opponentState, setOpponentState] = useState<GameState | null>(null);

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "join",
        matchId: match?.params.id,
        userId: user.id
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "gameState") {
        const states = new Map(message.states);
        const opponentStateData = Array.from(states.entries())
          .find(([id]) => id !== user.id)?.[1];
        if (opponentStateData) {
          setOpponentState(opponentStateData);
        }
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, [user, match?.params.id]);

  const handleGameStateUpdate = (state: GameState) => {
    setGameState(state);
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "gameState",
        matchId: match?.params.id,
        userId: user?.id,
        state
      }));
    }
  };

  const handleGameOver = () => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "gameOver",
        matchId: match?.params.id,
        userId: user?.id
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <GameBoard
                onStateUpdate={handleGameStateUpdate}
                onGameOver={handleGameOver}
              />
              {opponentState && (
                <Spectator gameState={opponentState} />
              )}
            </div>
          </div>
          <Chat matchId={match?.params.id} />
        </div>
      </div>
    </div>
  );
}
