import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { GameBoard } from "@/components/game/game-board";
import { Spectator } from "@/components/game/spectator";
import { useAuth } from "@/hooks/use-auth";
import { GameState } from "@/types/game";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";
import { useQuery } from "@tanstack/react-query";

export default function GamePage() {
  const [, params] = useRoute("/game/:id");
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [opponentState, setOpponentState] = useState<GameState | null>(null);
  const { toast } = useToast();

  // Fetch match details
  const { data: match } = useQuery({
    queryKey: ["/api/matches", params?.id],
    enabled: !!params?.id,
  });

  useEffect(() => {
    if (!user || !params?.id) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/game-ws`;
    console.log("Connecting to WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connection established");
      if(params?.id){
        ws.send(JSON.stringify({
          type: "join",
          matchId: parseInt(params.id!),
          userId: user.id
        }));
      }
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
        description: "Lost connection to game server",
        variant: "destructive",
      });
    };

    setSocket(ws);
    return () => {
      console.log("Cleaning up WebSocket connection");
      ws.close();
    };
  }, [user, params?.id, toast]);

  const handleGameStateUpdate = (state: GameState) => {
    setGameState(state);
    if (socket?.readyState === WebSocket.OPEN && params?.id) {
      socket.send(JSON.stringify({
        type: "gameState",
        matchId: parseInt(params.id),
        userId: user?.id,
        state
      }));
    }
  };

  const handleGameOver = () => {
    if (socket?.readyState === WebSocket.OPEN && params?.id) {
      socket.send(JSON.stringify({
        type: "gameOver",
        matchId: parseInt(params.id),
        userId: user?.id
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {match && (
          <div className="mb-4">
            <h1 className="text-2xl font-bold">
              Game Match #{params?.id} - Prize Pool: {match.betAmount} ETH
            </h1>
            <p className="text-muted-foreground">
              Status: {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
            </p>
          </div>
        )}
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