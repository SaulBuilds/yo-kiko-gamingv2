import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";

export default function NewGamePage() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState("0.01");

  const createGameMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/matches", {
        betAmount,
        gameType: "tetris"
      });
      if (!res.ok) throw new Error("Failed to create game");
      return res.json();
    },
    onSuccess: (match) => {
      toast({
        title: "Game Created",
        description: "Your match has been created successfully!",
      });
      setLocation(`/game/${match.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Create New Game</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createGameMutation.mutate();
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="betAmount">Bet Amount (ETH)</Label>
                <Input
                  id="betAmount"
                  type="number"
                  step="0.01"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0.01"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setLocation("/")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createGameMutation.isPending}
                >
                  Create Match
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
