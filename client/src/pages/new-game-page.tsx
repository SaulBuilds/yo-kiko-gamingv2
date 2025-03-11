import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/layout/navbar";

export default function NewGamePage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  // Create practice game by default for now
  const createGameMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/matches", {
        betAmount: "0",
        gameType: "tetris",
        isPractice: true
      });
      if (!res.ok) throw new Error("Failed to create game");
      return res.json();
    },
    onSuccess: (match) => {
      toast({
        title: "Game Created",
        description: "Starting practice game...",
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
            <CardTitle className="pixel-font">Practice Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Practice your skills without betting. Earn XP and improve your gameplay!
              </p>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 pixel-font"
                  onClick={() => setLocation("/")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 pixel-font"
                  disabled={createGameMutation.isPending}
                  onClick={() => createGameMutation.mutate()}
                >
                  Start Game
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}