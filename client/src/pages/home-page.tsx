import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { GameMatch, User } from "@shared/schema";
import { Gamepad2, Trophy, Users, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";

export default function HomePage() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: matches } = useQuery<GameMatch[]>({
    queryKey: ["/api/matches"],
  });

  const { data: leaderboard } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
  });

  const games = [
    {
      id: "tetris",
      name: "Tetris Battle",
      description: "Challenge players in real-time Tetris matches",
      icon: "🎮",
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Game Selection */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Gamepad2 className="h-6 w-6" />
                Available Games
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {games.map((game) => (
                  <Card key={game.id} className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="text-2xl">{game.icon}</span>
                          {game.name}
                        </span>
                        <Button 
                          size="sm"
                          onClick={() => setLocation("/game/new")}
                        >
                          Play Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{game.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Active Matches */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="h-6 w-6" />
                Active Matches
              </h2>
              <div className="space-y-4">
                {matches?.map((match) => (
                  <Card key={match.id}>
                    <CardContent className="flex justify-between items-center p-4">
                      <div>
                        <p className="text-lg font-semibold">Prize Pool: {match.betAmount} ETH</p>
                        <p className="text-sm text-muted-foreground">
                          Status: {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                        </p>
                      </div>
                      {match.status === "waiting" && (
                        <Button onClick={() => setLocation(`/game/${match.id}`)}>
                          Join Match
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => setLocation("/game/new")}
                >
                  Create New Match
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Player Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Games Played</span>
                  <span className="font-semibold">{user?.gamesPlayed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Games Won</span>
                  <span className="font-semibold">{user?.gamesWon || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Score</span>
                  <span className="font-semibold">{user?.score || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard?.map((player, index) => (
                    <div key={player.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          #{index + 1}
                        </span>
                        <span>{player.username || player.walletAddress.slice(0, 6)}</span>
                      </div>
                      <span className="font-semibold">{player.score} pts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}