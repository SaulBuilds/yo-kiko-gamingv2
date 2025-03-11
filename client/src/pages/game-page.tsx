import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { GameBoard } from "@/components/game/game-board";
import { Spectator } from "@/components/game/spectator";
import { useAuth } from "@/hooks/use-auth";
import { GameState } from "@/types/game";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";

export default function GamePage() {
  const [match] = useRoute("/game/:id");
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [opponentState, setOpponentState] = useState<GameState | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/game-ws`;
    console.log("Connecting to WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connection established");
      ws.send(JSON.stringify({
        type: "join",
        matchId: match?.params.id,
        userId: user.id
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received message:", message);
        if (message.type === "gameState") {
          const states = new Map(message.states);
          const opponentStateData = Array.from(states.entries())
            .find(([id]) => id !== user.id)?.[1];
          if (opponentStateData) {
            setOpponentState(opponentStateData);
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
        toast({
          title: "Error",
          description: "Failed to process game update",
          variant: "destructive",
        });
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to game server",
        variant: "destructive",
      });
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      toast({
        title: "Disconnected",
        description: "Lost connection to game server",
        variant: "destructive",
      });
    };

    setSocket(ws);
    return () => {
      console.log("Cleaning up WebSocket connection");
      ws.close();
    };
  }, [user, match?.params.id, toast]);

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
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Game */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Your Game</h2>
            <GameBoard
              onStateUpdate={handleGameStateUpdate}
              onGameOver={handleGameOver}
            />
          </Card>

          {/* Opponent's Game */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Opponent's Game</h2>
            {opponentState ? (
              <Spectator gameState={opponentState} />
            ) : (
              <div className="text-center text-muted-foreground">
                Waiting for opponent...
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}