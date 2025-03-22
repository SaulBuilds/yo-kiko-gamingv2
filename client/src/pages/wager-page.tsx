import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function WagerPage() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState("");
  const [betType, setBetType] = useState("xp");

  const createMatchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/matches", {
        betAmount,
        betType,
        gameType: "tetris",
        isPractice: false
      });
      if (!res.ok) throw new Error("Failed to create match");
      return res.json();
    },
    onSuccess: (match) => {
      toast({
        title: "Match Created",
        description: "Waiting for opponent...",
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

  const handleCreateMatch = () => {
    if (!betAmount) {
      toast({
        title: "Error",
        description: "Please enter a bet amount",
        variant: "destructive",
      });
      return;
    }
    createMatchMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="pixel-font text-2xl text-center">Create Wager Match</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Bet Type</Label>
                <RadioGroup
                  defaultValue="xp"
                  onValueChange={setBetType}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="xp" id="xp" />
                    <Label htmlFor="xp">XP Points {user?.xp ? `(${user.xp} available)` : ''}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="crypto" id="crypto" />
                    <Label htmlFor="crypto">Crypto</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Bet Amount</Label>
                <Input
                  type="number"
                  placeholder={betType === 'xp' ? "Enter XP amount" : "Enter ETH amount"}
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0"
                  step={betType === 'xp' ? "1" : "0.001"}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setLocation("/")}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 pixel-font"
                  onClick={handleCreateMatch}
                  disabled={createMatchMutation.isPending}
                >
                  Create Match
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
