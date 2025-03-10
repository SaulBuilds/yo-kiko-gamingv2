import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { GameMatch } from "@/types/game";
import { Navbar } from "@/components/layout/navbar";

export default function HomePage() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: matches } = useQuery<GameMatch[]>({
    queryKey: ["/api/matches"],
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Active Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matches?.map((match) => (
                  <div key={match.id} className="flex justify-between items-center p-4 bg-card rounded-lg">
                    <div>
                      <p className="text-primary">Bet Amount: {match.betAmount} ETH</p>
                      <p className="text-muted-foreground">Status: {match.status}</p>
                    </div>
                    {match.status === "waiting" && (
                      <Button onClick={() => setLocation(`/game/${match.id}`)}>
                        Join Game
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  className="w-full"
                  onClick={() => setLocation("/game/new")}
                >
                  Create New Game
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard?.map((player, index) => (
                  <div key={player.id} className="flex justify-between items-center p-2">
                    <span className="font-bold text-primary">#{index + 1}</span>
                    <span>{player.username}</span>
                    <span className="text-muted-foreground">{player.score} pts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
